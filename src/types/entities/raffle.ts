import { RaffleStatus } from '@/types/enums';

export interface Raffle {
  id: string;
  title: string;
  description: string;
  image?: string;
  
  // Prize information
  prizeDescription: string;
  prizeValue: number; // In tickets for reference
  prizeMetadata?: {
    // For physical prizes
    shippingRequired?: boolean;
    estimatedValue?: number;
    
    // For digital prizes
    contractAddress?: string;
    tokenId?: string;
    chainId?: number;
    
    // For ticket prizes
    ticketAmount?: number;
  };
  
  // Raffle configuration
  ticketPrice: number; // Cost per entry in redeemable points
  maxEntries: number; // Maximum number of tickets that can be sold
  maxEntriesPerUser: number; // Maximum entries per user (0 = unlimited)
  
  // Status and timing
  status: RaffleStatus;
  startDate: string; // ISO timestamp
  endDate: string;   // ISO timestamp
  
  // Results
  winnerUserId?: string;
  winnerTicketNumber?: number;
  drawnAt?: string;
  contractTransactionHash?: string; // If using smart contract for fairness
  
  // Statistics
  totalTicketsSold: number;
  totalParticipants: number;
  
  // Admin fields
  createdBy: string; // Admin user ID
  featured: boolean;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface RaffleEntry {
  id: string;
  raffleId: string;
  userId: string;
  ticketNumbers: number[]; // Array of ticket numbers purchased
  purchasePrice: number; // Total cost for all tickets
  purchasedAt: string;
  transactionId?: string; // Reference to purchase transaction
}

export interface RaffleParticipant {
  raffleId: string;
  userId: string;
  totalEntries: number;
  totalSpent: number;
  ticketNumbers: number[];
  lastEntryAt: string;
}

export interface RaffleStats {
  raffleId: string;
  totalEntries: number;
  totalParticipants: number;
  totalRevenue: number;
  averageEntriesPerUser: number;
  lastCalculated: string;
}

// Request/Response interfaces
export interface CreateRaffleRequest {
  title: string;
  description: string;
  image?: string;
  prizeDescription: string;
  prizeValue: number;
  prizeMetadata?: Record<string, any>;
  ticketPrice: number;
  maxEntries: number;
  maxEntriesPerUser: number;
  startDate: string;
  endDate: string;
  featured?: boolean;
}

export interface PurchaseRaffleEntryRequest {
  raffleId: string;
  userId: string;
  numberOfEntries: number;
}

export interface RaffleEntryResponse {
  success: boolean;
  entryId: string;
  ticketNumbers: number[];
  totalCost: number;
  userTotalEntries: number;
}