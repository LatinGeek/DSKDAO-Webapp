import { renderHook, act } from '@testing-library/react';
import { ItemCategory, ItemType, PurchaseStatus } from '@/types/enums';

// Mock the underlying API utilities
const mockExecuteGetItems = jest.fn();
const mockMutatePurchase = jest.fn();

jest.mock('@/utils/useApi', () => ({
  useApi: jest.fn(() => ({
    execute: mockExecuteGetItems,
    loading: false,
    error: null,
  })),
  useApiMutation: jest.fn(() => ({
    mutate: mockMutatePurchase,
    loading: false,
    error: null,
  })),
  API_ENDPOINTS: {
    SHOP: {
      GET_ITEMS: '/api/shop/items',
      GET_FEATURED: '/api/shop/items?featured=true',
      PURCHASE_ITEM: '/api/shop/purchase',
    },
  },
}));

const { useApi, useApiMutation } = require('@/utils/useApi');

const sampleItem = {
  id: 'item-1',
  name: 'Dragon Egg',
  description: 'Rare',
  image: '',
  price: 200,
  amount: 10,
  active: true,
  type: ItemType.DIGITAL,
  category: ItemCategory.COLLECTIBLE,
  featured: false,
  sortOrder: 1,
  tags: [],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const samplePurchase = {
  id: 'purchase-1',
  itemId: 'item-1',
  userId: 'user-1',
  quantity: 1,
  totalPrice: 200,
  status: PurchaseStatus.COMPLETED,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

import { useShop } from '@/hooks/useShop';

describe('useShop', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useApi.mockImplementation(() => ({
      execute: mockExecuteGetItems,
      loading: false,
      error: null,
    }));
    useApiMutation.mockImplementation(() => ({
      mutate: mockMutatePurchase,
      loading: false,
      error: null,
    }));
  });

  it('initialises with empty items and no error', () => {
    const { result } = renderHook(() => useShop());
    expect(result.current.items).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('returns items after getItems resolves', async () => {
    mockExecuteGetItems.mockResolvedValue({
      items: [sampleItem],
      total: 1,
      hasMore: false,
    });

    const { result } = renderHook(() => useShop());

    await act(async () => {
      await result.current.getItems();
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].name).toBe('Dragon Egg');
    expect(result.current.total).toBe(1);
    expect(result.current.hasMore).toBe(false);
  });

  it('sets error when getItems throws', async () => {
    mockExecuteGetItems.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useShop());

    await act(async () => {
      await result.current.getItems();
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.items).toEqual([]);
  });

  it('returns purchase result from purchaseItem', async () => {
    mockMutatePurchase.mockResolvedValue({ purchase: samplePurchase });
    mockExecuteGetItems.mockResolvedValue({ items: [sampleItem], total: 1, hasMore: false });

    const { result } = renderHook(() => useShop());

    let purchase;
    await act(async () => {
      purchase = await result.current.purchaseItem('item-1', 1, 'user-1');
    });

    expect(purchase).toEqual({ purchase: samplePurchase });
    expect(mockMutatePurchase).toHaveBeenCalledWith(
      '/api/shop/purchase',
      { itemId: 'item-1', quantity: 1, userId: 'user-1', metadata: {} }
    );
  });

  it('returns null when purchase API returns null', async () => {
    mockMutatePurchase.mockResolvedValue(null);

    const { result } = renderHook(() => useShop());

    let purchase;
    await act(async () => {
      purchase = await result.current.purchaseItem('item-1', 1, 'user-1');
    });

    expect(purchase).toBeNull();
  });

  it('reset clears all state', async () => {
    mockExecuteGetItems.mockResolvedValue({ items: [sampleItem], total: 1, hasMore: false });

    const { result } = renderHook(() => useShop());

    await act(async () => {
      await result.current.getItems();
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.items).toEqual([]);
    expect(result.current.total).toBe(0);
    expect(result.current.error).toBeNull();
  });

  it('reflects loading state from useApiMutation', () => {
    useApiMutation.mockImplementation(() => ({
      mutate: mockMutatePurchase,
      loading: true,
      error: null,
    }));

    const { result } = renderHook(() => useShop());
    expect(result.current.loading).toBe(true);
  });

  it('reflects error state from useApi', () => {
    useApi.mockImplementation(() => ({
      execute: mockExecuteGetItems,
      loading: false,
      error: 'Service unavailable',
    }));

    const { result } = renderHook(() => useShop());
    expect(result.current.error).toBe('Service unavailable');
  });
});
