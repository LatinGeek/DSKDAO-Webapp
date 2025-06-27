import { DatabaseService, COLLECTIONS } from '@/lib/db';
import { UserService } from './userService';
import { 
  Game, 
  GameSession, 
  PlinkoGame, 
  PlinkoSession, 
  PlinkoSettings, 
  PlinkoGameData,
  PlayGameRequest,
  PlayGameResponse,
  PlinkoPlayRequest,
  PlinkoPlayResponse,
  GameType,
  GameStats,
  LeaderboardEntry
} from '@/types/entities/game';
import { GameResult, TransactionType, PointType } from '@/types/enums';

export class GameError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GameError';
  }
}

export class GameService {
  // Get all active games
  static async getActiveGames(): Promise<Game[]> {
    try {
      return await DatabaseService.getMany<Game>(
        COLLECTIONS.GAMES,
        [DatabaseService.where('isActive', '==', true)]
      );
    } catch (error) {
      console.error('Error getting active games:', error);
      throw new GameError('Failed to get active games');
    }
  }

  // Get game by ID
  static async getGameById(gameId: string): Promise<Game | null> {
    try {
      return await DatabaseService.getById<Game>(COLLECTIONS.GAMES, gameId);
    } catch (error) {
      console.error('Error getting game by ID:', error);
      throw new GameError('Failed to get game');
    }
  }

  // Play Plinko game
  static async playPlinko(request: PlinkoPlayRequest): Promise<PlinkoPlayResponse> {
    const { gameId, userId, betAmount, gameSpecificData } = request;

    try {
      return await DatabaseService.runTransaction(async (transaction) => {
        // Get the game
        const game = await DatabaseService.getById<PlinkoGame>(COLLECTIONS.GAMES, gameId);
        if (!game) {
          throw new GameError('Game not found');
        }

        if (!game.isActive) {
          throw new GameError('Game is not active');
        }

        if (game.type !== GameType.PLINKO) {
          throw new GameError('Invalid game type for Plinko');
        }

        // Validate bet amount
        if (betAmount < game.minBet || betAmount > game.maxBet) {
          throw new GameError(`Bet amount must be between ${game.minBet} and ${game.maxBet}`);
        }

        // Check user balance
        const hasInsufficientBalance = await UserService.hasInsufficientBalance(
          userId,
          PointType.REDEEMABLE,
          betAmount
        );

        if (hasInsufficientBalance) {
          throw new GameError('Insufficient redeemable points');
        }

        // Get Plinko settings
        const settings = game.settings as PlinkoSettings;
        const { riskLevel } = gameSpecificData;

        // Generate Plinko game result
        const gameData = this.generatePlinkoResult(settings, riskLevel);
        const winAmount = Math.floor(betAmount * gameData.multiplier);
        const result = winAmount > 0 ? GameResult.WIN : GameResult.LOSE;

        // Create game session
        const session: Omit<PlinkoSession, 'id' | 'playedAt' | 'completedAt'> = {
          userId,
          gameId,
          gameType: GameType.PLINKO,
          betAmount,
          result,
          winAmount,
          multiplier: gameData.multiplier,
          gameData
        };

        const createdSession = await DatabaseService.create<PlinkoSession>(COLLECTIONS.GAME_SESSIONS, {
          ...session,
          playedAt: new Date().toISOString(),
          completedAt: new Date().toISOString()
        });

        // Update user balance - deduct bet
        await UserService.updateUserBalance(
          userId,
          PointType.REDEEMABLE,
          -betAmount,
          TransactionType.PLINKO_GAME,
          `Plinko game bet - ${riskLevel} risk`,
          {
            gameId: game.id,
            gameName: game.name,
            betAmount,
            winAmount: 0,
            multiplier: gameData.multiplier,
            sessionId: createdSession.id
          },
          createdSession.id
        );

        // Add winnings if player won
        let newBalance = 0;
        if (winAmount > 0) {
          const userAfterBet = await UserService.updateUserBalance(
            userId,
            PointType.REDEEMABLE,
            winAmount,
            TransactionType.PLINKO_GAME,
            `Plinko game win - ${gameData.multiplier}x multiplier`,
            {
              gameId: game.id,
              gameName: game.name,
              betAmount,
              winAmount,
              multiplier: gameData.multiplier,
              sessionId: createdSession.id
            },
            createdSession.id
          );
          newBalance = userAfterBet.redeemablePoints;
        } else {
          const userBalance = await UserService.getUserBalance(userId);
          newBalance = userBalance.redeemablePoints;
        }

        // Update game statistics
        await this.updateGameStats(gameId, betAmount, winAmount);

        return {
          success: true,
          sessionId: createdSession.id,
          result,
          winAmount,
          newBalance,
          gameData
        };
      });
    } catch (error) {
      if (error instanceof GameError) {
        throw error;
      }
      console.error('Error playing Plinko:', error);
      throw new GameError('Failed to play Plinko game');
    }
  }

  // Generate Plinko game result
  private static generatePlinkoResult(settings: PlinkoSettings, riskLevel: 'low' | 'medium' | 'high'): PlinkoGameData {
    const { rows, multipliers } = settings;
    
    // Generate ball path through pegs
    const ballPath: number[] = [];
    let position = rows / 2; // Start at center top
    
    for (let row = 0; row < rows; row++) {
      // Random direction: 0 = left, 1 = right
      const direction = Math.random() < 0.5 ? 0 : 1;
      ballPath.push(direction);
      
      if (direction === 0) {
        position -= 0.5; // Move left
      } else {
        position += 0.5; // Move right
      }
    }
    
    // Determine final slot (clamp to valid range)
    const finalSlot = Math.max(0, Math.min(multipliers.length - 1, Math.floor(position)));
    
    // Get multiplier for the slot
    let multiplier = multipliers[finalSlot];
    
    // Apply risk level adjustments
    switch (riskLevel) {
      case 'low':
        // More consistent, lower variance
        if (multiplier > 10) multiplier = multiplier * 0.7;
        break;
      case 'medium':
        // Standard multipliers
        break;
      case 'high':
        // Higher variance, bigger wins/losses
        if (multiplier > 5) multiplier = multiplier * 1.3;
        break;
    }
    
    return {
      ballPath,
      finalSlot,
      multiplier: Math.round(multiplier * 100) / 100, // Round to 2 decimal places
      riskLevel
    };
  }

  // Update game statistics
  private static async updateGameStats(gameId: string, betAmount: number, winAmount: number): Promise<void> {
    try {
      const game = await DatabaseService.getById<Game>(COLLECTIONS.GAMES, gameId);
      if (game) {
        await DatabaseService.update<Game>(COLLECTIONS.GAMES, gameId, {
          totalPlayed: game.totalPlayed + 1,
          totalWagered: game.totalWagered + betAmount,
          totalWon: game.totalWon + winAmount
        });
      }
    } catch (error) {
      console.error('Error updating game stats:', error);
      // Don't throw error for stats update failure
    }
  }

  // Get user's game history
  static async getUserGameHistory(userId: string, gameId?: string, limit: number = 50): Promise<GameSession[]> {
    try {
      const filters = [DatabaseService.where('userId', '==', userId)];
      
      if (gameId) {
        filters.push(DatabaseService.where('gameId', '==', gameId));
      }
      
      filters.push(DatabaseService.orderBy('playedAt', 'desc'));
      filters.push(DatabaseService.limit(limit));

      return await DatabaseService.getMany<GameSession>(COLLECTIONS.GAME_SESSIONS, filters);
    } catch (error) {
      console.error('Error getting user game history:', error);
      throw new GameError('Failed to get user game history');
    }
  }

  // Get user's game statistics
  static async getUserGameStats(userId: string, gameId: string): Promise<GameStats | null> {
    try {
      const sessions = await DatabaseService.getMany<GameSession>(
        COLLECTIONS.GAME_SESSIONS,
        [
          DatabaseService.where('userId', '==', userId),
          DatabaseService.where('gameId', '==', gameId)
        ]
      );

      if (sessions.length === 0) {
        return null;
      }

      const totalSessions = sessions.length;
      const totalWagered = sessions.reduce((sum, session) => sum + session.betAmount, 0);
      const totalWon = sessions.reduce((sum, session) => sum + session.winAmount, 0);
      const wins = sessions.filter(session => session.result === GameResult.WIN).length;
      const winRate = (wins / totalSessions) * 100;
      const biggestWin = Math.max(...sessions.map(session => session.winAmount));
      const averageBet = totalWagered / totalSessions;
      const lastPlayed = sessions[0].playedAt; // Assuming sessions are ordered by playedAt desc

      return {
        userId,
        gameId,
        totalSessions,
        totalWagered,
        totalWon,
        biggestWin,
        winRate,
        averageBet,
        lastPlayed
      };
    } catch (error) {
      console.error('Error getting user game stats:', error);
      throw new GameError('Failed to get user game stats');
    }
  }

  // Get game leaderboard
  static async getGameLeaderboard(gameId: string, period: 'daily' | 'weekly' | 'monthly' | 'all_time' = 'all_time'): Promise<{
    topWinners: LeaderboardEntry[];
    topWagerers: LeaderboardEntry[];
    biggestWins: LeaderboardEntry[];
  }> {
    try {
      // Calculate date filter based on period
      let dateFilter: Date | null = null;
      const now = new Date();
      
      switch (period) {
        case 'daily':
          dateFilter = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'weekly':
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          dateFilter = weekStart;
          break;
        case 'monthly':
          dateFilter = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'all_time':
          dateFilter = null;
          break;
      }

      const filters = [DatabaseService.where('gameId', '==', gameId)];
      if (dateFilter) {
        filters.push(DatabaseService.where('playedAt', '>=', dateFilter.toISOString()));
      }

      const sessions = await DatabaseService.getMany<GameSession>(COLLECTIONS.GAME_SESSIONS, filters);

      // Group sessions by user
      const userStats = new Map<string, {
        totalWon: number;
        totalWagered: number;
        biggestWin: number;
        sessionCount: number;
      }>();

      sessions.forEach(session => {
        const existing = userStats.get(session.userId) || {
          totalWon: 0,
          totalWagered: 0,
          biggestWin: 0,
          sessionCount: 0
        };

        existing.totalWon += session.winAmount;
        existing.totalWagered += session.betAmount;
        existing.biggestWin = Math.max(existing.biggestWin, session.winAmount);
        existing.sessionCount += 1;

        userStats.set(session.userId, existing);
      });

      // Convert to leaderboard entries and sort
      const entries: LeaderboardEntry[] = Array.from(userStats.entries()).map(([userId, stats]) => ({
        userId,
        username: `User ${userId.substring(0, 8)}`, // Placeholder - would need to fetch actual usernames
        value: 0, // Will be set based on leaderboard type
        rank: 0
      }));

      // Create different leaderboards
      const topWinners = [...entries]
        .map(entry => ({ ...entry, value: userStats.get(entry.userId)!.totalWon }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10)
        .map((entry, index) => ({ ...entry, rank: index + 1 }));

      const topWagerers = [...entries]
        .map(entry => ({ ...entry, value: userStats.get(entry.userId)!.totalWagered }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10)
        .map((entry, index) => ({ ...entry, rank: index + 1 }));

      const biggestWins = [...entries]
        .map(entry => ({ ...entry, value: userStats.get(entry.userId)!.biggestWin }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10)
        .map((entry, index) => ({ ...entry, rank: index + 1 }));

      return {
        topWinners,
        topWagerers,
        biggestWins
      };
    } catch (error) {
      console.error('Error getting game leaderboard:', error);
      throw new GameError('Failed to get game leaderboard');
    }
  }

  // Admin: Create new game
  static async createGame(gameData: Omit<Game, 'id' | 'createdAt' | 'updatedAt'>): Promise<Game> {
    try {
      return await DatabaseService.create<Game>(COLLECTIONS.GAMES, gameData);
    } catch (error) {
      console.error('Error creating game:', error);
      throw new GameError('Failed to create game');
    }
  }

  // Admin: Update game
  static async updateGame(gameId: string, updateData: Partial<Omit<Game, 'id' | 'createdAt'>>): Promise<void> {
    try {
      await DatabaseService.update<Game>(COLLECTIONS.GAMES, gameId, updateData);
    } catch (error) {
      console.error('Error updating game:', error);
      throw new GameError('Failed to update game');
    }
  }

  // Admin: Initialize default Plinko game
  static async initializeDefaultPlinkoGame(): Promise<Game> {
    const plinkoSettings: PlinkoSettings = {
      rows: 14,
      multipliers: [0.2, 0.5, 1, 1.5, 2, 3, 5, 10, 5, 3, 2, 1.5, 1, 0.5, 0.2], // 15 slots
      riskLevel: 'medium'
    };

    const gameData: Omit<PlinkoGame, 'id' | 'createdAt' | 'updatedAt'> = {
      name: 'Plinko',
      description: 'Drop the ball and watch it bounce through pegs to win prizes!',
      type: GameType.PLINKO,
      isActive: true,
      minBet: 1,
      maxBet: 1000,
      houseEdge: 2.5,
      settings: plinkoSettings,
      totalPlayed: 0,
      totalWagered: 0,
      totalWon: 0,
      createdBy: 'system'
    };

    return await this.createGame(gameData);
  }
}