import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService, UserDB } from '@/lib/db';
import { UserService } from '@/services/userService';
import { UserRole, PointType, TransactionType } from '@/types/enums';

export async function GET(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const role = searchParams.get('role') as UserRole;
    
    const constraints = [];
    if (role) {
      constraints.push(DatabaseService.where('roles', 'array-contains', role));
    }

    const result = await DatabaseService.getWithPagination(
      'users',
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
    console.error('Error in admin users API:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get users'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    const body = await request.json();
    const { action, userId, data } = body;

    switch (action) {
      case 'updateRoles':
        const updatedUser = await UserService.updateUserRoles(userId, data.roles);
        return NextResponse.json({
          success: true,
          data: updatedUser
        });

      case 'adjustBalance':
        await UserService.updateUserBalance(
          userId,
          data.pointType as PointType,
          data.amount,
          TransactionType.ADMIN_ADJUSTMENT,
          data.description || 'Admin balance adjustment',
          { adminUserId: data.adminUserId }
        );
        const user = await DatabaseService.getById('users', userId);
        return NextResponse.json({
          success: true,
          data: user
        });

      case 'updateDiscordRoles':
        await UserService.syncDiscordRoles(userId, data.discordRoles);
        const syncedUser = await DatabaseService.getById('users', userId);
        return NextResponse.json({
          success: true,
          data: syncedUser
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Error in admin users POST API:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update user'
    }, { status: 500 });
  }
}