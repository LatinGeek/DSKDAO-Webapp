import { NextRequest, NextResponse } from 'next/server';
import { GameService } from '@/services/gameService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const gameId = searchParams.get('gameId');
    const type = searchParams.get('type'); // 'user' | 'leaderboard'
    const period = searchParams.get('period') || 'all_time'; // 'daily' | 'weekly' | 'monthly' | 'all_time'

    if (type === 'leaderboard' && gameId) {
      const leaderboard = await GameService.getGameLeaderboard(gameId, period as any);
      return NextResponse.json({
        success: true,
        data: leaderboard
      });
    }

    if (type === 'user' && userId && gameId) {
      const stats = await GameService.getUserGameStats(userId, gameId);
      return NextResponse.json({
        success: true,
        data: stats
      });
    }

    if (userId) {
      // Get user's game history
      const history = await GameService.getUserGameHistory(userId, gameId);
      return NextResponse.json({
        success: true,
        data: history
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Missing required parameters'
    }, { status: 400 });

  } catch (error) {
    console.error('Error in games stats API:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get game statistics'
    }, { status: 500 });
  }
}