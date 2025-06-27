import { ItemType, ItemCategory, PurchaseStatus, LootboxRarity } from '@/types/enums';

export interface Item {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  amount: number; // Stock quantity
  active: boolean;
  
  // Enhanced fields for new features
  type: ItemType;
  category: ItemCategory;
  rarity?: LootboxRarity;
  
  // Metadata for different item types
  metadata?: {
    // For NFT items
    contractAddress?: string;
    tokenId?: string;
    chainId?: number;
    
    // For physical items
    shippingRequired?: boolean;
    weight?: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
    
    // For lootbox items
    possibleRewards?: string[]; // Array of item IDs
    openingAnimation?: string;
    
    // For access items
    durationDays?: number;
    accessLevel?: string;
  };
  
  // Admin fields
  featured: boolean;
  sortOrder: number;
  tags: string[];
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  
  // Optional expiry for limited-time items
  expiresAt?: string;
}

export interface PurchaseRequest {
  itemId: string;
  quantity: number;
  userId: string;
  metadata?: Record<string, any>;
}

export interface Purchase {
  id: string;
  itemId: string;
  userId: string;
  quantity: number;
  totalPrice: number;
  status: PurchaseStatus;
  
  // Enhanced fields
  transactionHash?: string; // For blockchain transactions
  fulfillmentData?: {
    // For physical items
    shippingAddress?: {
      name: string;
      address1: string;
      address2?: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    trackingNumber?: string;
    
    // For digital items
    deliveryMethod?: 'email' | 'discord' | 'wallet' | 'in_app';
    deliveredAt?: string;
  };
  
  // Metadata for special purchase types
  metadata?: Record<string, any>;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// Lootbox specific interfaces
export interface LootboxContent {
  id: string;
  lootboxId: string;
  possibleItems: LootboxItem[];
  totalWeight: number; // Sum of all item weights for probability calculation
  createdAt: string;
  updatedAt: string;
}

export interface LootboxItem {
  itemId: string;
  weight: number; // Higher weight = higher chance
  quantity: number;
  rarity: LootboxRarity;
}

export interface LootboxOpening {
  id: string;
  userId: string;
  lootboxId: string;
  purchaseId: string;
  wonItemId: string;
  wonQuantity: number;
  openedAt: string;
}

// Shop filter and search interfaces
export interface ShopFilters {
  category?: ItemCategory;
  type?: ItemType;
  priceMin?: number;
  priceMax?: number;
  rarity?: LootboxRarity;
  inStock?: boolean;
  featured?: boolean;
  tags?: string[];
}

export interface ShopSearchParams {
  query?: string;
  filters?: ShopFilters;
  sortBy?: 'name' | 'price' | 'createdAt' | 'popularity';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
} 