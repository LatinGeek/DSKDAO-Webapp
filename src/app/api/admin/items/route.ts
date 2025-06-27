import { NextRequest, NextResponse } from 'next/server';
import { EnhancedShopService } from '@/services/enhanced-shop';
import { ItemCategory, ItemType } from '@/types/enums';

export async function GET(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';
    
    const filters = includeInactive ? {} : { active: true };
    
    const items = await EnhancedShopService.getItemsWithFilters({
      filters,
      sortBy: 'sortOrder',
      sortOrder: 'asc',
      limit: 1000 // Admin gets all items
    });

    return NextResponse.json({
      success: true,
      data: items
    });

  } catch (error) {
    console.error('Error in admin items GET API:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get items'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    const itemData = await request.json();
    
    // Validate required fields
    if (!itemData.name || !itemData.price || !itemData.type || !itemData.category) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: name, price, type, category'
      }, { status: 400 });
    }

    const item = await EnhancedShopService.createItem(itemData);

    return NextResponse.json({
      success: true,
      data: item
    });

  } catch (error) {
    console.error('Error in admin items POST API:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create item'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    const { itemId, ...updateData } = await request.json();
    
    if (!itemId) {
      return NextResponse.json({
        success: false,
        error: 'Missing itemId'
      }, { status: 400 });
    }

    const item = await EnhancedShopService.updateItem(itemId, updateData);

    return NextResponse.json({
      success: true,
      data: item
    });

  } catch (error) {
    console.error('Error in admin items PUT API:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update item'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');
    
    if (!itemId) {
      return NextResponse.json({
        success: false,
        error: 'Missing itemId parameter'
      }, { status: 400 });
    }

    await EnhancedShopService.deleteItem(itemId);

    return NextResponse.json({
      success: true,
      message: 'Item deleted successfully'
    });

  } catch (error) {
    console.error('Error in admin items DELETE API:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete item'
    }, { status: 500 });
  }
}