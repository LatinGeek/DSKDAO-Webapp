import { NextRequest, NextResponse } from 'next/server';
import { RaffleService } from '@/services/raffleService';

export async function GET(request: NextRequest) {
  try {
    const raffles = await RaffleService.getActiveRaffles();

    return NextResponse.json({
      success: true,
      data: raffles
    });

  } catch (error) {
    console.error('Error in active raffles API:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get active raffles'
    }, { status: 500 });
  }
}