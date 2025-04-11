import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const logPrefix = '[Discord Stats API]';

interface UserData {
  createdAt: string;
}

function logInfo(message: string, ...args: any[]) {
  console.info(`${logPrefix} ${message}`, ...args);
}

function logError(message: string, error?: any) {
  console.error(
    `${logPrefix} ${message}`,
    error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : error
  );
}

function logWarning(message: string, ...args: any[]) {
  console.warn(`${logPrefix} ${message}`, ...args);
}

function calculateExperiencePoints(createdAt: string): { totalXP: number, dailyXP: number } {
  const accountCreationDate = new Date(createdAt);
  const now = new Date();
  
  // Calculate days since account creation
  const daysSinceCreation = Math.floor((now.getTime() - accountCreationDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Base XP calculation:
  // - 100 XP per day since creation
  // - Bonus multiplier based on months (1.1x per month, capped at 2x)
  const monthsSinceCreation = daysSinceCreation / 30;
  const bonusMultiplier = Math.min(1 + (monthsSinceCreation * 0.1), 2);
  
  const baseXP = daysSinceCreation * 100;
  const totalXP = Math.floor(baseXP * bonusMultiplier);
  
  // Daily XP is a fixed rate plus small random variation
  const dailyXP = Math.floor(100 + (Math.random() * 20));
  
  return { totalXP, dailyXP };
}

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const startTime = performance.now();
  
  logInfo('Received stats request', {
    requestId,
    url: request.url,
    method: request.method,
  });

  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');

  if (!userId) {
    logWarning('Missing userId in request', { requestId });
    return NextResponse.json(
      { error: 'User ID is required' },
      { status: 400 }
    );
  }

  logInfo('Fetching user data', {
    requestId,
    userId,
  });

  try {
    // Query Firebase for user data
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('discordUserId', '==', userId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      logWarning('User not found', { requestId, userId });
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = querySnapshot.docs[0].data() as UserData;
    
    if (!userData.createdAt) {
      logWarning('User has no creation date', { requestId, userId });
      return NextResponse.json(
        { error: 'User data is incomplete' },
        { status: 500 }
      );
    }

    const { totalXP, dailyXP } = calculateExperiencePoints(userData.createdAt);

    logInfo('Successfully calculated XP', {
      requestId,
      userId,
      totalXP,
      dailyXP,
      accountAge: userData.createdAt,
      totalTimeMs: Math.round(performance.now() - startTime),
    });

    return NextResponse.json({
      totalMessages: totalXP,  // Using the same response structure for compatibility
      dailyMessages: dailyXP,  // Using the same response structure for compatibility
    });
  } catch (error) {
    logError('Failed to calculate XP', {
      requestId,
      userId,
      error,
      totalTimeMs: Math.round(performance.now() - startTime),
    });

    return NextResponse.json(
      { error: 'Failed to calculate experience points' },
      { status: 500 }
    );
  }
} 