import { NextRequest, NextResponse } from 'next/server';
import { GameService } from '@/services/gameService';
import { PlinkoPlayRequest } from '@/types/entities/game';

export async function POST(request: NextRequest) {
  try {
    const body: PlinkoPlayRequest = await request.json();
    
    // TODO: Add authentication check to get userId from session
    if (!body.userId || !body.gameId || !body.betAmount || !body.gameSpecificData?.riskLevel) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: userId, gameId, betAmount, riskLevel'
      }, { status: 400 });
    }

    if (body.betAmount <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Bet amount must be greater than 0'
      }, { status: 400 });
    }

    const validRiskLevels = ['low', 'medium', 'high'];
    if (!validRiskLevels.includes(body.gameSpecificData.riskLevel)) {
      return NextResponse.json({
        success: false,
        error: 'Risk level must be low, medium, or high'
      }, { status: 400 });
    }

    const result = await GameService.playPlinko(body);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error in Plinko game API:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to play Plinko game'
    }, { status: 500 });
  }
}