import { UserRole, PointType } from '@/types/enums';

export interface User {
  id: string;
  discordUserId: string;
  discordUsername: string;
  discordDiscriminator?: string;
  discordAvatar?: string;
  discordLinked: boolean;
  discordAccessToken?: string;
  email?: string;
  displayName: string;
  roles: UserRole[];
  isActive: boolean;
  
  // Point System
  redeemablePoints: number; // Tickets & Prizes - can be spent
  soulBoundPoints: number;  // Voting Power - cannot be spent
  totalEarned: number;      // Total points ever earned (for statistics)
  
  // Discord Server Integration
  discordRoles: string[];   // Array of Discord role IDs
  lastDiscordSync: string;  // ISO timestamp of last sync with Discord
  
  // Wallet Integration (optional)
  walletAddress?: string;
  walletConnected: boolean;
  
  // Activity Tracking
  lastLoginAt: string;
  lastActivityAt: string;
  totalLogins: number;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface UserBalance {
  userId: string;
  redeemablePoints: number;
  soulBoundPoints: number;
  lastUpdated: string;
}

export interface UserActivity {
  id: string;
  userId: string;
  type: string;
  description: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface UserStats {
  userId: string;
  totalPurchases: number;
  totalSpent: number;
  totalEarned: number;
  lootboxesOpened: number;
  gamesPlayed: number;
  raffleEntriesPurchased: number;
  lastCalculated: string;
}