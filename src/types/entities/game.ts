import { GameResult } from '@/types/enums';

// General game interfaces
export interface Game {
  id: string;
  name: string;
  description: string;
  type: GameType;
  isActive: boolean;
  
  // Game configuration
  minBet: number;
  maxBet: number;
  houseEdge: number; // Percentage (0-100)
  
  // Game-specific settings
  settings: Record<string, any>;
  
  // Statistics
  totalPlayed: number;
  totalWagered: number;
  totalWon: number;
  
  // Admin fields
  createdBy: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export enum GameType {
  PLINKO = 'plinko',
  COIN_FLIP = 'coin_flip',
  DICE_ROLL = 'dice_roll'
}

// Plinko specific interfaces
export interface PlinkoGame extends Game {
  type: GameType.PLINKO;
  settings: PlinkoSettings;
}

export interface PlinkoSettings {
  rows: number; // Number of peg rows (typically 12-16)
  multipliers: number[]; // Multiplier values for each slot at bottom
  riskLevel: 'low' | 'medium' | 'high'; // Affects multiplier distribution
}

export interface GameSession {
  id: string;
  userId: string;
  gameId: string;
  gameType: GameType;
  
  // Bet information
  betAmount: number;
  
  // Results
  result: GameResult;
  winAmount: number;
  multiplier?: number; // For games with multipliers
  
  // Game-specific data
  gameData: Record<string, any>;
  
  // Timestamps
  playedAt: string;
  completedAt?: string;
}

// Plinko specific session data
export interface PlinkoSession extends GameSession {
  gameType: GameType.PLINKO;
  gameData: PlinkoGameData;
}

export interface PlinkoGameData {
  ballPath: number[]; // Array representing the ball's path through pegs
  finalSlot: number; // Which slot the ball landed in (0-based)
  multiplier: number; // The multiplier for that slot
  riskLevel: 'low' | 'medium' | 'high';
}

// Game statistics and leaderboards
export interface GameStats {
  userId: string;
  gameId: string;
  totalSessions: number;
  totalWagered: number;
  totalWon: number;
  biggestWin: number;
  winRate: number; // Percentage
  averageBet: number;
  lastPlayed: string;
}

export interface GameLeaderboard {
  gameId: string;
  period: 'daily' | 'weekly' | 'monthly' | 'all_time';
  topWinners: LeaderboardEntry[];
  topWagerers: LeaderboardEntry[];
  biggestWins: LeaderboardEntry[];
  lastUpdated: string;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatar?: string;
  value: number; // Win amount, total wagered, etc.
  rank: number;
}

// Request/Response interfaces
export interface PlayGameRequest {
  gameId: string;
  userId: string;
  betAmount: number;
  gameSpecificData?: Record<string, any>; // For games that need additional input
}

export interface PlayGameResponse {
  success: boolean;
  sessionId: string;
  result: GameResult;
  winAmount: number;
  newBalance: number;
  gameData: Record<string, any>;
}

export interface PlinkoPlayRequest extends PlayGameRequest {
  gameSpecificData: {
    riskLevel: 'low' | 'medium' | 'high';
  };
}

export interface PlinkoPlayResponse extends PlayGameResponse {
  gameData: PlinkoGameData;
}