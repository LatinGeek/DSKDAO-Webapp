import { NextRequest, NextResponse } from 'next/server';
import { EnhancedShopService } from '@/services/enhanced-shop';
import { ShopSearchParams } from '@/types/item';
import { ItemCategory, ItemType, LootboxRarity } from '@/types/enums';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const params: ShopSearchParams = {
      query: searchParams.get('query') || undefined,
      sortBy: (searchParams.get('sortBy') as 'name' | 'price' | 'createdAt' | 'popularity') || 'sortOrder',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      filters: {}
    };

    // Parse filters
    if (searchParams.get('category')) {
      params.filters!.category = searchParams.get('category') as ItemCategory;
    }
    
    if (searchParams.get('type')) {
      params.filters!.type = searchParams.get('type') as ItemType;
    }
    
    if (searchParams.get('rarity')) {
      params.filters!.rarity = searchParams.get('rarity') as LootboxRarity;
    }
    
    if (searchParams.get('featured') !== null) {
      params.filters!.featured = searchParams.get('featured') === 'true';
    }
    
    if (searchParams.get('inStock') !== null) {
      params.filters!.inStock = searchParams.get('inStock') === 'true';
    }
    
    if (searchParams.get('priceMin')) {
      params.filters!.priceMin = parseInt(searchParams.get('priceMin')!);
    }
    
    if (searchParams.get('priceMax')) {
      params.filters!.priceMax = parseInt(searchParams.get('priceMax')!);
    }
    
    if (searchParams.get('tags')) {
      params.filters!.tags = searchParams.get('tags')!.split(',');
    }

    // Get items from service
    const result = await EnhancedShopService.getItems(params);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error in shop items API:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get shop items'
    }, { status: 500 });
  }
}

// Admin endpoint to create new items
export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication and admin role check
    const body = await request.json();
    
    const item = await EnhancedShopService.createItem(body);

    return NextResponse.json({
      success: true,
      data: item
    });

  } catch (error) {
    console.error('Error creating item:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create item'
    }, { status: 500 });
  }
}