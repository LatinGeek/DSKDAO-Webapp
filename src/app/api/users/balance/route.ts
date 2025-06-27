import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/services/userService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    // TODO: Add authentication check to get userId from session
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Missing userId parameter'
      }, { status: 400 });
    }

    const balance = await UserService.getUserBalance(userId);

    return NextResponse.json({
      success: true,
      data: balance
    });

  } catch (error) {
    console.error('Error in user balance API:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get user balance'
    }, { status: 500 });
  }
}