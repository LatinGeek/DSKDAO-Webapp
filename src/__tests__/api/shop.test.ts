import { NextRequest } from 'next/server';

// Mock Firebase / services before importing routes
jest.mock('@/services/enhanced-shop', () => ({
  EnhancedShopService: {
    getItems: jest.fn(),
    purchaseItem: jest.fn(),
    getItemById: jest.fn(),
    openLootbox: jest.fn(),
    createItem: jest.fn(),
  },
}));

jest.mock('@/middleware/auth', () => ({
  authenticate: jest.fn(),
  hasAnyRole: jest.fn(),
}));

import { GET as getItems } from '@/app/api/shop/items/route';
import { POST as purchaseItem } from '@/app/api/shop/purchase/route';
import { EnhancedShopService } from '@/services/enhanced-shop';
import { authenticate, hasAnyRole } from '@/middleware/auth';
import { ItemCategory, ItemType, PurchaseStatus } from '@/types/enums';

const mockAuthenticate = authenticate as jest.MockedFunction<typeof authenticate>;
const mockGetItems = EnhancedShopService.getItems as jest.MockedFunction<typeof EnhancedShopService.getItems>;
const mockPurchase = EnhancedShopService.purchaseItem as jest.MockedFunction<typeof EnhancedShopService.purchaseItem>;
const mockGetItemById = EnhancedShopService.getItemById as jest.MockedFunction<typeof EnhancedShopService.getItemById>;

function makeRequest(url: string, options: { method?: string; body?: unknown } = {}): NextRequest {
  return new NextRequest(url, {
    method: options.method ?? 'GET',
    body: options.body ? JSON.stringify(options.body) : undefined,
    headers: options.body ? { 'Content-Type': 'application/json' } : {},
  });
}

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

describe('GET /api/shop/items', () => {
  it('returns a list of items', async () => {
    mockGetItems.mockResolvedValue({ items: [sampleItem], total: 1, hasMore: false } as any);

    const req = makeRequest('http://localhost:3000/api/shop/items');
    const res = await getItems(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.items).toHaveLength(1);
    expect(json.data.items[0].name).toBe('Dragon Egg');
  });

  it('returns 500 when service throws', async () => {
    mockGetItems.mockRejectedValue(new Error('DB error'));

    const req = makeRequest('http://localhost:3000/api/shop/items');
    const res = await getItems(req);
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.success).toBe(false);
    expect(json.error).toBe('DB error');
  });

  it('passes query params to service', async () => {
    mockGetItems.mockResolvedValue({ items: [], total: 0, hasMore: false } as any);

    const req = makeRequest('http://localhost:3000/api/shop/items?category=collectible&page=2&limit=10');
    await getItems(req);

    expect(mockGetItems).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 2,
        limit: 10,
        filters: expect.objectContaining({ category: 'collectible' }),
      })
    );
  });
});

describe('POST /api/shop/purchase', () => {
  it('returns 401 when not authenticated', async () => {
    mockAuthenticate.mockResolvedValue(null);

    const req = makeRequest('http://localhost:3000/api/shop/purchase', {
      method: 'POST',
      body: { itemId: 'item-1', quantity: 1, userId: 'user-1' },
    });
    const res = await purchaseItem(req);
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.success).toBe(false);
  });

  it('returns 400 when itemId is missing', async () => {
    mockAuthenticate.mockResolvedValue({ id: 'user-1', role: 'user' } as any);

    const req = makeRequest('http://localhost:3000/api/shop/purchase', {
      method: 'POST',
      body: { quantity: 1, userId: 'user-1' },
    });
    const res = await purchaseItem(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
  });

  it('returns 400 when quantity is zero', async () => {
    mockAuthenticate.mockResolvedValue({ id: 'user-1', role: 'user' } as any);

    const req = makeRequest('http://localhost:3000/api/shop/purchase', {
      method: 'POST',
      body: { itemId: 'item-1', quantity: 0, userId: 'user-1' },
    });
    const res = await purchaseItem(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
  });

  it('returns 200 with purchase data on success', async () => {
    mockAuthenticate.mockResolvedValue({ id: 'user-1', role: 'user' } as any);
    mockPurchase.mockResolvedValue(samplePurchase as any);
    mockGetItemById.mockResolvedValue(sampleItem as any);

    const req = makeRequest('http://localhost:3000/api/shop/purchase', {
      method: 'POST',
      body: { itemId: 'item-1', quantity: 1, userId: 'user-1' },
    });
    const res = await purchaseItem(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.purchase.id).toBe('purchase-1');
  });

  it('uses authenticated user id, ignoring body userId (prevents spoofing)', async () => {
    mockAuthenticate.mockResolvedValue({ id: 'real-user', role: 'user' } as any);
    mockPurchase.mockResolvedValue(samplePurchase as any);
    mockGetItemById.mockResolvedValue(sampleItem as any);

    const req = makeRequest('http://localhost:3000/api/shop/purchase', {
      method: 'POST',
      body: { itemId: 'item-1', quantity: 1, userId: 'spoofed-user' },
    });
    await purchaseItem(req);

    expect(mockPurchase).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'real-user' })
    );
  });

  it('returns 500 when purchase service throws', async () => {
    mockAuthenticate.mockResolvedValue({ id: 'user-1', role: 'user' } as any);
    mockPurchase.mockRejectedValue(new Error('Insufficient balance'));

    const req = makeRequest('http://localhost:3000/api/shop/purchase', {
      method: 'POST',
      body: { itemId: 'item-1', quantity: 1, userId: 'user-1' },
    });
    const res = await purchaseItem(req);
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.error).toBe('Insufficient balance');
  });
});
