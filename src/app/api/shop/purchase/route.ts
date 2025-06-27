import { NextRequest, NextResponse } from 'next/server';
import { EnhancedShopService } from '@/services/enhanced-shop';
import { PurchaseRequest } from '@/types/item';
import { ItemCategory } from '@/types/enums';

export async function POST(request: NextRequest) {
  try {
    const body: PurchaseRequest = await request.json();
    
    // TODO: Add authentication check to get userId from session
    // For now, using userId from request body
    if (!body.userId || !body.itemId || !body.quantity) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: userId, itemId, quantity'
      }, { status: 400 });
    }

    if (body.quantity <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Quantity must be greater than 0'
      }, { status: 400 });
    }

    // Process the purchase
    const purchase = await EnhancedShopService.purchaseItem(body);

    // Check if the purchased item is a lootbox and auto-open it
    const item = await EnhancedShopService.getItemById(body.itemId);
    let lootboxResult = null;

    if (item && item.category === ItemCategory.LOOTBOX) {
      try {
        lootboxResult = await EnhancedShopService.openLootbox(
          body.userId,
          body.itemId,
          purchase.id
        );
      } catch (lootboxError) {
        console.error('Error opening lootbox:', lootboxError);
        // Don't fail the purchase if lootbox opening fails
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        purchase,
        lootboxResult
      }
    });

  } catch (error) {
    console.error('Error in shop purchase API:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process purchase'
    }, { status: 500 });
  }
}