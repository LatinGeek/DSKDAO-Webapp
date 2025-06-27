import { NextRequest, NextResponse } from 'next/server';
import { RaffleService } from '@/services/raffleService';
import { RaffleStatus } from '@/types/enums';

export async function GET(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as RaffleStatus;
    const includeEnded = searchParams.get('includeEnded') === 'true';

    let raffles;
    if (status) {
      raffles = await RaffleService.getRafflesByStatus(status);
    } else if (includeEnded) {
      raffles = await RaffleService.getAllRaffles();
    } else {
      raffles = await RaffleService.getActiveRaffles();
    }

    return NextResponse.json({
      success: true,
      data: raffles
    });

  } catch (error) {
    console.error('Error in admin raffles GET API:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get raffles'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    const body = await request.json();
    const { action, raffleId, adminUserId, ...raffleData } = body;

    if (!adminUserId) {
      return NextResponse.json({
        success: false,
        error: 'Missing adminUserId'
      }, { status: 400 });
    }

    switch (action) {
      case 'create':
        if (!raffleData.title || !raffleData.ticketPrice || !raffleData.maxEntries) {
          return NextResponse.json({
            success: false,
            error: 'Missing required fields: title, ticketPrice, maxEntries'
          }, { status: 400 });
        }

        const raffle = await RaffleService.createRaffle(raffleData, adminUserId);
        return NextResponse.json({
          success: true,
          data: raffle
        });

      case 'drawWinner':
        if (!raffleId) {
          return NextResponse.json({
            success: false,
            error: 'Missing raffleId'
          }, { status: 400 });
        }

        const result = await RaffleService.drawWinner(raffleId, adminUserId);
        return NextResponse.json({
          success: true,
          data: result
        });

      case 'cancel':
        if (!raffleId) {
          return NextResponse.json({
            success: false,
            error: 'Missing raffleId'
          }, { status: 400 });
        }

        await RaffleService.cancelRaffle(raffleId, adminUserId);
        return NextResponse.json({
          success: true,
          message: 'Raffle cancelled successfully'
        });

      case 'updateStatus':
        if (!raffleId || !raffleData.status) {
          return NextResponse.json({
            success: false,
            error: 'Missing raffleId or status'
          }, { status: 400 });
        }

        const updatedRaffle = await RaffleService.updateRaffleStatus(raffleId, raffleData.status, adminUserId);
        return NextResponse.json({
          success: true,
          data: updatedRaffle
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Error in admin raffles POST API:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to manage raffle'
    }, { status: 500 });
  }
}