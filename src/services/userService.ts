import { DatabaseService, UserDB, COLLECTIONS } from '@/lib/db';
import { User, UserBalance } from '@/types/entities/user';
import { Transaction, CreateTransactionRequest } from '@/types/entities/transaction';
import { UserRole, PointType, TransactionType } from '@/types/enums';

export class InsufficientBalanceError extends Error {
  constructor(pointType: PointType, required: number, available: number) {
    super(`Insufficient ${pointType} points. Required: ${required}, Available: ${available}`);
    this.name = 'InsufficientBalanceError';
  }
}

export class UserNotFoundError extends Error {
  constructor(identifier: string) {
    super(`User not found: ${identifier}`);
    this.name = 'UserNotFoundError';
  }
}

export class UserService {
  // Get user by Discord ID
  static async getUserByDiscordId(discordUserId: string): Promise<User | null> {
    try {
      return await UserDB.getByDiscordId(discordUserId);
    } catch (error) {
      console.error('Error getting user by Discord ID:', error);
      throw new Error('Failed to get user by Discord ID');
    }
  }

  // Get user by ID
  static async getUserById(userId: string): Promise<User | null> {
    try {
      return await DatabaseService.getById<User>(COLLECTIONS.USERS, userId);
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw new Error('Failed to get user by ID');
    }
  }

  // Create or update user from Discord authentication
  static async createOrUpdateUser(discordUserData: {
    discordUserId: string;
    discordUsername: string;
    discordDiscriminator?: string;
    discordAvatar?: string;
    email?: string;
    displayName: string;
    discordAccessToken?: string;
    discordRoles?: string[];
  }): Promise<User> {
    try {
      const existingUser = await UserDB.getByDiscordId(discordUserData.discordUserId) as User | null;
      
      if (existingUser) {
        // Update existing user
        const updateData: Partial<User> = {
          discordUsername: discordUserData.discordUsername,
          discordDiscriminator: discordUserData.discordDiscriminator,
          discordAvatar: discordUserData.discordAvatar,
          email: discordUserData.email,
          displayName: discordUserData.displayName,
          discordAccessToken: discordUserData.discordAccessToken,
          discordRoles: discordUserData.discordRoles || [],
          lastLoginAt: new Date().toISOString(),
          lastActivityAt: new Date().toISOString(),
          totalLogins: (existingUser.totalLogins || 0) + 1,
          lastDiscordSync: new Date().toISOString()
        };

        await DatabaseService.update<User>(COLLECTIONS.USERS, existingUser.id, updateData);
        return { ...existingUser, ...updateData } as User;
      } else {
        // Create new user
        const newUser: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
          discordUserId: discordUserData.discordUserId,
          discordUsername: discordUserData.discordUsername,
          discordDiscriminator: discordUserData.discordDiscriminator,
          discordAvatar: discordUserData.discordAvatar,
          discordLinked: true,
          discordAccessToken: discordUserData.discordAccessToken,
          email: discordUserData.email,
          displayName: discordUserData.displayName,
          roles: [UserRole.USER], // Default role
          isActive: true,
          
          // Initialize point system
          redeemablePoints: 0,
          soulBoundPoints: 0,
          totalEarned: 0,
          
          // Discord integration
          discordRoles: discordUserData.discordRoles || [],
          lastDiscordSync: new Date().toISOString(),
          
          // Wallet integration
          walletConnected: false,
          
          // Activity tracking
          lastLoginAt: new Date().toISOString(),
          lastActivityAt: new Date().toISOString(),
          totalLogins: 1
        };

        return await DatabaseService.create<User>(COLLECTIONS.USERS, newUser);
      }
    } catch (error) {
      console.error('Error creating or updating user:', error);
      throw new Error('Failed to create or update user');
    }
  }

  // Get user balance
  static async getUserBalance(userId: string): Promise<UserBalance> {
    try {
      const user = await DatabaseService.getById<User>(COLLECTIONS.USERS, userId);
      if (!user) {
        throw new UserNotFoundError(userId);
      }

      return {
        userId: user.id,
        redeemablePoints: user.redeemablePoints,
        soulBoundPoints: user.soulBoundPoints,
        lastUpdated: user.updatedAt
      };
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw error;
      }
      console.error('Error getting user balance:', error);
      throw new Error('Failed to get user balance');
    }
  }

  // Update user balance with transaction logging
  static async updateUserBalance(
    userId: string,
    pointType: PointType,
    amount: number, // Positive for credit, negative for debit
    transactionType: TransactionType,
    description: string,
    metadata?: Record<string, any>,
    referenceId?: string
  ): Promise<User> {
    try {
      return await DatabaseService.runTransaction(async (transaction) => {
        // Get current user
        const userRef = DatabaseService.getById<User>(COLLECTIONS.USERS, userId);
        const user = await userRef;
        
        if (!user) {
          throw new UserNotFoundError(userId);
        }

        // Calculate new balances
        let newRedeemablePoints = user.redeemablePoints;
        let newSoulBoundPoints = user.soulBoundPoints;
        
        if (pointType === PointType.REDEEMABLE) {
          newRedeemablePoints += amount;
          if (newRedeemablePoints < 0) {
            throw new InsufficientBalanceError(PointType.REDEEMABLE, Math.abs(amount), user.redeemablePoints);
          }
        } else {
          newSoulBoundPoints += amount;
          if (newSoulBoundPoints < 0) {
            throw new InsufficientBalanceError(PointType.SOUL_BOUND, Math.abs(amount), user.soulBoundPoints);
          }
        }

        // Update total earned if it's a positive transaction
        let newTotalEarned = user.totalEarned;
        if (amount > 0) {
          newTotalEarned += amount;
        }

        // Update user balance
        const updatedUser = {
          ...user,
          redeemablePoints: newRedeemablePoints,
          soulBoundPoints: newSoulBoundPoints,
          totalEarned: newTotalEarned,
          lastActivityAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        await DatabaseService.update<User>(COLLECTIONS.USERS, userId, {
          redeemablePoints: newRedeemablePoints,
          soulBoundPoints: newSoulBoundPoints,
          totalEarned: newTotalEarned,
          lastActivityAt: new Date().toISOString()
        });

        // Create transaction record
        const transactionData: any = {
          userId,
          type: transactionType,
          pointType,
          amount,
          balanceBefore: pointType === PointType.REDEEMABLE ? user.redeemablePoints : user.soulBoundPoints,
          balanceAfter: pointType === PointType.REDEEMABLE ? newRedeemablePoints : newSoulBoundPoints,
          description,
          referenceId,
          referenceType: referenceId ? 'purchase' : undefined,
          metadata,
          status: 'completed',
          processedAt: new Date().toISOString()
        };

        await DatabaseService.create(COLLECTIONS.TRANSACTIONS, transactionData);

        return updatedUser;
      });
    } catch (error) {
      if (error instanceof InsufficientBalanceError || error instanceof UserNotFoundError) {
        throw error;
      }
      console.error('Error updating user balance:', error);
      throw new Error('Failed to update user balance');
    }
  }

  // Check if user has sufficient balance
  static async hasInsufficientBalance(userId: string, pointType: PointType, amount: number): Promise<boolean> {
    try {
      const balance = await this.getUserBalance(userId);
      const availablePoints = pointType === PointType.REDEEMABLE ? balance.redeemablePoints : balance.soulBoundPoints;
      return availablePoints < amount;
    } catch (error) {
      console.error('Error checking user balance:', error);
      return true; // Assume insufficient if we can't check
    }
  }

  // Update user roles
  static async updateUserRoles(userId: string, roles: UserRole[]): Promise<void> {
    try {
      await DatabaseService.update<User>(COLLECTIONS.USERS, userId, { roles });
    } catch (error) {
      console.error('Error updating user roles:', error);
      throw new Error('Failed to update user roles');
    }
  }

  // Sync Discord roles
  static async syncDiscordRoles(userId: string, discordRoles: string[]): Promise<void> {
    try {
      await DatabaseService.update<User>(COLLECTIONS.USERS, userId, {
        discordRoles,
        lastDiscordSync: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error syncing Discord roles:', error);
      throw new Error('Failed to sync Discord roles');
    }
  }

  // Connect wallet
  static async connectWallet(userId: string, walletAddress: string): Promise<void> {
    try {
      await DatabaseService.update<User>(COLLECTIONS.USERS, userId, {
        walletAddress,
        walletConnected: true
      });
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw new Error('Failed to connect wallet');
    }
  }

  // Disconnect wallet
  static async disconnectWallet(userId: string): Promise<void> {
    try {
      await DatabaseService.update<User>(COLLECTIONS.USERS, userId, {
        walletAddress: undefined,
        walletConnected: false
      });
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      throw new Error('Failed to disconnect wallet');
    }
  }
} 