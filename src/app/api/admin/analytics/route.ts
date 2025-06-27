import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/middleware/auth';
import { DatabaseService, COLLECTIONS } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Check admin permissions
    const authResult = await requireAdmin(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '7d';
    const metric = searchParams.get('metric') || 'all';

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case '1d':
        startDate.setDate(endDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 7);
    }

    // Get analytics data based on requested metric
    let analyticsData: any = {};

    if (metric === 'all' || metric === 'system') {
      analyticsData.systemMetrics = await getSystemMetrics(startDate, endDate);
    }

    if (metric === 'all' || metric === 'users') {
      analyticsData.userMetrics = await getUserMetrics(startDate, endDate);
    }

    if (metric === 'all' || metric === 'transactions') {
      analyticsData.transactionMetrics = await getTransactionMetrics(startDate, endDate);
    }

    if (metric === 'all' || metric === 'games') {
      analyticsData.gameMetrics = await getGameMetrics(startDate, endDate);
    }

    if (metric === 'all' || metric === 'items') {
      analyticsData.itemMetrics = await getItemMetrics(startDate, endDate);
    }

    if (metric === 'all' || metric === 'performance') {
      analyticsData.performanceMetrics = await getPerformanceMetrics();
    }

    return NextResponse.json({
      success: true,
      data: analyticsData,
      timeRange,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}

// System Metrics
async function getSystemMetrics(startDate: Date, endDate: Date) {
  try {
    // Get total users
    const totalUsers = await DatabaseService.count(COLLECTIONS.USERS);
    
    // Get active users (logged in within timeframe)
    const activeUsers = await DatabaseService.getMany(
      COLLECTIONS.USERS,
      [
        DatabaseService.where('lastLoginAt', '>=', startDate),
        DatabaseService.where('lastLoginAt', '<=', endDate)
      ]
    );

    // Get total transactions
    const totalTransactions = await DatabaseService.count(COLLECTIONS.TRANSACTIONS);

    // Get point totals
    const users = await DatabaseService.getMany(COLLECTIONS.USERS, []);
    const totalPointsAwarded = users.reduce((sum, user) => sum + (user.redeemablePoints || 0) + (user.soulBoundPoints || 0), 0);
    const totalRedeemablePoints = users.reduce((sum, user) => sum + (user.redeemablePoints || 0), 0);
    const totalSoulBoundPoints = users.reduce((sum, user) => sum + (user.soulBoundPoints || 0), 0);

    // Get recent transactions for revenue calculation
    const recentTransactions = await DatabaseService.getMany(
      COLLECTIONS.TRANSACTIONS,
      [
        DatabaseService.where('createdAt', '>=', startDate),
        DatabaseService.where('createdAt', '<=', endDate)
      ]
    );

    const revenue = recentTransactions
      .filter(t => t.type === 'SHOP_PURCHASE')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return {
      totalUsers,
      activeUsers: activeUsers.length,
      totalTransactions,
      totalPointsAwarded,
      totalRedeemablePoints,
      totalSoulBoundPoints,
      revenue,
      newUsersInPeriod: await getNewUsersCount(startDate, endDate),
      transactionsInPeriod: recentTransactions.length
    };
  } catch (error) {
    console.error('Error getting system metrics:', error);
    return null;
  }
}

// User Metrics
async function getUserMetrics(startDate: Date, endDate: Date) {
  try {
    // Get user activity over time
    const userActivity = await getUserActivityOverTime(startDate, endDate);
    
    // Get user role distribution
    const allUsers = await DatabaseService.getMany(COLLECTIONS.USERS, []);
    const roleDistribution = allUsers.reduce((acc, user) => {
      const roles = user.roles || ['USER'];
      roles.forEach((role: string) => {
        acc[role] = (acc[role] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    // Get retention metrics
    const retentionData = await getUserRetentionData(startDate, endDate);

    return {
      userActivity,
      roleDistribution,
      retentionData,
      averagePointsPerUser: Math.round(
        allUsers.reduce((sum, user) => sum + (user.redeemablePoints || 0), 0) / allUsers.length
      )
    };
  } catch (error) {
    console.error('Error getting user metrics:', error);
    return null;
  }
}

// Transaction Metrics
async function getTransactionMetrics(startDate: Date, endDate: Date) {
  try {
    const transactions = await DatabaseService.getMany(
      COLLECTIONS.TRANSACTIONS,
      [
        DatabaseService.where('createdAt', '>=', startDate),
        DatabaseService.where('createdAt', '<=', endDate)
      ]
    );

    // Group by type
    const transactionsByType = transactions.reduce((acc, transaction) => {
      const type = transaction.type || 'UNKNOWN';
      if (!acc[type]) {
        acc[type] = { count: 0, totalAmount: 0 };
      }
      acc[type].count++;
      acc[type].totalAmount += Math.abs(transaction.amount || 0);
      return acc;
    }, {} as Record<string, { count: number; totalAmount: number }>);

    // Daily transaction volume
    const dailyVolume = await getDailyTransactionVolume(startDate, endDate);

    return {
      transactionsByType,
      dailyVolume,
      totalTransactionsInPeriod: transactions.length,
      totalVolumeInPeriod: transactions.reduce((sum, t) => sum + Math.abs(t.amount || 0), 0)
    };
  } catch (error) {
    console.error('Error getting transaction metrics:', error);
    return null;
  }
}

// Game Metrics
async function getGameMetrics(startDate: Date, endDate: Date) {
  try {
    // Get game sessions from transactions
    const gameTransactions = await DatabaseService.getMany(
      COLLECTIONS.TRANSACTIONS,
      [
        DatabaseService.where('type', '==', 'GAME_BET'),
        DatabaseService.where('createdAt', '>=', startDate),
        DatabaseService.where('createdAt', '<=', endDate)
      ]
    );

    // Group by game type
    const gameStats = gameTransactions.reduce((acc, transaction) => {
      const gameType = transaction.metadata?.gameType || 'unknown';
      if (!acc[gameType]) {
        acc[gameType] = {
          sessions: 0,
          totalWagered: 0,
          totalWon: 0,
          players: new Set()
        };
      }
      
      acc[gameType].sessions++;
      acc[gameType].totalWagered += Math.abs(transaction.amount || 0);
      acc[gameType].players.add(transaction.userId);
      
      return acc;
    }, {} as Record<string, any>);

    // Convert sets to counts and calculate house edge
    Object.keys(gameStats).forEach(gameType => {
      const stats = gameStats[gameType];
      stats.uniquePlayers = stats.players.size;
      delete stats.players;
      
      // Calculate house edge (this would need to be calculated from win/loss data)
      stats.houseEdge = ((stats.totalWagered - stats.totalWon) / stats.totalWagered * 100).toFixed(2);
    });

    return gameStats;
  } catch (error) {
    console.error('Error getting game metrics:', error);
    return null;
  }
}

// Item Metrics
async function getItemMetrics(startDate: Date, endDate: Date) {
  try {
    // Get purchase transactions
    const purchases = await DatabaseService.getMany(
      COLLECTIONS.TRANSACTIONS,
      [
        DatabaseService.where('type', '==', 'SHOP_PURCHASE'),
        DatabaseService.where('createdAt', '>=', startDate),
        DatabaseService.where('createdAt', '<=', endDate)
      ]
    );

    // Get item popularity
    const itemSales = purchases.reduce((acc, purchase) => {
      const itemId = purchase.metadata?.itemId;
      if (itemId) {
        if (!acc[itemId]) {
          acc[itemId] = { sales: 0, revenue: 0 };
        }
        acc[itemId].sales++;
        acc[itemId].revenue += Math.abs(purchase.amount || 0);
      }
      return acc;
    }, {} as Record<string, { sales: number; revenue: number }>);

    // Get category performance
    const items = await DatabaseService.getMany(COLLECTIONS.ITEMS, []);
    const categoryPerformance = items.reduce((acc, item) => {
      const category = item.category || 'unknown';
      const itemSaleData = itemSales[item.id] || { sales: 0, revenue: 0 };
      
      if (!acc[category]) {
        acc[category] = { items: 0, totalSales: 0, totalRevenue: 0 };
      }
      
      acc[category].items++;
      acc[category].totalSales += itemSaleData.sales;
      acc[category].totalRevenue += itemSaleData.revenue;
      
      return acc;
    }, {} as Record<string, any>);

    return {
      itemSales,
      categoryPerformance,
      totalPurchases: purchases.length,
      totalRevenue: purchases.reduce((sum, p) => sum + Math.abs(p.amount || 0), 0)
    };
  } catch (error) {
    console.error('Error getting item metrics:', error);
    return null;
  }
}

// Performance Metrics (mock data - in production would come from monitoring service)
async function getPerformanceMetrics() {
  return {
    server: {
      cpuUsage: Math.floor(Math.random() * 40) + 20, // 20-60%
      memoryUsage: Math.floor(Math.random() * 30) + 50, // 50-80%
      diskUsage: Math.floor(Math.random() * 20) + 30, // 30-50%
      uptime: '7d 14h 32m'
    },
    api: {
      averageResponseTime: Math.floor(Math.random() * 100) + 150, // 150-250ms
      requestsPerSecond: Math.floor(Math.random() * 50) + 100, // 100-150
      errorRate: (Math.random() * 0.5).toFixed(3), // 0-0.5%
      uptime: 99.98
    },
    database: {
      connectionPool: Math.floor(Math.random() * 20) + 10, // 10-30 connections
      queryTime: Math.floor(Math.random() * 50) + 25, // 25-75ms
      cacheHitRate: (Math.random() * 10 + 85).toFixed(1), // 85-95%
      diskUsage: Math.floor(Math.random() * 15) + 15 // 15-30%
    }
  };
}

// Helper functions
async function getNewUsersCount(startDate: Date, endDate: Date): Promise<number> {
  const newUsers = await DatabaseService.getMany(
    COLLECTIONS.USERS,
    [
      DatabaseService.where('createdAt', '>=', startDate),
      DatabaseService.where('createdAt', '<=', endDate)
    ]
  );
  return newUsers.length;
}

async function getUserActivityOverTime(startDate: Date, endDate: Date) {
  // This would ideally use a time-series database or aggregation pipeline
  // For now, we'll create daily buckets
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const activity = [];

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    // Get users active on this day
    const activeUsers = await DatabaseService.getMany(
      COLLECTIONS.USERS,
      [
        DatabaseService.where('lastLoginAt', '>=', date),
        DatabaseService.where('lastLoginAt', '<', nextDate)
      ]
    );

    // Get new users on this day
    const newUsers = await DatabaseService.getMany(
      COLLECTIONS.USERS,
      [
        DatabaseService.where('createdAt', '>=', date),
        DatabaseService.where('createdAt', '<', nextDate)
      ]
    );

    // Get transactions on this day
    const transactions = await DatabaseService.getMany(
      COLLECTIONS.TRANSACTIONS,
      [
        DatabaseService.where('createdAt', '>=', date),
        DatabaseService.where('createdAt', '<', nextDate)
      ]
    );

    activity.push({
      date: date.toISOString().split('T')[0],
      activeUsers: activeUsers.length,
      newUsers: newUsers.length,
      transactions: transactions.length,
      pointsAwarded: transactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0)
    });
  }

  return activity;
}

async function getUserRetentionData(startDate: Date, endDate: Date) {
  // Calculate basic retention metrics
  const totalUsers = await DatabaseService.count(COLLECTIONS.USERS);
  const activeUsers = await DatabaseService.getMany(
    COLLECTIONS.USERS,
    [
      DatabaseService.where('lastLoginAt', '>=', startDate),
      DatabaseService.where('lastLoginAt', '<=', endDate)
    ]
  );

  return {
    totalUsers,
    activeInPeriod: activeUsers.length,
    retentionRate: totalUsers > 0 ? ((activeUsers.length / totalUsers) * 100).toFixed(2) : 0,
    averageSessionDuration: '12m 34s', // Mock data
    bounceRate: '23.1%' // Mock data
  };
}

async function getDailyTransactionVolume(startDate: Date, endDate: Date) {
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const volume = [];

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const transactions = await DatabaseService.getMany(
      COLLECTIONS.TRANSACTIONS,
      [
        DatabaseService.where('createdAt', '>=', date),
        DatabaseService.where('createdAt', '<', nextDate)
      ]
    );

    volume.push({
      date: date.toISOString().split('T')[0],
      count: transactions.length,
      volume: transactions.reduce((sum, t) => sum + Math.abs(t.amount || 0), 0)
    });
  }

  return volume;
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}