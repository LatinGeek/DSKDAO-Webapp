// User Role Enums
export enum UserRole {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  USER = 'user'
}

// Purchase Status Enums  
export enum PurchaseStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

// Item Type Enums
export enum ItemType {
  DIGITAL = 'digital',
  PHYSICAL = 'physical',
  NFT = 'nft',
  TOKEN = 'token'
}

// Item Category Enums
export enum ItemCategory {
  COLLECTIBLE = 'collectible',
  UTILITY = 'utility',
  COSMETIC = 'cosmetic',
  ACCESS = 'access',
  LOOTBOX = 'lootbox',
  RAFFLE_TICKET = 'raffle_ticket'
}

// Point Type Enums
export enum PointType {
  REDEEMABLE = 'redeemable', // Tickets & Prizes - can be spent
  SOUL_BOUND = 'soul_bound'  // Voting Power - cannot be spent
}

// Transaction Type Enums
export enum TransactionType {
  PURCHASE = 'purchase',
  LOOTBOX_OPEN = 'lootbox_open',
  PLINKO_GAME = 'plinko_game',
  RAFFLE_ENTRY = 'raffle_entry',
  ADMIN_ADJUSTMENT = 'admin_adjustment',
  DISCORD_REWARD = 'discord_reward',
  GAME_REWARD = 'game_reward'
}

// Raffle Status Enums
export enum RaffleStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ENDED = 'ended',
  CANCELLED = 'cancelled'
}

// Game Result Enums  
export enum GameResult {
  WIN = 'win',
  LOSE = 'lose'
}

// Lootbox Rarity Enums
export enum LootboxRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon', 
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

// Notification Type Enums
export enum NotificationType {
  PURCHASE_SUCCESS = 'purchase_success',
  PURCHASE_FAILED = 'purchase_failed',
  LOOTBOX_WON = 'lootbox_won',
  RAFFLE_WON = 'raffle_won',
  GAME_RESULT = 'game_result',
  ADMIN_MESSAGE = 'admin_message'
}

// Activity Log Type Enums
export enum ActivityLogType {
  LOGIN = 'login',
  PURCHASE = 'purchase',
  LOOTBOX_OPEN = 'lootbox_open',
  GAME_PLAY = 'game_play',
  RAFFLE_ENTRY = 'raffle_entry',
  ADMIN_ACTION = 'admin_action'
}