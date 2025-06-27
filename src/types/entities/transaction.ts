import { TransactionType, PointType } from '@/types/enums';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  pointType: PointType;
  
  // Transaction amounts
  amount: number; // Positive for credits, negative for debits
  balanceBefore: number;
  balanceAfter: number;
  
  // Reference information
  referenceId?: string; // ID of related record (purchase, game session, etc.)
  referenceType?: string; // Type of related record
  
  // Transaction details
  description: string;
  metadata?: Record<string, any>;
  
  // Administrative
  processedBy?: string; // User ID of admin who processed (for manual adjustments)
  notes?: string; // Admin notes
  
  // Status and verification
  status: TransactionStatus;
  verificationHash?: string; // For transaction integrity
  
  // Timestamps
  createdAt: string;
  processedAt?: string;
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REVERSED = 'reversed'
}

// Specific transaction type interfaces
export interface PurchaseTransaction extends Transaction {
  type: TransactionType.PURCHASE;
  metadata: {
    itemId: string;
    itemName: string;
    quantity: number;
    unitPrice: number;
    purchaseId: string;
  };
}

export interface LootboxTransaction extends Transaction {
  type: TransactionType.LOOTBOX_OPEN;
  metadata: {
    lootboxId: string;
    lootboxName: string;
    wonItemId: string;
    wonItemName: string;
    wonQuantity: number;
    openingId: string;
  };
}

export interface GameTransaction extends Transaction {
  type: TransactionType.PLINKO_GAME;
  metadata: {
    gameId: string;
    gameName: string;
    betAmount: number;
    winAmount: number;
    multiplier?: number;
    sessionId: string;
  };
}

export interface RaffleTransaction extends Transaction {
  type: TransactionType.RAFFLE_ENTRY;
  metadata: {
    raffleId: string;
    raffleTitle: string;
    numberOfEntries: number;
    ticketNumbers: number[];
    entryId: string;
  };
}

export interface DiscordRewardTransaction extends Transaction {
  type: TransactionType.DISCORD_REWARD;
  metadata: {
    activityType: string;
    serverName: string;
    channelId?: string;
    messageId?: string;
    rewardReason: string;
  };
}

export interface AdminAdjustmentTransaction extends Transaction {
  type: TransactionType.ADMIN_ADJUSTMENT;
  metadata: {
    adjustmentReason: string;
    adminNote: string;
    originalBalance: number;
    adjustmentAmount: number;
  };
}

// Transaction summary and reporting
export interface TransactionSummary {
  userId: string;
  pointType: PointType;
  period: {
    start: string;
    end: string;
  };
  
  totals: {
    credits: number;
    debits: number;
    net: number;
    transactionCount: number;
  };
  
  byType: Record<TransactionType, {
    count: number;
    totalAmount: number;
  }>;
  
  generatedAt: string;
}

export interface SystemTransactionStats {
  totalTransactions: number;
  totalPointsIssued: number;
  totalPointsSpent: number;
  totalRedeemablePoints: number;
  totalSoulBoundPoints: number;
  
  byType: Record<TransactionType, {
    count: number;
    totalAmount: number;
  }>;
  
  period: {
    start: string;
    end: string;
  };
  
  lastCalculated: string;
}

// Request/Response interfaces
export interface CreateTransactionRequest {
  userId: string;
  type: TransactionType;
  pointType: PointType;
  amount: number;
  description: string;
  referenceId?: string;
  referenceType?: string;
  metadata?: Record<string, any>;
  processedBy?: string; // For admin transactions
  notes?: string;
}

export interface TransactionHistoryRequest {
  userId?: string;
  pointType?: PointType;
  type?: TransactionType;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface TransactionHistoryResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  hasMore: boolean;
}