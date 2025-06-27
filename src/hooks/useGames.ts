import { useState, useEffect, useCallback, useMemo } from 'react';
import { useApi, useApiMutation, API_ENDPOINTS } from '@/utils/useApi';
import { 
  Game, 
  GameSession, 
  PlinkoPlayRequest, 
  PlinkoPlayResponse,
  GameStats,
  LeaderboardEntry,
  GameType
} from '@/types/entities/game';
import { GameResult } from '@/types/enums';

export interface UseGamesState {
  games: Game[];
  gameHistory: GameSession[];
  gameStats: GameStats | null;
  leaderboard: {
    topWinners: LeaderboardEntry[];
    topWagerers: LeaderboardEntry[];
    biggestWins: LeaderboardEntry[];
  } | null;
  loading: boolean;
  error: string | null;
}

export interface UseGamesActions {
  getGames: () => Promise<void>;
  getGameHistory: (userId: string, gameId?: string) => Promise<void>;
  getGameStats: (userId: string, gameId: string) => Promise<void>;
  getLeaderboard: (gameId: string, period?: 'daily' | 'weekly' | 'monthly' | 'all_time') => Promise<void>;
  playPlinko: (gameId: string, userId: string, betAmount: number, riskLevel: 'low' | 'medium' | 'high') => Promise<PlinkoPlayResponse | null>;
  reset: () => void;
}

export interface UseGamesReturn extends UseGamesState, UseGamesActions {}

export const useGames = (): UseGamesReturn => {
  const [state, setState] = useState<UseGamesState>({
    games: [],
    gameHistory: [],
    gameStats: null,
    leaderboard: null,
    loading: false,
    error: null
  });

  const { execute: executeGetGames, loading: gamesLoading, error: gamesError } = useApi<Game[]>();
  const { execute: executeGetHistory, loading: historyLoading, error: historyError } = useApi<GameSession[]>();
  const { execute: executeGetStats, loading: statsLoading, error: statsError } = useApi<GameStats>();
  const { execute: executeGetLeaderboard, loading: leaderboardLoading, error: leaderboardError } = useApi<{
    topWinners: LeaderboardEntry[];
    topWagerers: LeaderboardEntry[];
    biggestWins: LeaderboardEntry[];
  }>();
  const { mutate: mutatePlayPlinko, loading: plinkoLoading, error: plinkoError } = useApiMutation<PlinkoPlayResponse>();

  // Get all available games
  const getGames = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await executeGetGames(API_ENDPOINTS.GAMES.GET_GAMES);

      if (result) {
        setState(prev => ({
          ...prev,
          games: result,
          loading: false
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to get games',
        loading: false
      }));
    }
  }, [executeGetGames]);

  // Get user's game history
  const getGameHistory = useCallback(async (userId: string, gameId?: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const endpoint = API_ENDPOINTS.GAMES.GET_HISTORY;
      const params = { userId, gameId };
      
      const result = await executeGetHistory(endpoint, {
        method: 'GET',
        headers: {},
        body: params
      });

      if (result) {
        setState(prev => ({
          ...prev,
          gameHistory: result,
          loading: false
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to get game history',
        loading: false
      }));
    }
  }, [executeGetHistory]);

  // Get user's game statistics
  const getGameStats = useCallback(async (userId: string, gameId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const params = { userId, gameId };
      
      const result = await executeGetStats('/games/stats', {
        method: 'GET',
        headers: {},
        body: params
      });

      if (result) {
        setState(prev => ({
          ...prev,
          gameStats: result,
          loading: false
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to get game stats',
        loading: false
      }));
    }
  }, [executeGetStats]);

  // Get game leaderboard
  const getLeaderboard = useCallback(async (
    gameId: string, 
    period: 'daily' | 'weekly' | 'monthly' | 'all_time' = 'all_time'
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await executeGetLeaderboard(API_ENDPOINTS.GAMES.GET_LEADERBOARD(gameId), {
        method: 'GET',
        headers: {},
        body: { period }
      });

      if (result) {
        setState(prev => ({
          ...prev,
          leaderboard: result,
          loading: false
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to get leaderboard',
        loading: false
      }));
    }
  }, [executeGetLeaderboard]);

  // Play Plinko game
  const playPlinko = useCallback(async (
    gameId: string,
    userId: string,
    betAmount: number,
    riskLevel: 'low' | 'medium' | 'high'
  ): Promise<PlinkoPlayResponse | null> => {
    const playData: PlinkoPlayRequest = {
      gameId,
      userId,
      betAmount,
      gameSpecificData: { riskLevel }
    };

    const result = await mutatePlayPlinko(API_ENDPOINTS.GAMES.PLAY_PLINKO, playData);
    
    if (result) {
      // Refresh game history and stats
      await getGameHistory(userId, gameId);
      await getGameStats(userId, gameId);
    }

    return result;
  }, [mutatePlayPlinko, getGameHistory, getGameStats]);

  // Reset state
  const reset = useCallback(() => {
    setState({
      games: [],
      gameHistory: [],
      gameStats: null,
      leaderboard: null,
      loading: false,
      error: null
    });
  }, []);

  // Update loading and error states from API hooks
  useEffect(() => {
    const isLoading = gamesLoading || historyLoading || statsLoading || leaderboardLoading || plinkoLoading;
    const error = gamesError || historyError || statsError || leaderboardError || plinkoError;

    setState(prev => ({
      ...prev,
      loading: isLoading,
      error: error
    }));
  }, [
    gamesLoading, historyLoading, statsLoading, leaderboardLoading, plinkoLoading,
    gamesError, historyError, statsError, leaderboardError, plinkoError
  ]);

  return {
    ...state,
    getGames,
    getGameHistory,
    getGameStats,
    getLeaderboard,
    playPlinko,
    reset
  };
};

// Specialized Plinko hook
export const usePlinko = (gameId: string, userId: string) => {
  const [state, setState] = useState({
    game: null as Game | null,
    lastResult: null as PlinkoPlayResponse | null,
    recentSessions: [] as GameSession[],
    stats: null as GameStats | null,
    loading: false,
    error: null as string | null
  });

  const { playPlinko, getGameHistory, getGameStats } = useGames();

  // Play Plinko with automatic result tracking
  const play = useCallback(async (betAmount: number, riskLevel: 'low' | 'medium' | 'high') => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await playPlinko(gameId, userId, betAmount, riskLevel);
      
      if (result) {
        setState(prev => ({
          ...prev,
          lastResult: result,
          loading: false
        }));
        
        // Refresh data
        await Promise.all([
          getGameHistory(userId, gameId),
          getGameStats(userId, gameId)
        ]);
      }
      
      return result;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to play Plinko',
        loading: false
      }));
      return null;
    }
  }, [gameId, userId, playPlinko, getGameHistory, getGameStats]);

  // Calculate win/loss statistics
  const sessionStats = useMemo(() => {
    if (!state.recentSessions.length) return null;

    const wins = state.recentSessions.filter(session => session.result === GameResult.WIN).length;
    const losses = state.recentSessions.length - wins;
    const winRate = (wins / state.recentSessions.length) * 100;
    
    const totalWagered = state.recentSessions.reduce((sum, session) => sum + session.betAmount, 0);
    const totalWon = state.recentSessions.reduce((sum, session) => sum + session.winAmount, 0);
    const netResult = totalWon - totalWagered;
    
    const biggestWin = Math.max(...state.recentSessions.map(session => session.winAmount));
    const averageBet = totalWagered / state.recentSessions.length;

    return {
      totalSessions: state.recentSessions.length,
      wins,
      losses,
      winRate,
      totalWagered,
      totalWon,
      netResult,
      biggestWin,
      averageBet
    };
  }, [state.recentSessions]);

  return {
    ...state,
    sessionStats,
    play
  };
};

// Utility functions for Plinko
export const getPlinkoMultiplierColor = (multiplier: number): string => {
  if (multiplier >= 10) return 'text-yellow-400'; // Gold for high multipliers
  if (multiplier >= 5) return 'text-purple-400';  // Purple for good multipliers
  if (multiplier >= 2) return 'text-blue-400';    // Blue for decent multipliers
  if (multiplier >= 1) return 'text-green-400';   // Green for break-even+
  return 'text-red-400';                          // Red for losses
};

export const formatMultiplier = (multiplier: number): string => {
  return `${multiplier.toFixed(2)}x`;
};

export const calculatePotentialWin = (betAmount: number, multiplier: number): number => {
  return Math.floor(betAmount * multiplier);
};

export const getRiskLevelColor = (riskLevel: 'low' | 'medium' | 'high'): string => {
  switch (riskLevel) {
    case 'low': return 'text-green-400';
    case 'medium': return 'text-yellow-400';
    case 'high': return 'text-red-400';
    default: return 'text-gray-400';
  }
};

export const getRiskLevelDescription = (riskLevel: 'low' | 'medium' | 'high'): string => {
  switch (riskLevel) {
    case 'low': return 'Consistent payouts, lower variance';
    case 'medium': return 'Balanced risk and reward';
    case 'high': return 'High variance, bigger wins possible';
    default: return 'Unknown risk level';
  }
};