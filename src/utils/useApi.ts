import { useState, useCallback } from 'react';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
}

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface UseApiReturn<T> extends UseApiState<T> {
  execute: (endpoint: string, options?: ApiRequestOptions) => Promise<T | null>;
  reset: () => void;
}

// Main useApi hook
export function useApi<T = any>(): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (endpoint: string, options: ApiRequestOptions = {}): Promise<T | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const url = endpoint.startsWith('http') ? endpoint : `/api${endpoint}`;
      
      const requestInit: RequestInit = {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      };

      if (options.body && (options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH')) {
        requestInit.body = JSON.stringify(options.body);
      }

      const response = await fetch(url, requestInit);
      const result: ApiResponse<T> = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      if (!result.success) {
        throw new Error(result.error || 'API request failed');
      }

      setState(prev => ({ ...prev, data: result.data || null, loading: false }));
      return result.data || null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}

// Specific API hooks for common operations
export function useApiMutation<T = any, TVariables = any>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const mutate = useCallback(async (
    endpoint: string, 
    variables?: TVariables,
    options?: Omit<ApiRequestOptions, 'body'>
  ): Promise<T | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const url = endpoint.startsWith('http') ? endpoint : `/api${endpoint}`;
      
      const response = await fetch(url, {
        method: options?.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        body: variables ? JSON.stringify(variables) : undefined,
      });

      const result: ApiResponse<T> = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      if (!result.success) {
        throw new Error(result.error || 'API request failed');
      }

      setState(prev => ({ ...prev, data: result.data || null, loading: false }));
      return result.data || null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, mutate, reset };
}

// Helper functions for common API patterns
export const apiUtils = {
  // GET request helper
  get: async <T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> => {
    const url = new URL(endpoint.startsWith('http') ? endpoint : `/api${endpoint}`, window.location.origin);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString());
    return response.json();
  },

  // POST request helper
  post: async <T>(endpoint: string, data?: any): Promise<ApiResponse<T>> => {
    const url = endpoint.startsWith('http') ? endpoint : `/api${endpoint}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: data ? JSON.stringify(data) : undefined,
    });
    
    return response.json();
  },

  // PUT request helper
  put: async <T>(endpoint: string, data?: any): Promise<ApiResponse<T>> => {
    const url = endpoint.startsWith('http') ? endpoint : `/api${endpoint}`;
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: data ? JSON.stringify(data) : undefined,
    });
    
    return response.json();
  },

  // DELETE request helper
  delete: async <T>(endpoint: string): Promise<ApiResponse<T>> => {
    const url = endpoint.startsWith('http') ? endpoint : `/api${endpoint}`;
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    
    return response.json();
  },
};

// Error handling utilities
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const handleApiError = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unknown error occurred';
};

// Type-safe API endpoint definitions
export const API_ENDPOINTS = {
  // User endpoints
  USERS: {
    GET_PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    GET_BALANCE: '/users/balance',
    GET_TRANSACTIONS: '/users/transactions',
  },
  
  // Shop endpoints
  SHOP: {
    GET_ITEMS: '/shop/items',
    GET_ITEM: (id: string) => `/shop/items/${id}`,
    PURCHASE_ITEM: '/shop/purchase',
    GET_FEATURED: '/shop/featured',
  },
  
  // Lootbox endpoints
  LOOTBOX: {
    OPEN: '/lootbox/open',
    GET_CONTENTS: (id: string) => `/lootbox/${id}/contents`,
    GET_HISTORY: '/lootbox/history',
  },
  
  // Raffle endpoints
  RAFFLES: {
    GET_ACTIVE: '/raffles/active',
    GET_RAFFLE: (id: string) => `/raffles/${id}`,
    PURCHASE_ENTRY: '/raffles/purchase-entry',
    GET_USER_ENTRIES: (raffleId: string) => `/raffles/${raffleId}/entries`,
  },
  
  // Game endpoints
  GAMES: {
    GET_GAMES: '/games',
    PLAY_PLINKO: '/games/plinko/play',
    GET_LEADERBOARD: (gameId: string) => `/games/${gameId}/leaderboard`,
    GET_HISTORY: '/games/history',
  },
  
  // Admin endpoints
  ADMIN: {
    USERS: '/admin/users',
    ITEMS: '/admin/items',
    RAFFLES: '/admin/raffles',
    GAMES: '/admin/games',
    STATS: '/admin/stats',
  },
} as const;