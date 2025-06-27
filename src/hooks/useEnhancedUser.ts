import { useState, useEffect, useCallback } from 'react';
import { useApi, useApiMutation, API_ENDPOINTS } from '@/utils/useApi';
import { User, UserBalance } from '@/types/entities/user';
import { Transaction } from '@/types/entities/transaction';
import { PointType, UserRole } from '@/types/enums';

export interface UseEnhancedUserState {
  user: User | null;
  balance: UserBalance | null;
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
}

export interface UseEnhancedUserActions {
  getUser: (userId: string) => Promise<void>;
  getBalance: (userId: string) => Promise<void>;
  getTransactions: (userId: string, limit?: number) => Promise<void>;
  connectWallet: (userId: string, walletAddress: string) => Promise<void>;
  disconnectWallet: (userId: string) => Promise<void>;
  refreshUserData: (userId: string) => Promise<void>;
  reset: () => void;
}

export interface UseEnhancedUserReturn extends UseEnhancedUserState, UseEnhancedUserActions {}

export const useEnhancedUser = (): UseEnhancedUserReturn => {
  const [state, setState] = useState<UseEnhancedUserState>({
    user: null,
    balance: null,
    transactions: [],
    loading: false,
    error: null
  });

  const { execute: executeGetUser, loading: userLoading, error: userError } = useApi<User>();
  const { execute: executeGetBalance, loading: balanceLoading, error: balanceError } = useApi<UserBalance>();
  const { execute: executeGetTransactions, loading: transactionsLoading, error: transactionsError } = useApi<Transaction[]>();
  const { mutate: mutateConnectWallet, loading: connectLoading, error: connectError } = useApiMutation<void>();
  const { mutate: mutateDisconnectWallet, loading: disconnectLoading, error: disconnectError } = useApiMutation<void>();

  // Get user details
  const getUser = useCallback(async (userId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await executeGetUser(`/users/${userId}`);

      if (result) {
        setState(prev => ({
          ...prev,
          user: result,
          loading: false
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to get user',
        loading: false
      }));
    }
  }, [executeGetUser]);

  // Get user balance
  const getBalance = useCallback(async (userId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await executeGetBalance(API_ENDPOINTS.USERS.GET_BALANCE, {
        method: 'GET',
        headers: {},
        body: { userId }
      });

      if (result) {
        setState(prev => ({
          ...prev,
          balance: result,
          loading: false
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to get balance',
        loading: false
      }));
    }
  }, [executeGetBalance]);

  // Get user transactions
  const getTransactions = useCallback(async (userId: string, limit: number = 50) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await executeGetTransactions(API_ENDPOINTS.USERS.GET_TRANSACTIONS, {
        method: 'GET',
        headers: {},
        body: { userId, limit }
      });

      if (result) {
        setState(prev => ({
          ...prev,
          transactions: result,
          loading: false
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to get transactions',
        loading: false
      }));
    }
  }, [executeGetTransactions]);

  // Connect wallet
  const connectWallet = useCallback(async (userId: string, walletAddress: string) => {
    const result = await mutateConnectWallet('/users/wallet/connect', {
      userId,
      walletAddress
    });

    if (result !== null) {
      // Refresh user data
      await getUser(userId);
    }
  }, [mutateConnectWallet, getUser]);

  // Disconnect wallet
  const disconnectWallet = useCallback(async (userId: string) => {
    const result = await mutateDisconnectWallet('/users/wallet/disconnect', {
      userId
    });

    if (result !== null) {
      // Refresh user data
      await getUser(userId);
    }
  }, [mutateDisconnectWallet, getUser]);

  // Refresh all user data
  const refreshUserData = useCallback(async (userId: string) => {
    await Promise.all([
      getUser(userId),
      getBalance(userId),
      getTransactions(userId)
    ]);
  }, [getUser, getBalance, getTransactions]);

  // Reset state
  const reset = useCallback(() => {
    setState({
      user: null,
      balance: null,
      transactions: [],
      loading: false,
      error: null
    });
  }, []);

  // Update loading and error states from API hooks
  useEffect(() => {
    const isLoading = userLoading || balanceLoading || transactionsLoading || connectLoading || disconnectLoading;
    const error = userError || balanceError || transactionsError || connectError || disconnectError;

    setState(prev => ({
      ...prev,
      loading: isLoading,
      error: error
    }));
  }, [
    userLoading, balanceLoading, transactionsLoading, connectLoading, disconnectLoading,
    userError, balanceError, transactionsError, connectError, disconnectError
  ]);

  return {
    ...state,
    getUser,
    getBalance,
    getTransactions,
    connectWallet,
    disconnectWallet,
    refreshUserData,
    reset
  };
};

// Helper hook for user permissions
export const useUserPermissions = (user: User | null) => {
  const hasRole = useCallback((role: UserRole): boolean => {
    return user?.roles.includes(role) ?? false;
  }, [user]);

  const hasAnyRole = useCallback((roles: UserRole[]): boolean => {
    return roles.some(role => hasRole(role));
  }, [hasRole]);

  const isAdmin = hasRole(UserRole.ADMIN);
  const isModerator = hasRole(UserRole.MODERATOR);
  const isUser = hasRole(UserRole.USER);
  const isStaff = isAdmin || isModerator;

  const canManageUsers = isAdmin;
  const canManageItems = isStaff;
  const canManageRaffles = isStaff;
  const canManageGames = isAdmin;
  const canViewAnalytics = isStaff;
  const canAdjustBalances = isAdmin;

  return {
    hasRole,
    hasAnyRole,
    isAdmin,
    isModerator,
    isUser,
    isStaff,
    canManageUsers,
    canManageItems,
    canManageRaffles,
    canManageGames,
    canViewAnalytics,
    canAdjustBalances
  };
};

// Utility functions for user display
export const formatPoints = (points: number): string => {
  if (points >= 1000000) {
    return `${(points / 1000000).toFixed(1)}M`;
  }
  if (points >= 1000) {
    return `${(points / 1000).toFixed(1)}K`;
  }
  return points.toString();
};

export const getPointTypeLabel = (pointType: PointType): string => {
  switch (pointType) {
    case PointType.REDEEMABLE:
      return 'Redeemable Points';
    case PointType.SOUL_BOUND:
      return 'Soul-Bound Points';
    default:
      return 'Points';
  }
};

export const getPointTypeDescription = (pointType: PointType): string => {
  switch (pointType) {
    case PointType.REDEEMABLE:
      return 'Can be spent on items, games, and raffles';
    case PointType.SOUL_BOUND:
      return 'Cannot be spent, used for voting power and status';
    default:
      return '';
  }
};

export const getRoleColor = (role: UserRole): string => {
  switch (role) {
    case UserRole.ADMIN:
      return 'text-red-400';
    case UserRole.MODERATOR:
      return 'text-yellow-400';
    case UserRole.USER:
      return 'text-blue-400';
    default:
      return 'text-gray-400';
  }
};

export const getRoleLabel = (role: UserRole): string => {
  switch (role) {
    case UserRole.ADMIN:
      return 'Administrator';
    case UserRole.MODERATOR:
      return 'Moderator';
    case UserRole.USER:
      return 'User';
    default:
      return 'Unknown';
  }
};