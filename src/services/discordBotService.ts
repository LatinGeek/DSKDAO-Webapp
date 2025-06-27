import { Client, GatewayIntentBits, Events, TextChannel, GuildMember, Role } from 'discord.js';
import { UserService } from './userService';
import { DatabaseService, COLLECTIONS } from '@/lib/db';
import { PointType, TransactionType, UserRole } from '@/types/enums';

export interface DiscordBotConfig {
  token: string;
  guildId: string;
  pointsChannelId?: string;
  adminRoleId: string;
  moderatorRoleId: string;
  activityMultiplier: number;
}

export interface ActivityReward {
  type: 'message' | 'reaction' | 'voice_time' | 'daily_login';
  points: number;
  soulBoundPoints?: number;
  cooldown?: number; // in milliseconds
}

export class DiscordBotService {
  private client: Client;
  private config: DiscordBotConfig;
  private userCooldowns: Map<string, Map<string, number>> = new Map();
  private voiceTracking: Map<string, number> = new Map();

  // Default activity rewards
  private static readonly ACTIVITY_REWARDS: Record<string, ActivityReward> = {
    message: { type: 'message', points: 1, cooldown: 60000 }, // 1 point per message, 1 min cooldown
    reaction: { type: 'reaction', points: 0.5, cooldown: 30000 }, // 0.5 points per reaction, 30s cooldown
    voice_minute: { type: 'voice_time', points: 2, cooldown: 60000 }, // 2 points per minute in voice
    daily_login: { type: 'daily_login', points: 10, soulBoundPoints: 5, cooldown: 86400000 } // Daily bonus
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
    } catch (error) {
      console.error('Failed to initialize Discord bot:', error);
      throw error;
    }
  }

  private setupEventListeners(): void {
    // Bot ready event
    this.client.once(Events.ClientReady, () => {
      console.log(`Discord bot logged in as ${this.client.user?.tag}`);
      this.startVoiceTimeTracking();
    });

    // Message events for point rewards
    this.client.on(Events.MessageCreate, async (message) => {
      if (message.author.bot || message.guildId !== this.config.guildId) return;
      await this.handleMessageActivity(message.author.id);
    });

    // Reaction events
    this.client.on(Events.MessageReactionAdd, async (reaction, user) => {
      if (user.bot || reaction.message.guildId !== this.config.guildId) return;
      await this.handleReactionActivity(user.id);
    });

    // Voice state updates for voice time tracking
    this.client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
      await this.handleVoiceStateUpdate(oldState, newState);
    });

    // Member updates for role synchronization
    this.client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
      await this.handleRoleSync(newMember);
    });

    // Member join for daily login bonus
    this.client.on(Events.PresenceUpdate, async (oldPresence, newPresence) => {
      if (newPresence?.status === 'online' && oldPresence?.status === 'offline') {
        await this.handleDailyLoginBonus(newPresence.userId);
      }
    });

    // Slash commands
    this.client.on(Events.InteractionCreate, async (interaction) => {
      if (interaction.isChatInputCommand()) {
        await this.handleSlashCommand(interaction);
      }
    });
  }

  // Activity reward handlers
  private async handleMessageActivity(userId: string): Promise<void> {
    const reward = DiscordBotService.ACTIVITY_REWARDS.message;
    if (this.isOnCooldown(userId, 'message', reward.cooldown)) return;

    try {
      const user = await this.getOrCreateUser(userId);
      if (!user) return;

      await UserService.updateUserBalance(
        user.id,
        PointType.REDEEMABLE,
        reward.points,
        TransactionType.DISCORD_REWARD,
        'Discord message activity',
        { activityType: 'message', discordUserId: userId }
      );

      this.setCooldown(userId, 'message');
    } catch (error) {
      console.error('Error handling message activity:', error);
    }
  }

  private async handleReactionActivity(userId: string): Promise<void> {
    const reward = DiscordBotService.ACTIVITY_REWARDS.reaction;
    if (this.isOnCooldown(userId, 'reaction', reward.cooldown)) return;

    try {
      const user = await this.getOrCreateUser(userId);
      if (!user) return;

      await UserService.updateUserBalance(
        user.id,
        PointType.REDEEMABLE,
        reward.points,
        TransactionType.DISCORD_REWARD,
        'Discord reaction activity',
        { activityType: 'reaction', discordUserId: userId }
      );

      this.setCooldown(userId, 'reaction');
    } catch (error) {
      console.error('Error handling reaction activity:', error);
    }
  }

  private async handleVoiceStateUpdate(oldState: any, newState: any): Promise<void> {
    const userId = newState.id;
    
    // User joined voice channel
    if (!oldState.channelId && newState.channelId) {
      this.voiceTracking.set(userId, Date.now());
    }
    
    // User left voice channel
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
    const reward = DiscordBotService.ACTIVITY_REWARDS.voice_minute;
    
    try {
      const user = await this.getOrCreateUser(userId);
      if (!user) return;

      const totalPoints = reward.points * minutes;

      await UserService.updateUserBalance(
        user.id,
        PointType.REDEEMABLE,
        totalPoints,
        TransactionType.DISCORD_REWARD,
        `Discord voice activity (${minutes} minutes)`,
        { activityType: 'voice_time', minutes, discordUserId: userId }
      );
    } catch (error) {
      console.error('Error rewarding voice time:', error);
    }
  }

  private async handleDailyLoginBonus(userId: string): Promise<void> {
    const reward = DiscordBotService.ACTIVITY_REWARDS.daily_login;
    if (this.isOnCooldown(userId, 'daily_login', reward.cooldown)) return;

    try {
      const user = await this.getOrCreateUser(userId);
      if (!user) return;

      // Award redeemable points
      await UserService.updateUserBalance(
        user.id,
        PointType.REDEEMABLE,
        reward.points,
        TransactionType.DISCORD_REWARD,
        'Daily login bonus',
        { activityType: 'daily_login', discordUserId: userId }
      );

      // Award soul-bound points if specified
      if (reward.soulBoundPoints) {
        await UserService.updateUserBalance(
          user.id,
          PointType.SOUL_BOUND,
          reward.soulBoundPoints,
          TransactionType.DISCORD_REWARD,
          'Daily login soul-bound bonus',
          { activityType: 'daily_login_sb', discordUserId: userId }
        );
      }

      this.setCooldown(userId, 'daily_login');
    } catch (error) {
      console.error('Error handling daily login bonus:', error);
    }
  }

  // Role synchronization
  private async handleRoleSync(member: GuildMember): Promise<void> {
    try {
      const user = await this.getOrCreateUser(member.id);
      if (!user) return;

      const userRoles = this.mapDiscordRolesToUserRoles(member.roles.cache);
      
      // Update user roles in database
      await UserService.updateUserRoles(user.id, userRoles);
      
      // Update Discord roles in user profile
      const discordRoles = member.roles.cache.map(role => ({
        id: role.id,
        name: role.name,
        color: role.hexColor
      }));

      await UserService.syncDiscordRoles(user.id, discordRoles);
    } catch (error) {
      console.error('Error synchronizing roles:', error);
    }
  }

  private mapDiscordRolesToUserRoles(roles: any): UserRole[] {
    const userRoles: UserRole[] = [UserRole.USER]; // Default role

    if (roles.has(this.config.adminRoleId)) {
      userRoles.push(UserRole.ADMIN);
    }
    
    if (roles.has(this.config.moderatorRoleId)) {
      userRoles.push(UserRole.MODERATOR);
    }

    return userRoles;
  }

  // Slash command handling
  private async handleSlashCommand(interaction: any): Promise<void> {
    if (!interaction.member.roles.cache.has(this.config.adminRoleId)) {
      await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
      return;
    }

    const { commandName, options } = interaction;

    switch (commandName) {
      case 'award-points':
        await this.handleAwardPointsCommand(interaction, options);
        break;
      case 'check-balance':
        await this.handleCheckBalanceCommand(interaction, options);
        break;
      case 'leaderboard':
        await this.handleLeaderboardCommand(interaction);
        break;
      default:
        await interaction.reply({ content: 'Unknown command.', ephemeral: true });
    }
  }

  private async handleAwardPointsCommand(interaction: any, options: any): Promise<void> {
    const targetUser = options.getUser('user');
    const points = options.getInteger('points');
    const reason = options.getString('reason') || 'Admin award';
    const soulBound = options.getBoolean('soul-bound') || false;

    try {
      const user = await this.getOrCreateUser(targetUser.id);
      if (!user) {
        await interaction.reply({ content: 'User not found in system.', ephemeral: true });
        return;
      }

      const pointType = soulBound ? PointType.SOUL_BOUND : PointType.REDEEMABLE;
      
      await UserService.updateUserBalance(
        user.id,
        pointType,
        points,
        TransactionType.ADMIN_ADJUSTMENT,
        reason,
        { 
          adminUserId: interaction.user.id,
          discordUserId: targetUser.id,
          command: 'award-points'
        }
      );

      await interaction.reply({
        content: `Successfully awarded ${points} ${soulBound ? 'soul-bound' : 'redeemable'} points to ${targetUser.displayName} for: ${reason}`
      });
    } catch (error) {
      console.error('Error in award-points command:', error);
      await interaction.reply({ content: 'Failed to award points.', ephemeral: true });
    }
  }

  private async handleCheckBalanceCommand(interaction: any, options: any): Promise<void> {
    const targetUser = options.getUser('user') || interaction.user;

    try {
      const user = await this.getOrCreateUser(targetUser.id);
      if (!user) {
        await interaction.reply({ content: 'User not found in system.', ephemeral: true });
        return;
      }

      const balance = await UserService.getUserBalance(user.id);
      
      await interaction.reply({
        content: `**${targetUser.displayName}'s Balance:**\n💎 Redeemable: ${balance.redeemablePoints}\n⚡ Soul-Bound: ${balance.soulBoundPoints}`,
        ephemeral: true
      });
    } catch (error) {
      console.error('Error in check-balance command:', error);
      await interaction.reply({ content: 'Failed to check balance.', ephemeral: true });
    }
  }

  private async handleLeaderboardCommand(interaction: any): Promise<void> {
    try {
      // Get top 10 users by redeemable points
      const topUsers = await DatabaseService.getMany(
        COLLECTIONS.USERS,
        [
          DatabaseService.orderBy('redeemablePoints', 'desc'),
          DatabaseService.limit(10)
        ]
      );

      let leaderboard = '**🏆 Points Leaderboard (Top 10)**\n\n';
      
      for (let i = 0; i < topUsers.length; i++) {
        const user = topUsers[i];
        const member = await this.client.guilds.cache.get(this.config.guildId)?.members.fetch(user.discordUserId);
        const displayName = member?.displayName || user.displayName || 'Unknown User';
        
        leaderboard += `${i + 1}. ${displayName}: ${user.redeemablePoints} points\n`;
      }

      await interaction.reply({ content: leaderboard });
    } catch (error) {
      console.error('Error in leaderboard command:', error);
      await interaction.reply({ content: 'Failed to generate leaderboard.', ephemeral: true });
    }
  }

  // Helper methods
  private async getOrCreateUser(discordUserId: string): Promise<any | null> {
    try {
      // Try to find existing user
      let user = await DatabaseService.getMany(
        COLLECTIONS.USERS,
        [DatabaseService.where('discordUserId', '==', discordUserId)]
      );

      if (user.length > 0) {
        return user[0];
      }

      // Create new user if not found
      const member = await this.client.guilds.cache.get(this.config.guildId)?.members.fetch(discordUserId);
      if (!member) return null;

      const newUser = {
        discordUserId,
        displayName: member.displayName || member.user.username,
        email: '', // Will be filled when they connect
        redeemablePoints: 0,
        soulBoundPoints: 0,
        roles: [UserRole.USER],
        isActive: true,
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

  private startVoiceTimeTracking(): void {
    // Check every minute for users who might have been in voice when bot started
    setInterval(() => {
      const guild = this.client.guilds.cache.get(this.config.guildId);
      if (!guild) return;

      guild.voiceStates.cache.forEach((voiceState) => {
        if (voiceState.channelId && !this.voiceTracking.has(voiceState.id)) {
          this.voiceTracking.set(voiceState.id, Date.now());
        }
      });
    }, 60000);
  }

  // Public methods for manual operations
  async manualPointAward(discordUserId: string, points: number, pointType: PointType, reason: string): Promise<void> {
    const user = await this.getOrCreateUser(discordUserId);
    if (!user) throw new Error('User not found');

    await UserService.updateUserBalance(
      user.id,
      pointType,
      points,
      TransactionType.ADMIN_ADJUSTMENT,
      reason,
      { discordUserId, manual: true }
    );
  }

  async getUserStats(discordUserId: string): Promise<any> {
    const user = await this.getOrCreateUser(discordUserId);
    if (!user) return null;

    return await UserService.getUserBalance(user.id);
  }

  async shutdown(): Promise<void> {
    this.client.destroy();
  }
}

// Initialize and export bot instance
export const initializeDiscordBot = (config: DiscordBotConfig): DiscordBotService => {
  return new DiscordBotService(config);
};