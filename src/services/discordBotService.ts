import { Client, GatewayIntentBits, Events, TextChannel, GuildMember, Role, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { UserService } from './userService';
import { DatabaseService, COLLECTIONS } from '@/lib/db';
import { PointType, TransactionType, UserRole } from '@/types/enums';

export interface DiscordBotConfig {
  token: string;
  guildId: string;
  ticketChannelIds: string[]; // Channels where users earn tickets
  raffleChannelId: string;
  arenaChannelId: string;
  adminRoleId: string;
  moderatorRoleId: string;
  farmerRoleId: string;
  ticketsPerMessage: number;
  enableRaffles: boolean;
  enableArenaGames: boolean;
}

export interface ActivityReward {
  type: 'message' | 'reaction' | 'voice_time' | 'daily_login' | 'arena_participation';
  tickets: number; // Using tickets instead of points to match actual bot
  soulBoundPoints?: number;
  cooldown?: number;
}

export interface RaffleData {
  id: string;
  title: string;
  prizeTitle: string;
  prizeImageUrl: string;
  endingDateTime: Date;
  maxParticipants: number;
  ticketPrice: number;
  participants: string[];
  ticketsSold: number;
  winnerUserID?: string;
  active: boolean;
  createdAt: Date;
  createdBy: string;
}

export interface ArenaGame {
  id: string;
  roundNumber: number;
  startTime: Date;
  endTime: Date;
  participants: string[];
  autoJoinParticipants: string[];
  winner?: string;
  active: boolean;
  ticketReward: number;
}

export class DiscordBotService {
  private client: Client;
  private config: DiscordBotConfig;
  private userCooldowns: Map<string, Map<string, number>> = new Map();
  private voiceTracking: Map<string, number> = new Map();
  private arenaGameInterval?: NodeJS.Timeout;
  private raffleCheckInterval?: NodeJS.Timeout;

  // Updated activity rewards to match actual bot
  private static readonly ACTIVITY_REWARDS: Record<string, ActivityReward> = {
    ticket_message: { type: 'message', tickets: 1, cooldown: 60000 }, // 1 ticket per message in designated channels
    reaction: { type: 'reaction', tickets: 0.5, cooldown: 30000 },
    voice_minute: { type: 'voice_time', tickets: 2, cooldown: 60000 },
    daily_login: { type: 'daily_login', tickets: 10, soulBoundPoints: 5, cooldown: 86400000 },
    arena_winner: { type: 'arena_participation', tickets: 50, cooldown: 0 }, // Arena winner reward
    arena_participation: { type: 'arena_participation', tickets: 5, cooldown: 0 } // Arena participation reward
  };

  constructor(config: DiscordBotConfig) {
    this.config = config;
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences
      ]
    });

    this.setupEventListeners();
  }

  async initialize(): Promise<void> {
    try {
      await this.client.login(this.config.token);
      console.log('Discord bot initialized successfully');
      
      // Start background processes
      if (this.config.enableArenaGames) {
        this.startArenaGames();
      }
      
      if (this.config.enableRaffles) {
        this.startRaffleMonitoring();
      }
    } catch (error) {
      console.error('Failed to initialize Discord bot:', error);
      throw error;
    }
  }

  private setupEventListeners(): void {
    this.client.once(Events.ClientReady, () => {
      console.log(`Discord bot logged in as ${this.client.user?.tag}`);
      this.registerSlashCommands();
    });

    // Enhanced message handling for ticket rewards
    this.client.on(Events.MessageCreate, async (message) => {
      if (message.author.bot || message.guildId !== this.config.guildId) return;
      
      // Check if message is in a ticket-earning channel
      if (this.config.ticketChannelIds.includes(message.channelId)) {
        await this.handleTicketReward(message.author.id);
      }
    });

    // Button interactions for raffles and auto-join
    this.client.on(Events.InteractionCreate, async (interaction) => {
      if (interaction.isButton()) {
        await this.handleButtonInteraction(interaction);
      } else if (interaction.isChatInputCommand()) {
        await this.handleSlashCommand(interaction);
      }
    });

    // Voice state updates
    this.client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
      await this.handleVoiceStateUpdate(oldState, newState);
    });
  }

  // Ticket reward system (matching actual bot)
  private async handleTicketReward(userId: string): Promise<void> {
    const reward = DiscordBotService.ACTIVITY_REWARDS.ticket_message;
    if (this.isOnCooldown(userId, 'ticket_message', reward.cooldown)) return;

    try {
      const user = await this.getOrCreateUser(userId);
      if (!user) return;

      await UserService.updateUserBalance(
        user.id,
        PointType.REDEEMABLE,
        reward.tickets,
        TransactionType.DISCORD_REWARD,
        'Discord ticket reward for message',
        { activityType: 'ticket_message', discordUserId: userId }
      );

      this.setCooldown(userId, 'ticket_message');
    } catch (error) {
      console.error('Error handling ticket reward:', error);
    }
  }

  // Raffle system implementation
  async createRaffle(
    title: string,
    durationHours: number,
    prizeImageUrl: string,
    prizeTitle: string,
    maxParticipants: number,
    ticketPrice: number,
    createdBy: string
  ): Promise<string> {
    try {
      const raffleId = `raffle_${Date.now()}`;
      const endingDateTime = new Date(Date.now() + (durationHours * 60 * 60 * 1000));

      const raffleData: RaffleData = {
        id: raffleId,
        title,
        prizeTitle,
        prizeImageUrl,
        endingDateTime,
        maxParticipants,
        ticketPrice,
        participants: [],
        ticketsSold: 0,
        active: true,
        createdAt: new Date(),
        createdBy
      };

      // Save to database
      await DatabaseService.create('raffles', raffleData);

      // Create raffle announcement
      await this.announceRaffle(raffleData);

      return raffleId;
    } catch (error) {
      console.error('Error creating raffle:', error);
      throw error;
    }
  }

  private async announceRaffle(raffle: RaffleData): Promise<void> {
    const channel = this.client.channels.cache.get(this.config.raffleChannelId) as TextChannel;
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setTitle(`🎟️ ${raffle.title}`)
      .setDescription(`**Prize:** ${raffle.prizeTitle}\n**Cost:** ${raffle.ticketPrice} tickets\n**Max Participants:** ${raffle.maxParticipants}\n**Ends:** <t:${Math.floor(raffle.endingDateTime.getTime() / 1000)}:R>`)
      .setImage(raffle.prizeImageUrl)
      .setColor('#FFD700')
      .addFields(
        { name: 'Entries', value: `${raffle.ticketsSold}/${raffle.maxParticipants}`, inline: true },
        { name: 'Status', value: raffle.active ? '🟢 Active' : '🔴 Ended', inline: true }
      );

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`join_raffle_${raffle.id}`)
          .setLabel('Join Raffle')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('🎟️')
          .setDisabled(!raffle.active || raffle.ticketsSold >= raffle.maxParticipants)
      );

    await channel.send({ embeds: [embed], components: [row] });
  }

  // Auto-join system for arena games
  async purchaseAutoJoin(userId: string, rounds: number): Promise<boolean> {
    try {
      const user = await this.getOrCreateUser(userId);
      if (!user) return false;

      const cost = rounds * 10; // 10 tickets per auto-join round
      const balance = await UserService.getUserBalance(user.id);

      if (balance.redeemablePoints < cost) {
        return false;
      }

      // Deduct tickets
      await UserService.updateUserBalance(
        user.id,
        PointType.REDEEMABLE,
        -cost,
        TransactionType.PURCHASE,
        `Auto-join purchase for ${rounds} rounds`,
        { rounds, discordUserId: userId }
      );

      // Add auto-join credits to user
      await this.addAutoJoinCredits(userId, rounds);

      return true;
    } catch (error) {
      console.error('Error purchasing auto-join:', error);
      return false;
    }
  }

  private async addAutoJoinCredits(userId: string, rounds: number): Promise<void> {
    // Store auto-join credits in database
    const userDocs = await DatabaseService.getMany(COLLECTIONS.USERS, [
      DatabaseService.where('discordUserId', '==', userId)
    ]);

    if (userDocs.length > 0) {
      const userDoc = userDocs[0] as any;
      const currentCredits = userDoc.autoJoinCredits || 0;
      await DatabaseService.update(COLLECTIONS.USERS, userDoc.id, {
        autoJoinCredits: currentCredits + rounds
      });
    }
  }

  // Ticket Arena game system
  private startArenaGames(): void {
    // Start arena games every 30 minutes
    this.arenaGameInterval = setInterval(async () => {
      await this.startArenaGame();
    }, 30 * 60 * 1000); // 30 minutes

    // Start first game immediately
    setTimeout(() => this.startArenaGame(), 5000);
  }

  private async startArenaGame(): Promise<void> {
    try {
      const channel = this.client.channels.cache.get(this.config.arenaChannelId) as TextChannel;
      if (!channel) return;

      const gameId = `arena_${Date.now()}`;
      const roundNumber = await this.getNextRoundNumber();

      const embed = new EmbedBuilder()
        .setTitle('🏟️ Ticket Arena - Round ' + roundNumber)
        .setDescription('**Web3-themed survival game starting now!**\n\nJoin the arena and fight for survival. Last player standing wins big!')
        .setColor('#FF6B6B')
        .addFields(
          { name: '⏰ Duration', value: '30 minutes', inline: true },
          { name: '🎁 Winner Prize', value: '50 tickets', inline: true },
          { name: '🎫 Participation Reward', value: '5 tickets', inline: true }
        )
        .setFooter({ text: 'Click Join to participate or purchase auto-join for future games!' });

      const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`join_arena_${gameId}`)
            .setLabel('Join Arena')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('⚔️'),
          new ButtonBuilder()
            .setCustomId(`autojoin_purchase`)
            .setLabel('Buy Auto-Join')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('🤖')
        );

      const message = await channel.send({ 
        content: `<@&${this.config.farmerRoleId}> Arena game starting!`,
        embeds: [embed], 
        components: [row] 
      });

      // Create game record
      const arenaGame: ArenaGame = {
        id: gameId,
        roundNumber,
        startTime: new Date(),
        endTime: new Date(Date.now() + 30 * 60 * 1000),
        participants: [],
        autoJoinParticipants: [],
        active: true,
        ticketReward: 50
      };

      await DatabaseService.create('arena_games', arenaGame);

      // End game after 30 minutes
      setTimeout(async () => {
        await this.endArenaGame(gameId, message.id);
      }, 30 * 60 * 1000);

    } catch (error) {
      console.error('Error starting arena game:', error);
    }
  }

  private async endArenaGame(gameId: string, messageId: string): Promise<void> {
    try {
      const games = await DatabaseService.getMany('arena_games', [
        DatabaseService.where('id', '==', gameId)
      ]);

      if (games.length === 0) return;

      const game = games[0] as any as ArenaGame;
      const allParticipants = [...game.participants, ...game.autoJoinParticipants];

      if (allParticipants.length === 0) {
        // No participants
        await this.updateArenaMessage(messageId, game, null);
        return;
      }

      // Pick random winner
      const winnerUserId = allParticipants[Math.floor(Math.random() * allParticipants.length)];
      
      // Reward winner
      await this.rewardArenaWinner(winnerUserId);
      
      // Reward all participants
      for (const participantId of allParticipants) {
        if (participantId !== winnerUserId) {
          await this.rewardArenaParticipant(participantId);
        }
      }

      // Update game record
      await DatabaseService.update('arena_games', games[0].id, {
        active: false,
        winner: winnerUserId
      });

      // Update message
      await this.updateArenaMessage(messageId, game, winnerUserId);

    } catch (error) {
      console.error('Error ending arena game:', error);
    }
  }

  private async rewardArenaWinner(userId: string): Promise<void> {
    const user = await this.getOrCreateUser(userId);
    if (!user) return;

    const reward = DiscordBotService.ACTIVITY_REWARDS.arena_winner;
    await UserService.updateUserBalance(
      user.id,
      PointType.REDEEMABLE,
      reward.tickets,
      TransactionType.GAME_REWARD,
      'Arena game winner reward',
      { activityType: 'arena_winner', discordUserId: userId }
    );
  }

  private async rewardArenaParticipant(userId: string): Promise<void> {
    const user = await this.getOrCreateUser(userId);
    if (!user) return;

    const reward = DiscordBotService.ACTIVITY_REWARDS.arena_participation;
    await UserService.updateUserBalance(
      user.id,
      PointType.REDEEMABLE,
      reward.tickets,
      TransactionType.GAME_REWARD,
      'Arena game participation reward',
      { activityType: 'arena_participation', discordUserId: userId }
    );
  }

  // Button interaction handling
  private async handleButtonInteraction(interaction: any): Promise<void> {
    const { customId, user } = interaction;

    if (customId.startsWith('join_raffle_')) {
      await this.handleRaffleJoin(interaction);
    } else if (customId.startsWith('join_arena_')) {
      await this.handleArenaJoin(interaction);
    } else if (customId === 'autojoin_purchase') {
      await this.handleAutoJoinPurchase(interaction);
    }
  }

  private async handleArenaJoin(interaction: any): Promise<void> {
    const gameId = interaction.customId.replace('join_arena_', '');
    const userId = interaction.user.id;

    try {
      const games = await DatabaseService.getMany('arena_games', [
        DatabaseService.where('id', '==', gameId)
      ]);

      if (games.length === 0) {
        await interaction.reply({ content: 'Arena game not found!', ephemeral: true });
        return;
      }

      const game = games[0] as any as ArenaGame;

      if (!game.active) {
        await interaction.reply({ content: 'This arena game has ended!', ephemeral: true });
        return;
      }

      if (game.participants.includes(userId) || game.autoJoinParticipants.includes(userId)) {
        await interaction.reply({ content: 'You have already joined this arena game!', ephemeral: true });
        return;
      }

      // Add user to participants
      await DatabaseService.update('arena_games', games[0].id, {
        participants: [...game.participants, userId]
      });

      await interaction.reply({ 
        content: `⚔️ Successfully joined Arena Round ${game.roundNumber}! Good luck!`, 
        ephemeral: true 
      });

    } catch (error) {
      console.error('Error handling arena join:', error);
      await interaction.reply({ content: 'An error occurred while joining the arena.', ephemeral: true });
    }
  }

  private async handleAutoJoinPurchase(interaction: any): Promise<void> {
    const userId = interaction.user.id;

    try {
      // Default to purchasing 5 auto-join rounds
      const rounds = 5;
      const success = await this.purchaseAutoJoin(userId, rounds);

      if (success) {
        await interaction.reply({ 
          content: `🤖 Successfully purchased ${rounds} auto-join credits for ${rounds * 10} tickets! You will automatically join the next ${rounds} arena games.`, 
          ephemeral: true 
        });
      } else {
        await interaction.reply({ 
          content: `❌ Insufficient tickets! You need ${rounds * 10} tickets to purchase ${rounds} auto-join credits.`, 
          ephemeral: true 
        });
      }

    } catch (error) {
      console.error('Error handling auto-join purchase:', error);
      await interaction.reply({ content: 'An error occurred while purchasing auto-join.', ephemeral: true });
    }
  }

  private async handleRaffleJoin(interaction: any): Promise<void> {
    const raffleId = interaction.customId.replace('join_raffle_', '');
    const userId = interaction.user.id;

    try {
      const raffles = await DatabaseService.getMany('raffles', [
        DatabaseService.where('id', '==', raffleId)
      ]);

      if (raffles.length === 0) {
        await interaction.reply({ content: 'Raffle not found!', ephemeral: true });
        return;
      }

      const raffle = raffles[0] as any as RaffleData;

      if (!raffle.active || new Date() > raffle.endingDateTime) {
        await interaction.reply({ content: 'This raffle has ended!', ephemeral: true });
        return;
      }

      if (raffle.participants.includes(userId)) {
        await interaction.reply({ content: 'You have already entered this raffle!', ephemeral: true });
        return;
      }

      if (raffle.ticketsSold >= raffle.maxParticipants) {
        await interaction.reply({ content: 'This raffle is full!', ephemeral: true });
        return;
      }

      // Check user balance
      const user = await this.getOrCreateUser(userId);
      if (!user) {
        await interaction.reply({ content: 'User account not found!', ephemeral: true });
        return;
      }

      const balance = await UserService.getUserBalance(user.id);
      if (balance.redeemablePoints < raffle.ticketPrice) {
        await interaction.reply({ 
          content: `Insufficient tickets! You need ${raffle.ticketPrice} tickets but only have ${balance.redeemablePoints}.`, 
          ephemeral: true 
        });
        return;
      }

      // Deduct tickets and add to raffle
      await UserService.updateUserBalance(
        user.id,
        PointType.REDEEMABLE,
        -raffle.ticketPrice,
        TransactionType.RAFFLE_ENTRY,
        `Raffle entry: ${raffle.title}`,
        { raffleId, discordUserId: userId }
      );

      // Update raffle
      await DatabaseService.update('raffles', raffles[0].id, {
        participants: [...raffle.participants, userId],
        ticketsSold: raffle.ticketsSold + 1
      });

      await interaction.reply({ 
        content: `✅ Successfully entered the raffle "${raffle.title}" for ${raffle.ticketPrice} tickets!`, 
        ephemeral: true 
      });

    } catch (error) {
      console.error('Error handling raffle join:', error);
      await interaction.reply({ content: 'An error occurred while joining the raffle.', ephemeral: true });
    }
  }

  // Slash command registration and handling
  private async registerSlashCommands(): Promise<void> {
    const commands = [
      {
        name: 'createraffle',
        description: 'Create a new raffle',
        options: [
          { name: 'title', description: 'Raffle title', type: 3, required: true },
          { name: 'duration_hours', description: 'Duration in hours (1-168)', type: 4, required: true },
          { name: 'prize_image_url', description: 'Prize image URL', type: 3, required: true },
          { name: 'prize_title', description: 'Prize description', type: 3, required: true },
          { name: 'max_participants', description: 'Maximum participants', type: 4, required: true },
          { name: 'ticket_price', description: 'Ticket price', type: 4, required: true }
        ]
      },
      {
        name: 'endraffle',
        description: 'End a raffle and pick winner',
        options: [
          { name: 'raffle_id', description: 'Raffle ID', type: 3, required: true }
        ]
      },
      {
        name: 'viewraffles',
        description: 'View all active raffles'
      },
      {
        name: 'balance',
        description: 'Check user balance',
        options: [
          { name: 'user', description: 'User to check (optional)', type: 6, required: false }
        ]
      },
      {
        name: 'award',
        description: 'Award tickets to user (Admin only)',
        options: [
          { name: 'user', description: 'User to award', type: 6, required: true },
          { name: 'tickets', description: 'Number of tickets', type: 4, required: true },
          { name: 'reason', description: 'Reason for award', type: 3, required: false }
        ]
      }
    ];

    await this.client.application?.commands.set(commands);
  }

  private async handleSlashCommand(interaction: any): Promise<void> {
    const { commandName, options, member } = interaction;

    // Check admin permissions for admin commands
    const isAdmin = member.roles.cache.has(this.config.adminRoleId);

    switch (commandName) {
      case 'createraffle':
        if (!isAdmin) {
          await interaction.reply({ content: 'Only admins can create raffles!', ephemeral: true });
          return;
        }
        await this.handleCreateRaffleCommand(interaction, options);
        break;
      case 'endraffle':
        if (!isAdmin) {
          await interaction.reply({ content: 'Only admins can end raffles!', ephemeral: true });
          return;
        }
        await this.handleEndRaffleCommand(interaction, options);
        break;
      case 'viewraffles':
        await this.handleViewRafflesCommand(interaction);
        break;
      case 'balance':
        await this.handleBalanceCommand(interaction, options);
        break;
      case 'award':
        if (!isAdmin) {
          await interaction.reply({ content: 'Only admins can award tickets!', ephemeral: true });
          return;
        }
        await this.handleAwardCommand(interaction, options);
        break;
    }
  }

  // Raffle monitoring for automatic ending
  private startRaffleMonitoring(): void {
    this.raffleCheckInterval = setInterval(async () => {
      await this.checkExpiredRaffles();
    }, 5 * 60 * 1000); // Check every 5 minutes
  }

  private async checkExpiredRaffles(): Promise<void> {
    try {
      const activeRaffles = await DatabaseService.getMany('raffles', [
        DatabaseService.where('active', '==', true)
      ]);

      const now = new Date();

             for (const raffleDoc of activeRaffles) {
         const raffle = raffleDoc as any as RaffleData;
         if (now > raffle.endingDateTime) {
          await this.endRaffle(raffle.id);
        }
      }
    } catch (error) {
      console.error('Error checking expired raffles:', error);
    }
  }

  private async endRaffle(raffleId: string): Promise<string | null> {
    try {
      const raffles = await DatabaseService.getMany('raffles', [
        DatabaseService.where('id', '==', raffleId)
      ]);

      if (raffles.length === 0) return null;

      const raffle = raffles[0] as any as RaffleData;

      if (raffle.participants.length === 0) {
        // No participants
        await DatabaseService.update('raffles', raffles[0].id, {
          active: false
        });
        return null;
      }

      // Pick random winner
      const winnerUserId = raffle.participants[Math.floor(Math.random() * raffle.participants.length)];

      // Update raffle
      await DatabaseService.update('raffles', raffles[0].id, {
        active: false,
        winnerUserID: winnerUserId
      });

      // Announce winner
      await this.announceRaffleWinner(raffle, winnerUserId);

      return winnerUserId;
    } catch (error) {
      console.error('Error ending raffle:', error);
      return null;
    }
  }

  private async announceRaffleWinner(raffle: RaffleData, winnerUserId: string): Promise<void> {
    const channel = this.client.channels.cache.get(this.config.raffleChannelId) as TextChannel;
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setTitle(`🎉 Raffle Winner: ${raffle.title}`)
      .setDescription(`**Winner:** <@${winnerUserId}>\n**Prize:** ${raffle.prizeTitle}`)
      .setImage(raffle.prizeImageUrl)
      .setColor('#00FF00')
      .addFields(
        { name: 'Total Entries', value: raffle.participants.length.toString(), inline: true },
        { name: 'Ticket Price', value: raffle.ticketPrice.toString(), inline: true }
      );

    await channel.send({ embeds: [embed] });
  }

  // Helper methods
  private async getOrCreateUser(discordUserId: string): Promise<any | null> {
    try {
      const users = await DatabaseService.getMany(COLLECTIONS.USERS, [
        DatabaseService.where('discordUserId', '==', discordUserId)
      ]);

      if (users.length > 0) {
        return users[0];
      }

      // Create new user
      const member = await this.client.guilds.cache.get(this.config.guildId)?.members.fetch(discordUserId);
      if (!member) return null;

      const newUser = {
        discordUserId,
        displayName: member.displayName || member.user.username,
        email: '',
        redeemablePoints: 0, // Start with 0 tickets
        soulBoundPoints: 0,
        roles: [UserRole.USER],
        isActive: true,
        autoJoinCredits: 0,
        discordRoles: member.roles.cache.map(role => ({
          id: role.id,
          name: role.name,
          color: role.hexColor
        }))
      };

      return await DatabaseService.create(COLLECTIONS.USERS, newUser);
    } catch (error) {
      console.error('Error getting/creating user:', error);
      return null;
    }
  }

  private isOnCooldown(userId: string, activity: string, cooldownMs?: number): boolean {
    if (!cooldownMs) return false;

    const userCooldowns = this.userCooldowns.get(userId);
    if (!userCooldowns) return false;

    const lastActivity = userCooldowns.get(activity);
    if (!lastActivity) return false;

    return Date.now() - lastActivity < cooldownMs;
  }

  private setCooldown(userId: string, activity: string): void {
    if (!this.userCooldowns.has(userId)) {
      this.userCooldowns.set(userId, new Map());
    }
    this.userCooldowns.get(userId)!.set(activity, Date.now());
  }

  private async getNextRoundNumber(): Promise<number> {
    const games = await DatabaseService.getMany('arena_games', [
      DatabaseService.orderBy('roundNumber', 'desc'),
      DatabaseService.limit(1)
    ]);

    return games.length > 0 ? (games[0] as any as ArenaGame).roundNumber + 1 : 1;
  }

  private async updateArenaMessage(messageId: string, game: ArenaGame, winner: string | null): Promise<void> {
    const channel = this.client.channels.cache.get(this.config.arenaChannelId) as TextChannel;
    if (!channel) return;

    try {
      const message = await channel.messages.fetch(messageId);
      const embed = new EmbedBuilder()
        .setTitle(`🏟️ Ticket Arena - Round ${game.roundNumber} [ENDED]`)
        .setDescription('**Game has ended!**')
        .setColor('#808080');

      if (winner) {
        embed.addFields(
          { name: '🏆 Winner', value: `<@${winner}>`, inline: true },
          { name: '🎁 Prize', value: '50 tickets', inline: true },
          { name: '👥 Participants', value: (game.participants.length + game.autoJoinParticipants.length).toString(), inline: true }
        );
      } else {
        embed.addFields(
          { name: '😔 Result', value: 'No participants', inline: true }
        );
      }

      await message.edit({ embeds: [embed], components: [] });
    } catch (error) {
      console.error('Error updating arena message:', error);
    }
  }

  // Command handlers
  private async handleCreateRaffleCommand(interaction: any, options: any): Promise<void> {
    const title = options.getString('title');
    const duration = options.getInteger('duration_hours');
    const prizeImageUrl = options.getString('prize_image_url');
    const prizeTitle = options.getString('prize_title');
    const maxParticipants = options.getInteger('max_participants');
    const ticketPrice = options.getInteger('ticket_price');

    if (duration < 1 || duration > 168) {
      await interaction.reply({ content: 'Duration must be between 1 and 168 hours!', ephemeral: true });
      return;
    }

    try {
      const raffleId = await this.createRaffle(
        title,
        duration,
        prizeImageUrl,
        prizeTitle,
        maxParticipants,
        ticketPrice,
        interaction.user.id
      );

      await interaction.reply({ 
        content: `✅ Raffle "${title}" created successfully! ID: ${raffleId}`, 
        ephemeral: true 
      });
    } catch (error) {
      await interaction.reply({ content: 'Error creating raffle!', ephemeral: true });
    }
  }

  private async handleEndRaffleCommand(interaction: any, options: any): Promise<void> {
    const raffleId = options.getString('raffle_id');

    try {
      const winner = await this.endRaffle(raffleId);
      
      if (winner) {
        await interaction.reply({ content: `✅ Raffle ended! Winner: <@${winner}>` });
      } else {
        await interaction.reply({ content: '✅ Raffle ended with no participants.' });
      }
    } catch (error) {
      await interaction.reply({ content: 'Error ending raffle!', ephemeral: true });
    }
  }

  private async handleViewRafflesCommand(interaction: any): Promise<void> {
    try {
      const activeRaffles = await DatabaseService.getMany('raffles', [
        DatabaseService.where('active', '==', true)
      ]);

      if (activeRaffles.length === 0) {
        await interaction.reply({ content: 'No active raffles found.', ephemeral: true });
        return;
      }

      let raffleList = '**🎟️ Active Raffles:**\n\n';
      
             for (const raffleDoc of activeRaffles) {
         const raffle = raffleDoc as any as RaffleData;
         raffleList += `**${raffle.title}** (ID: ${raffle.id})\n`;
        raffleList += `Prize: ${raffle.prizeTitle}\n`;
        raffleList += `Entries: ${raffle.ticketsSold}/${raffle.maxParticipants}\n`;
        raffleList += `Price: ${raffle.ticketPrice} tickets\n`;
        raffleList += `Ends: <t:${Math.floor(raffle.endingDateTime.getTime() / 1000)}:R>\n\n`;
      }

      await interaction.reply({ content: raffleList, ephemeral: true });
    } catch (error) {
      await interaction.reply({ content: 'Error fetching raffles!', ephemeral: true });
    }
  }

  private async handleBalanceCommand(interaction: any, options: any): Promise<void> {
    const targetUser = options.getUser('user') || interaction.user;

    try {
      const user = await this.getOrCreateUser(targetUser.id);
      if (!user) {
        await interaction.reply({ content: 'User not found!', ephemeral: true });
        return;
      }

      const balance = await UserService.getUserBalance(user.id);
      
      await interaction.reply({
        content: `**${targetUser.displayName}'s Balance:**\n🎫 Tickets: ${balance.redeemablePoints}\n⚡ Soul-Bound Points: ${balance.soulBoundPoints}\n🤖 Auto-Join Credits: ${user.autoJoinCredits || 0}`,
        ephemeral: true
      });
    } catch (error) {
      await interaction.reply({ content: 'Error checking balance!', ephemeral: true });
    }
  }

  private async handleAwardCommand(interaction: any, options: any): Promise<void> {
    const targetUser = options.getUser('user');
    const tickets = options.getInteger('tickets');
    const reason = options.getString('reason') || 'Admin award';

    try {
      const user = await this.getOrCreateUser(targetUser.id);
      if (!user) {
        await interaction.reply({ content: 'User not found!', ephemeral: true });
        return;
      }

      await UserService.updateUserBalance(
        user.id,
        PointType.REDEEMABLE,
        tickets,
        TransactionType.ADMIN_ADJUSTMENT,
        reason,
        { 
          adminUserId: interaction.user.id,
          discordUserId: targetUser.id,
          command: 'award'
        }
      );

      await interaction.reply({
        content: `✅ Successfully awarded ${tickets} tickets to ${targetUser.displayName} for: ${reason}`
      });
    } catch (error) {
      await interaction.reply({ content: 'Error awarding tickets!', ephemeral: true });
    }
  }

  // Voice state handling (unchanged)
  private async handleVoiceStateUpdate(oldState: any, newState: any): Promise<void> {
    const userId = newState.id;
    
    if (!oldState.channelId && newState.channelId) {
      this.voiceTracking.set(userId, Date.now());
    }
    
    if (oldState.channelId && !newState.channelId) {
      const startTime = this.voiceTracking.get(userId);
      if (startTime) {
        const duration = Date.now() - startTime;
        const minutes = Math.floor(duration / 60000);
        
        if (minutes >= 1) {
          await this.rewardVoiceTime(userId, minutes);
        }
        
        this.voiceTracking.delete(userId);
      }
    }
  }

  private async rewardVoiceTime(userId: string, minutes: number): Promise<void> {
    const user = await this.getOrCreateUser(userId);
    if (!user) return;

    const reward = DiscordBotService.ACTIVITY_REWARDS.voice_minute;
    const totalTickets = reward.tickets * minutes;

    await UserService.updateUserBalance(
      user.id,
      PointType.REDEEMABLE,
      totalTickets,
      TransactionType.DISCORD_REWARD,
      `Discord voice activity (${minutes} minutes)`,
      { activityType: 'voice_time', minutes, discordUserId: userId }
    );
  }

  async shutdown(): Promise<void> {
    if (this.arenaGameInterval) {
      clearInterval(this.arenaGameInterval);
    }
    
    if (this.raffleCheckInterval) {
      clearInterval(this.raffleCheckInterval);
    }
    
    this.client.destroy();
  }
}

// Factory function to create bot instance
export const createDiscordBot = (config: DiscordBotConfig): DiscordBotService => {
  return new DiscordBotService(config);
};