import { NextRequest, NextResponse } from 'next/server';
import { RaffleService } from '@/services/raffleService';
import { PurchaseRaffleEntryRequest } from '@/types/entities/raffle';

export async function POST(request: NextRequest) {
  try {
    const body: PurchaseRaffleEntryRequest = await request.json();
    
    // TODO: Add authentication check to get userId from session
    if (!body.userId || !body.raffleId || !body.numberOfEntries) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: userId, raffleId, numberOfEntries'
      }, { status: 400 });
    }

    if (body.numberOfEntries <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Number of entries must be greater than 0'
      }, { status: 400 });
    }

    const result = await RaffleService.purchaseRaffleEntries(body);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error in raffle purchase API:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to purchase raffle entries'
    }, { status: 500 });
  }
}