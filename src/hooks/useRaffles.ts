import { useState, useEffect, useCallback } from 'react';
import { useApi, useApiMutation, API_ENDPOINTS } from '@/utils/useApi';
import { Raffle, RaffleEntry, PurchaseRaffleEntryRequest, RaffleEntryResponse } from '@/types/entities/raffle';
import { RaffleStatus } from '@/types/enums';

export interface UseRafflesState {
  activeRaffles: Raffle[];
  userEntries: RaffleEntry[];
  loading: boolean;
  error: string | null;
}

export interface UseRafflesActions {
  getActiveRaffles: () => Promise<void>;
  getUserEntries: (userId: string, raffleId: string) => Promise<void>;
  purchaseEntries: (raffleId: string, userId: string, numberOfEntries: number) => Promise<RaffleEntryResponse | null>;
  refreshRaffles: () => Promise<void>;
  reset: () => void;
}

export interface UseRafflesReturn extends UseRafflesState, UseRafflesActions {}

export const useRaffles = (): UseRafflesReturn => {
  const [state, setState] = useState<UseRafflesState>({
    activeRaffles: [],
    userEntries: [],
    loading: false,
    error: null
  });

  const { execute: executeGetActive, loading: activeLoading, error: activeError } = useApi<Raffle[]>();
  const { execute: executeGetEntries, loading: entriesLoading, error: entriesError } = useApi<RaffleEntry[]>();
  const { mutate: mutatePurchase, loading: purchaseLoading, error: purchaseError } = useApiMutation<RaffleEntryResponse>();

  // Get all active raffles
  const getActiveRaffles = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await executeGetActive(API_ENDPOINTS.RAFFLES.GET_ACTIVE);

      if (result) {
        setState(prev => ({
          ...prev,
          activeRaffles: result,
          loading: false
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to get active raffles',
        loading: false
      }));
    }
  }, [executeGetActive]);

  // Get user's entries for a specific raffle
  const getUserEntries = useCallback(async (userId: string, raffleId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await executeGetEntries(API_ENDPOINTS.RAFFLES.GET_USER_ENTRIES(raffleId), {
        method: 'GET',
        headers: {},
        body: { userId }
      });

      if (result) {
        setState(prev => ({
          ...prev,
          userEntries: result,
          loading: false
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to get user entries',
        loading: false
      }));
    }
  }, [executeGetEntries]);

  // Purchase raffle entries
  const purchaseEntries = useCallback(async (
    raffleId: string,
    userId: string,
    numberOfEntries: number
  ): Promise<RaffleEntryResponse | null> => {
    const purchaseData: PurchaseRaffleEntryRequest = {
      raffleId,
      userId,
      numberOfEntries
    };

    const result = await mutatePurchase(API_ENDPOINTS.RAFFLES.PURCHASE_ENTRY, purchaseData);
    
    if (result) {
      // Refresh raffles and user entries
      await getActiveRaffles();
      await getUserEntries(userId, raffleId);
    }

    return result;
  }, [mutatePurchase, getActiveRaffles, getUserEntries]);

  // Refresh all raffle data
  const refreshRaffles = useCallback(async () => {
    await getActiveRaffles();
  }, [getActiveRaffles]);

  // Reset state
  const reset = useCallback(() => {
    setState({
      activeRaffles: [],
      userEntries: [],
      loading: false,
      error: null
    });
  }, []);

  // Update loading and error states from API hooks
  useEffect(() => {
    const isLoading = activeLoading || entriesLoading || purchaseLoading;
    const error = activeError || entriesError || purchaseError;

    setState(prev => ({
      ...prev,
      loading: isLoading,
      error: error
    }));
  }, [activeLoading, entriesLoading, purchaseLoading, activeError, entriesError, purchaseError]);

  return {
    ...state,
    getActiveRaffles,
    getUserEntries,
    purchaseEntries,
    refreshRaffles,
    reset
  };
};

// Helper hook for individual raffle
export const useRaffle = (raffleId: string) => {
  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [userEntries, setUserEntries] = useState<RaffleEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { execute: executeGetRaffle } = useApi<Raffle>();
  const { execute: executeGetEntries } = useApi<RaffleEntry[]>();

  const getRaffle = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await executeGetRaffle(API_ENDPOINTS.RAFFLES.GET_RAFFLE(raffleId));
      if (result) {
        setRaffle(result);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to get raffle');
    } finally {
      setLoading(false);
    }
  }, [raffleId, executeGetRaffle]);

  const getUserEntries = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await executeGetEntries(API_ENDPOINTS.RAFFLES.GET_USER_ENTRIES(raffleId), {
        method: 'GET',
        headers: {},
        body: { userId }
      });
      if (result) {
        setUserEntries(result);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to get user entries');
    } finally {
      setLoading(false);
    }
  }, [raffleId, executeGetEntries]);

  // Calculate raffle statistics
  const raffleStats = useMemo(() => {
    if (!raffle) return null;

    const now = new Date();
    const startDate = new Date(raffle.startDate);
    const endDate = new Date(raffle.endDate);
    
    const isActive = raffle.status === RaffleStatus.ACTIVE;
    const hasStarted = now >= startDate;
    const hasEnded = now >= endDate;
    const timeRemaining = hasEnded ? 0 : endDate.getTime() - now.getTime();
    
    const ticketsRemaining = raffle.maxEntries - raffle.totalTicketsSold;
    const soldPercentage = (raffle.totalTicketsSold / raffle.maxEntries) * 100;

    return {
      isActive,
      hasStarted,
      hasEnded,
      timeRemaining,
      ticketsRemaining,
      soldPercentage,
      canPurchase: isActive && hasStarted && !hasEnded && ticketsRemaining > 0
    };
  }, [raffle]);

  // Calculate user statistics
  const userStats = useMemo(() => {
    if (!userEntries.length) return null;

    const totalEntries = userEntries.reduce((sum, entry) => sum + entry.ticketNumbers.length, 0);
    const totalSpent = userEntries.reduce((sum, entry) => sum + entry.purchasePrice, 0);
    const allTicketNumbers = userEntries.flatMap(entry => entry.ticketNumbers);
    
    let winChance = 0;
    if (raffle && raffle.totalTicketsSold > 0) {
      winChance = (totalEntries / raffle.totalTicketsSold) * 100;
    }

    return {
      totalEntries,
      totalSpent,
      ticketNumbers: allTicketNumbers,
      winChance
    };
  }, [userEntries, raffle]);

  return {
    raffle,
    userEntries,
    loading,
    error,
    raffleStats,
    userStats,
    getRaffle,
    getUserEntries
  };
};

// Utility functions for raffle display
export const formatTimeRemaining = (milliseconds: number): string => {
  if (milliseconds <= 0) return 'Ended';

  const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
  const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

export const getRaffleStatusColor = (status: RaffleStatus): string => {
  switch (status) {
    case RaffleStatus.DRAFT: return 'gray';
    case RaffleStatus.ACTIVE: return 'green';
    case RaffleStatus.ENDED: return 'blue';
    case RaffleStatus.CANCELLED: return 'red';
    default: return 'gray';
  }
};

export const getRaffleStatusLabel = (status: RaffleStatus): string => {
  switch (status) {
    case RaffleStatus.DRAFT: return 'Draft';
    case RaffleStatus.ACTIVE: return 'Active';
    case RaffleStatus.ENDED: return 'Ended';
    case RaffleStatus.CANCELLED: return 'Cancelled';
    default: return 'Unknown';
  }
};