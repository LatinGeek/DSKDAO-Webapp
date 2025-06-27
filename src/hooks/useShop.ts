import { useState, useEffect, useCallback } from 'react';
import { useApi, useApiMutation, API_ENDPOINTS } from '@/utils/useApi';
import { Item, ShopSearchParams, Purchase, LootboxOpening } from '@/types/item';
import { ItemCategory, ItemType, LootboxRarity } from '@/types/enums';

export interface UseShopState {
  items: Item[];
  featuredItems: Item[];
  loading: boolean;
  error: string | null;
  total: number;
  hasMore: boolean;
}

export interface UseShopActions {
  getItems: (params?: ShopSearchParams) => Promise<void>;
  getFeaturedItems: () => Promise<void>;
  purchaseItem: (itemId: string, quantity: number, userId: string) => Promise<{ purchase: Purchase; lootboxResult?: any } | null>;
  refreshItems: () => Promise<void>;
  reset: () => void;
}

export interface UseShopReturn extends UseShopState, UseShopActions {}

export const useShop = (): UseShopReturn => {
  const [state, setState] = useState<UseShopState>({
    items: [],
    featuredItems: [],
    loading: false,
    error: null,
    total: 0,
    hasMore: false
  });

  const { execute: executeGetItems, loading: itemsLoading, error: itemsError } = useApi<{
    items: Item[];
    total: number;
    hasMore: boolean;
  }>();

  const { execute: executeGetFeatured, loading: featuredLoading, error: featuredError } = useApi<Item[]>();

  const { mutate: mutatePurchase, loading: purchaseLoading, error: purchaseError } = useApiMutation<{
    purchase: Purchase;
    lootboxResult?: {
      wonItem: Item;
      wonQuantity: number;
      opening: LootboxOpening;
    };
  }>();

  // Get items with optional filtering and search
  const getItems = useCallback(async (params?: ShopSearchParams) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await executeGetItems(API_ENDPOINTS.SHOP.GET_ITEMS, {
        method: 'GET',
        headers: {},
        body: params
      });

      if (result) {
        setState(prev => ({
          ...prev,
          items: result.items,
          total: result.total,
          hasMore: result.hasMore,
          loading: false
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to get items',
        loading: false
      }));
    }
  }, [executeGetItems]);

  // Get featured items
  const getFeaturedItems = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await executeGetFeatured(API_ENDPOINTS.SHOP.GET_FEATURED);

      if (result) {
        setState(prev => ({
          ...prev,
          featuredItems: result,
          loading: false
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to get featured items',
        loading: false
      }));
    }
  }, [executeGetFeatured]);

  // Purchase an item
  const purchaseItem = useCallback(async (
    itemId: string, 
    quantity: number, 
    userId: string
  ): Promise<{ purchase: Purchase; lootboxResult?: any } | null> => {
    const purchaseData = {
      itemId,
      quantity,
      userId,
      metadata: {}
    };

    const result = await mutatePurchase(API_ENDPOINTS.SHOP.PURCHASE_ITEM, purchaseData);
    
    if (result) {
      // Refresh items to update stock counts
      await getItems();
    }

    return result;
  }, [mutatePurchase, getItems]);

  // Refresh current items
  const refreshItems = useCallback(async () => {
    await getItems();
    await getFeaturedItems();
  }, [getItems, getFeaturedItems]);

  // Reset state
  const reset = useCallback(() => {
    setState({
      items: [],
      featuredItems: [],
      loading: false,
      error: null,
      total: 0,
      hasMore: false
    });
  }, []);

  // Update loading and error states from API hooks
  useEffect(() => {
    const isLoading = itemsLoading || featuredLoading || purchaseLoading;
    const error = itemsError || featuredError || purchaseError;

    setState(prev => ({
      ...prev,
      loading: isLoading,
      error: error
    }));
  }, [itemsLoading, featuredLoading, purchaseLoading, itemsError, featuredError, purchaseError]);

  return {
    ...state,
    getItems,
    getFeaturedItems,
    purchaseItem,
    refreshItems,
    reset
  };
};

// Helper hook for shop filters
export const useShopFilters = () => {
  const [filters, setFilters] = useState<ShopSearchParams>({
    query: '',
    sortBy: 'sortOrder',
    sortOrder: 'asc',
    page: 1,
    limit: 20,
    filters: {}
  });

  const updateFilter = useCallback((key: keyof ShopSearchParams, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value // Reset page when other filters change
    }));
  }, []);

  const updateNestedFilter = useCallback((key: keyof NonNullable<ShopSearchParams['filters']>, value: any) => {
    setFilters(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [key]: value
      },
      page: 1 // Reset page when filters change
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      query: '',
      sortBy: 'sortOrder',
      sortOrder: 'asc',
      page: 1,
      limit: 20,
      filters: {}
    });
  }, []);

  const clearFilter = useCallback((key: keyof NonNullable<ShopSearchParams['filters']>) => {
    setFilters(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [key]: undefined
      },
      page: 1
    }));
  }, []);

  return {
    filters,
    updateFilter,
    updateNestedFilter,
    resetFilters,
    clearFilter
  };
};

// Item category options for filters
export const ITEM_CATEGORIES = [
  { value: ItemCategory.COLLECTIBLE, label: 'Collectibles' },
  { value: ItemCategory.UTILITY, label: 'Utility Items' },
  { value: ItemCategory.COSMETIC, label: 'Cosmetics' },
  { value: ItemCategory.ACCESS, label: 'Access Passes' },
  { value: ItemCategory.LOOTBOX, label: 'Loot Boxes' },
  { value: ItemCategory.RAFFLE_TICKET, label: 'Raffle Tickets' }
];

// Item type options for filters  
export const ITEM_TYPES = [
  { value: ItemType.DIGITAL, label: 'Digital' },
  { value: ItemType.PHYSICAL, label: 'Physical' },
  { value: ItemType.NFT, label: 'NFT' },
  { value: ItemType.TOKEN, label: 'Tokens' }
];

// Rarity options for filters
export const RARITY_OPTIONS = [
  { value: LootboxRarity.COMMON, label: 'Common' },
  { value: LootboxRarity.UNCOMMON, label: 'Uncommon' },
  { value: LootboxRarity.RARE, label: 'Rare' },
  { value: LootboxRarity.EPIC, label: 'Epic' },
  { value: LootboxRarity.LEGENDARY, label: 'Legendary' }
];