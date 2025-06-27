import { DatabaseService, ItemDB, COLLECTIONS } from '@/lib/db';
import { UserService } from './userService';
import { Item, Purchase, PurchaseRequest, ShopFilters, ShopSearchParams, LootboxContent, LootboxOpening } from '@/types/item';
import { ItemType, ItemCategory, PurchaseStatus, TransactionType, PointType, LootboxRarity } from '@/types/enums';

export class ShopError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ShopError';
  }
}

export class EnhancedShopService {
  // Get all active items with optional filtering
  static async getItems(params?: ShopSearchParams): Promise<{
    items: Item[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      const filters = [];
      
      // Base filter for active items
      filters.push(DatabaseService.where('active', '==', true));
      
      // Apply search filters
      if (params?.filters) {
        const { filters: searchFilters } = params;
        
        if (searchFilters.category) {
          filters.push(DatabaseService.where('category', '==', searchFilters.category));
        }
        
        if (searchFilters.type) {
          filters.push(DatabaseService.where('type', '==', searchFilters.type));
        }
        
        if (searchFilters.featured !== undefined) {
          filters.push(DatabaseService.where('featured', '==', searchFilters.featured));
        }
        
        if (searchFilters.inStock) {
          filters.push(DatabaseService.where('amount', '>', 0));
        }
        
        if (searchFilters.rarity) {
          filters.push(DatabaseService.where('rarity', '==', searchFilters.rarity));
        }
      }
      
      // Apply sorting
      let sortField = 'sortOrder';
      let sortDirection: 'asc' | 'desc' = 'asc';
      
      if (params?.sortBy) {
        sortField = params.sortBy;
        sortDirection = params.sortOrder || 'asc';
      }
      
      filters.push(DatabaseService.orderBy(sortField, sortDirection));
      
      // Get paginated results
      const pageSize = params?.limit || 20;
      const result = await DatabaseService.getPaginated<Item>(
        COLLECTIONS.ITEMS,
        pageSize,
        params?.page ? `page_${params.page}` : undefined,
        filters
      );
      
      // Filter by price range (Firestore doesn't support range queries with other filters)
      let filteredItems = result.items;
      if (params?.filters?.priceMin !== undefined || params?.filters?.priceMax !== undefined) {
        filteredItems = result.items.filter(item => {
          if (params.filters!.priceMin !== undefined && item.price < params.filters!.priceMin) {
            return false;
          }
          if (params.filters!.priceMax !== undefined && item.price > params.filters!.priceMax) {
            return false;
          }
          return true;
        });
      }
      
      // Text search (client-side for now)
      if (params?.query) {
        const query = params.query.toLowerCase();
        filteredItems = filteredItems.filter(item =>
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }
      
      return {
        items: filteredItems,
        total: filteredItems.length,
        hasMore: result.hasMore
      };
    } catch (error) {
      console.error('Error getting items:', error);
      throw new ShopError('Failed to get items');
    }
  }

  // Get featured items
  static async getFeaturedItems(): Promise<Item[]> {
    try {
      return await ItemDB.getFeaturedItems();
    } catch (error) {
      console.error('Error getting featured items:', error);
      throw new ShopError('Failed to get featured items');
    }
  }

  // Get item by ID
  static async getItemById(itemId: string): Promise<Item | null> {
    try {
      return await DatabaseService.getById<Item>(COLLECTIONS.ITEMS, itemId);
    } catch (error) {
      console.error('Error getting item by ID:', error);
      throw new ShopError('Failed to get item');
    }
  }

  // Purchase an item
  static async purchaseItem(request: PurchaseRequest): Promise<Purchase> {
    const { itemId, quantity, userId, metadata } = request;

    try {
      return await DatabaseService.runTransaction(async (transaction) => {
        // Get the item
        const item = await DatabaseService.getById<Item>(COLLECTIONS.ITEMS, itemId);
        if (!item) {
          throw new ShopError('Item not found');
        }

        // Validate item availability
        if (!item.active) {
          throw new ShopError('Item is not available for purchase');
        }

        if (item.amount < quantity) {
          throw new ShopError('Insufficient stock');
        }

        // Calculate total price
        const totalPrice = item.price * quantity;

        // Check user balance
        const hasInsufficientBalance = await UserService.hasInsufficientBalance(
          userId,
          PointType.REDEEMABLE,
          totalPrice
        );

        if (hasInsufficientBalance) {
          throw new ShopError('Insufficient redeemable points');
        }

        // Create purchase record
        const purchase: Omit<Purchase, 'id' | 'createdAt' | 'updatedAt'> = {
          itemId,
          userId,
          quantity,
          totalPrice,
          status: PurchaseStatus.PENDING,
          metadata: metadata || {}
        };

        const createdPurchase = await DatabaseService.create<Purchase>(COLLECTIONS.PURCHASES, purchase);

        // Update item stock
        await DatabaseService.update<Item>(COLLECTIONS.ITEMS, itemId, {
          amount: item.amount - quantity
        });

        // Update user balance and create transaction
        await UserService.updateUserBalance(
          userId,
          PointType.REDEEMABLE,
          -totalPrice,
          TransactionType.PURCHASE,
          `Purchased ${quantity}x ${item.name}`,
          {
            itemId: item.id,
            itemName: item.name,
            quantity,
            unitPrice: item.price,
            purchaseId: createdPurchase.id
          },
          createdPurchase.id
        );

        // Complete the purchase
        await DatabaseService.update<Purchase>(COLLECTIONS.PURCHASES, createdPurchase.id, {
          status: PurchaseStatus.COMPLETED
        });

        return { ...createdPurchase, status: PurchaseStatus.COMPLETED };
      });
    } catch (error) {
      if (error instanceof ShopError) {
        throw error;
      }
      console.error('Error purchasing item:', error);
      throw new ShopError('Failed to process purchase');
    }
  }

  // Open a lootbox
  static async openLootbox(userId: string, lootboxId: string, purchaseId: string): Promise<{
    wonItem: Item;
    wonQuantity: number;
    opening: LootboxOpening;
  }> {
    try {
      return await DatabaseService.runTransaction(async (transaction) => {
        // Get lootbox contents
        const lootboxContent = await DatabaseService.getById<LootboxContent>(COLLECTIONS.LOOTBOX_CONTENTS, lootboxId);
        if (!lootboxContent) {
          throw new ShopError('Lootbox contents not found');
        }

        // Select random item based on weights
        const wonItemData = this.selectRandomLootboxItem(lootboxContent);
        const wonItem = await DatabaseService.getById<Item>(COLLECTIONS.ITEMS, wonItemData.itemId);
        
        if (!wonItem) {
          throw new ShopError('Won item not found');
        }

        // Create opening record
        const opening: Omit<LootboxOpening, 'id' | 'openedAt'> = {
          userId,
          lootboxId,
          purchaseId,
          wonItemId: wonItem.id,
          wonQuantity: wonItemData.quantity
        };

        const createdOpening = await DatabaseService.create<LootboxOpening>(COLLECTIONS.LOOTBOX_OPENINGS, {
          ...opening,
          openedAt: new Date().toISOString()
        });

        // Create transaction for the won item (if it's points)
        if (wonItem.type === ItemType.TOKEN) {
          await UserService.updateUserBalance(
            userId,
            PointType.REDEEMABLE,
            wonItemData.quantity,
            TransactionType.LOOTBOX_OPEN,
            `Won ${wonItemData.quantity}x ${wonItem.name} from lootbox`,
            {
              lootboxId,
              lootboxName: `Lootbox #${lootboxId}`,
              wonItemId: wonItem.id,
              wonItemName: wonItem.name,
              wonQuantity: wonItemData.quantity,
              openingId: createdOpening.id
            },
            createdOpening.id
          );
        }

        return {
          wonItem,
          wonQuantity: wonItemData.quantity,
          opening: createdOpening
        };
      });
    } catch (error) {
      if (error instanceof ShopError) {
        throw error;
      }
      console.error('Error opening lootbox:', error);
      throw new ShopError('Failed to open lootbox');
    }
  }

  // Helper method to select random lootbox item based on weights
  private static selectRandomLootboxItem(lootboxContent: LootboxContent) {
    const random = Math.random() * lootboxContent.totalWeight;
    let currentWeight = 0;

    for (const item of lootboxContent.possibleItems) {
      currentWeight += item.weight;
      if (random <= currentWeight) {
        return item;
      }
    }

    // Fallback to last item if something goes wrong
    return lootboxContent.possibleItems[lootboxContent.possibleItems.length - 1];
  }

  // Get user's purchase history
  static async getPurchaseHistory(userId: string, limit: number = 50): Promise<Purchase[]> {
    try {
      return await DatabaseService.getMany<Purchase>(
        COLLECTIONS.PURCHASES,
        [
          DatabaseService.where('userId', '==', userId),
          DatabaseService.orderBy('createdAt', 'desc'),
          DatabaseService.limit(limit)
        ]
      );
    } catch (error) {
      console.error('Error getting purchase history:', error);
      throw new ShopError('Failed to get purchase history');
    }
  }

  // Get user's lootbox opening history
  static async getLootboxHistory(userId: string, limit: number = 50): Promise<LootboxOpening[]> {
    try {
      return await DatabaseService.getMany<LootboxOpening>(
        COLLECTIONS.LOOTBOX_OPENINGS,
        [
          DatabaseService.where('userId', '==', userId),
          DatabaseService.orderBy('openedAt', 'desc'),
          DatabaseService.limit(limit)
        ]
      );
    } catch (error) {
      console.error('Error getting lootbox history:', error);
      throw new ShopError('Failed to get lootbox history');
    }
  }

  // Admin: Create new item
  static async createItem(itemData: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>): Promise<Item> {
    try {
      return await DatabaseService.create<Item>(COLLECTIONS.ITEMS, itemData);
    } catch (error) {
      console.error('Error creating item:', error);
      throw new ShopError('Failed to create item');
    }
  }

  // Admin: Update item
  static async updateItem(itemId: string, updateData: Partial<Omit<Item, 'id' | 'createdAt'>>): Promise<void> {
    try {
      await DatabaseService.update<Item>(COLLECTIONS.ITEMS, itemId, updateData);
    } catch (error) {
      console.error('Error updating item:', error);
      throw new ShopError('Failed to update item');
    }
  }

  // Admin: Delete item
  static async deleteItem(itemId: string): Promise<void> {
    try {
      await DatabaseService.delete(COLLECTIONS.ITEMS, itemId);
    } catch (error) {
      console.error('Error deleting item:', error);
      throw new ShopError('Failed to delete item');
    }
  }
}