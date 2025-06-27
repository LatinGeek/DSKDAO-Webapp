import { DatabaseService, RaffleDB, COLLECTIONS } from '@/lib/db';
import { UserService } from './userService';
import { 
  Raffle, 
  RaffleEntry, 
  RaffleParticipant, 
  CreateRaffleRequest, 
  PurchaseRaffleEntryRequest, 
  RaffleEntryResponse 
} from '@/types/entities/raffle';
import { RaffleStatus, TransactionType, PointType } from '@/types/enums';

export class RaffleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RaffleError';
  }
}

export class RaffleService {
  // Get all active raffles
  static async getActiveRaffles(): Promise<Raffle[]> {
    try {
      return await RaffleDB.getActiveRaffles();
    } catch (error) {
      console.error('Error getting active raffles:', error);
      throw new RaffleError('Failed to get active raffles');
    }
  }

  // Get raffle by ID
  static async getRaffleById(raffleId: string): Promise<Raffle | null> {
    try {
      return await DatabaseService.getById<Raffle>(COLLECTIONS.RAFFLES, raffleId);
    } catch (error) {
      console.error('Error getting raffle by ID:', error);
      throw new RaffleError('Failed to get raffle');
    }
  }

  // Create a new raffle (Admin only)
  static async createRaffle(request: CreateRaffleRequest, createdBy: string): Promise<Raffle> {
    try {
      const raffleData: Omit<Raffle, 'id' | 'createdAt' | 'updatedAt'> = {
        ...request,
        status: RaffleStatus.DRAFT,
        totalTicketsSold: 0,
        totalParticipants: 0,
        createdBy,
        featured: request.featured || false
      };

      return await DatabaseService.create<Raffle>(COLLECTIONS.RAFFLES, raffleData);
    } catch (error) {
      console.error('Error creating raffle:', error);
      throw new RaffleError('Failed to create raffle');
    }
  }

  // Update raffle (Admin only)
  static async updateRaffle(raffleId: string, updateData: Partial<Omit<Raffle, 'id' | 'createdAt'>>): Promise<void> {
    try {
      await DatabaseService.update<Raffle>(COLLECTIONS.RAFFLES, raffleId, updateData);
    } catch (error) {
      console.error('Error updating raffle:', error);
      throw new RaffleError('Failed to update raffle');
    }
  }

  // Start a raffle (Admin only)
  static async startRaffle(raffleId: string): Promise<void> {
    try {
      const raffle = await this.getRaffleById(raffleId);
      if (!raffle) {
        throw new RaffleError('Raffle not found');
      }

      if (raffle.status !== RaffleStatus.DRAFT) {
        throw new RaffleError('Raffle is not in draft status');
      }

      const now = new Date().toISOString();
      if (new Date(raffle.startDate) > new Date(now)) {
        throw new RaffleError('Raffle start date has not been reached');
      }

      await this.updateRaffle(raffleId, {
        status: RaffleStatus.ACTIVE
      });
    } catch (error) {
      if (error instanceof RaffleError) {
        throw error;
      }
      console.error('Error starting raffle:', error);
      throw new RaffleError('Failed to start raffle');
    }
  }

  // Purchase raffle entries
  static async purchaseRaffleEntries(request: PurchaseRaffleEntryRequest): Promise<RaffleEntryResponse> {
    const { raffleId, userId, numberOfEntries } = request;

    try {
      return await DatabaseService.runTransaction(async (transaction) => {
        // Get the raffle
        const raffle = await DatabaseService.getById<Raffle>(COLLECTIONS.RAFFLES, raffleId);
        if (!raffle) {
          throw new RaffleError('Raffle not found');
        }

        // Validate raffle status and timing
        if (raffle.status !== RaffleStatus.ACTIVE) {
          throw new RaffleError('Raffle is not active');
        }

        const now = new Date();
        if (new Date(raffle.endDate) < now) {
          throw new RaffleError('Raffle has ended');
        }

        if (new Date(raffle.startDate) > now) {
          throw new RaffleError('Raffle has not started yet');
        }

        // Check if there are enough tickets available
        const remainingTickets = raffle.maxEntries - raffle.totalTicketsSold;
        if (remainingTickets < numberOfEntries) {
          throw new RaffleError(`Only ${remainingTickets} tickets remaining`);
        }

        // Check user's current entries for this raffle
        const userExistingEntries = await RaffleDB.getUserRaffleEntries(userId, raffleId);
        const userCurrentEntries = userExistingEntries.reduce((total, entry) => total + entry.ticketNumbers.length, 0);

        if (raffle.maxEntriesPerUser > 0 && userCurrentEntries + numberOfEntries > raffle.maxEntriesPerUser) {
          const allowedEntries = raffle.maxEntriesPerUser - userCurrentEntries;
          throw new RaffleError(`Maximum ${raffle.maxEntriesPerUser} entries per user. You can purchase ${allowedEntries} more.`);
        }

        // Calculate total cost
        const totalCost = raffle.ticketPrice * numberOfEntries;

        // Check user balance
        const hasInsufficientBalance = await UserService.hasInsufficientBalance(
          userId,
          PointType.REDEEMABLE,
          totalCost
        );

        if (hasInsufficientBalance) {
          throw new RaffleError('Insufficient redeemable points');
        }

        // Generate ticket numbers
        const ticketNumbers: number[] = [];
        for (let i = 0; i < numberOfEntries; i++) {
          ticketNumbers.push(raffle.totalTicketsSold + i + 1);
        }

        // Create raffle entry
        const entryData: Omit<RaffleEntry, 'id'> = {
          raffleId,
          userId,
          ticketNumbers,
          purchasePrice: totalCost,
          purchasedAt: new Date().toISOString()
        };

        const createdEntry = await DatabaseService.create<RaffleEntry>(COLLECTIONS.RAFFLE_ENTRIES, entryData);

        // Update raffle statistics
        await DatabaseService.update<Raffle>(COLLECTIONS.RAFFLES, raffleId, {
          totalTicketsSold: raffle.totalTicketsSold + numberOfEntries,
          totalParticipants: raffle.totalParticipants + (userCurrentEntries === 0 ? 1 : 0)
        });

        // Update user balance and create transaction
        await UserService.updateUserBalance(
          userId,
          PointType.REDEEMABLE,
          -totalCost,
          TransactionType.RAFFLE_ENTRY,
          `Purchased ${numberOfEntries} raffle entries for "${raffle.title}"`,
          {
            raffleId: raffle.id,
            raffleTitle: raffle.title,
            numberOfEntries,
            ticketNumbers,
            entryId: createdEntry.id
          },
          createdEntry.id
        );

        return {
          success: true,
          entryId: createdEntry.id,
          ticketNumbers,
          totalCost,
          userTotalEntries: userCurrentEntries + numberOfEntries
        };
      });
    } catch (error) {
      if (error instanceof RaffleError) {
        throw error;
      }
      console.error('Error purchasing raffle entries:', error);
      throw new RaffleError('Failed to purchase raffle entries');
    }
  }

  // Get user's entries for a specific raffle
  static async getUserRaffleEntries(userId: string, raffleId: string): Promise<RaffleEntry[]> {
    try {
      return await RaffleDB.getUserRaffleEntries(userId, raffleId);
    } catch (error) {
      console.error('Error getting user raffle entries:', error);
      throw new RaffleError('Failed to get user raffle entries');
    }
  }

  // Get all participants for a raffle
  static async getRaffleParticipants(raffleId: string): Promise<RaffleParticipant[]> {
    try {
      const entries = await DatabaseService.getMany<RaffleEntry>(
        COLLECTIONS.RAFFLE_ENTRIES,
        [DatabaseService.where('raffleId', '==', raffleId)]
      );

      // Group entries by user
      const participantMap = new Map<string, RaffleParticipant>();

      entries.forEach(entry => {
        const existing = participantMap.get(entry.userId);
        if (existing) {
          existing.totalEntries += entry.ticketNumbers.length;
          existing.totalSpent += entry.purchasePrice;
          existing.ticketNumbers.push(...entry.ticketNumbers);
          if (new Date(entry.purchasedAt) > new Date(existing.lastEntryAt)) {
            existing.lastEntryAt = entry.purchasedAt;
          }
        } else {
          participantMap.set(entry.userId, {
            raffleId,
            userId: entry.userId,
            totalEntries: entry.ticketNumbers.length,
            totalSpent: entry.purchasePrice,
            ticketNumbers: [...entry.ticketNumbers],
            lastEntryAt: entry.purchasedAt
          });
        }
      });

      return Array.from(participantMap.values());
    } catch (error) {
      console.error('Error getting raffle participants:', error);
      throw new RaffleError('Failed to get raffle participants');
    }
  }

  // Draw raffle winner (Admin only)
  static async drawWinner(raffleId: string): Promise<{ winner: RaffleParticipant; winningTicketNumber: number }> {
    try {
      return await DatabaseService.runTransaction(async (transaction) => {
        const raffle = await DatabaseService.getById<Raffle>(COLLECTIONS.RAFFLES, raffleId);
        if (!raffle) {
          throw new RaffleError('Raffle not found');
        }

        if (raffle.status !== RaffleStatus.ACTIVE) {
          throw new RaffleError('Raffle is not active');
        }

        if (new Date(raffle.endDate) > new Date()) {
          throw new RaffleError('Raffle has not ended yet');
        }

        if (raffle.totalTicketsSold === 0) {
          throw new RaffleError('No tickets sold for this raffle');
        }

        // Get all participants
        const participants = await this.getRaffleParticipants(raffleId);
        
        // Generate random winning ticket number
        const winningTicketNumber = Math.floor(Math.random() * raffle.totalTicketsSold) + 1;
        
        // Find the winner
        let winner: RaffleParticipant | null = null;
        for (const participant of participants) {
          if (participant.ticketNumbers.includes(winningTicketNumber)) {
            winner = participant;
            break;
          }
        }

        if (!winner) {
          throw new RaffleError('Could not determine winner');
        }

        // Update raffle with winner information
        await DatabaseService.update<Raffle>(COLLECTIONS.RAFFLES, raffleId, {
          status: RaffleStatus.ENDED,
          winnerUserId: winner.userId,
          winnerTicketNumber,
          drawnAt: new Date().toISOString()
        });

        return { winner, winningTicketNumber };
      });
    } catch (error) {
      if (error instanceof RaffleError) {
        throw error;
      }
      console.error('Error drawing raffle winner:', error);
      throw new RaffleError('Failed to draw raffle winner');
    }
  }

  // Cancel raffle (Admin only)
  static async cancelRaffle(raffleId: string): Promise<void> {
    try {
      await DatabaseService.runTransaction(async (transaction) => {
        const raffle = await DatabaseService.getById<Raffle>(COLLECTIONS.RAFFLES, raffleId);
        if (!raffle) {
          throw new RaffleError('Raffle not found');
        }

        if (raffle.status === RaffleStatus.ENDED) {
          throw new RaffleError('Cannot cancel an ended raffle');
        }

        // Update raffle status
        await DatabaseService.update<Raffle>(COLLECTIONS.RAFFLES, raffleId, {
          status: RaffleStatus.CANCELLED
        });

        // Refund all participants
        const entries = await DatabaseService.getMany<RaffleEntry>(
          COLLECTIONS.RAFFLE_ENTRIES,
          [DatabaseService.where('raffleId', '==', raffleId)]
        );

        for (const entry of entries) {
          await UserService.updateUserBalance(
            entry.userId,
            PointType.REDEEMABLE,
            entry.purchasePrice,
            TransactionType.ADMIN_ADJUSTMENT,
            `Refund for cancelled raffle: "${raffle.title}"`,
            {
              raffleId: raffle.id,
              raffleTitle: raffle.title,
              refundReason: 'Raffle cancelled',
              originalEntryId: entry.id
            }
          );
        }
      });
    } catch (error) {
      if (error instanceof RaffleError) {
        throw error;
      }
      console.error('Error cancelling raffle:', error);
      throw new RaffleError('Failed to cancel raffle');
    }
  }

  // Get user's raffle history
  static async getUserRaffleHistory(userId: string, limit: number = 50): Promise<RaffleEntry[]> {
    try {
      return await DatabaseService.getMany<RaffleEntry>(
        COLLECTIONS.RAFFLE_ENTRIES,
        [
          DatabaseService.where('userId', '==', userId),
          DatabaseService.orderBy('purchasedAt', 'desc'),
          DatabaseService.limit(limit)
        ]
      );
    } catch (error) {
      console.error('Error getting user raffle history:', error);
      throw new RaffleError('Failed to get user raffle history');
    }
  }

  // Get raffles by status (admin)
  static async getRafflesByStatus(status: RaffleStatus): Promise<Raffle[]> {
    try {
      return await DatabaseService.getMany<Raffle>(
        COLLECTIONS.RAFFLES,
        [
          DatabaseService.where('status', '==', status),
          DatabaseService.orderBy('createdAt', 'desc')
        ]
      );
    } catch (error) {
      console.error(`Error getting raffles by status ${status}:`, error);
      throw new RaffleError(`Failed to get raffles: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get all raffles (admin)
  static async getAllRaffles(): Promise<Raffle[]> {
    try {
      return await DatabaseService.getMany<Raffle>(
        COLLECTIONS.RAFFLES,
        [DatabaseService.orderBy('createdAt', 'desc')]
      );
    } catch (error) {
      console.error('Error getting all raffles:', error);
      throw new RaffleError(`Failed to get all raffles: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Update raffle status (admin)
  static async updateRaffleStatus(raffleId: string, status: RaffleStatus, adminUserId: string): Promise<Raffle> {
    try {
      const updates = {
        status,
        updatedBy: adminUserId
      };
      
      await DatabaseService.update<Raffle>(COLLECTIONS.RAFFLES, raffleId, updates);
      const updatedRaffle = await DatabaseService.getById<Raffle>(COLLECTIONS.RAFFLES, raffleId);
      
      if (!updatedRaffle) {
        throw new RaffleError('Raffle not found after update');
      }
      
      return updatedRaffle;
    } catch (error) {
      console.error(`Error updating raffle status ${raffleId}:`, error);
      throw new RaffleError(`Failed to update raffle status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}