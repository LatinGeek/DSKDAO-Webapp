import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/db';
import { TransactionType } from '@/types/enums';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const type = searchParams.get('type') as TransactionType;
    const pointType = searchParams.get('pointType');
    
    // TODO: Add authentication check to ensure user can only see their own transactions
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Missing userId parameter'
      }, { status: 400 });
    }

    const constraints = [
      DatabaseService.where('userId', '==', userId)
    ];

    if (type) {
      constraints.push(DatabaseService.where('type', '==', type));
    }

    if (pointType) {
      constraints.push(DatabaseService.where('pointType', '==', pointType));
    }

    const result = await DatabaseService.getWithPagination(
      'transactions',
      constraints,
      page,
      limit,
      [DatabaseService.orderBy('createdAt', 'desc')]
    );

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error in user transactions API:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get transactions'
    }, { status: 500 });
  }
}