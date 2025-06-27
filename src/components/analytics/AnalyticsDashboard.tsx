import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { TrendingUp, TrendingDown, Users, ShoppingCart, GamepadIcon, LocalOffer } from '@mui/icons-material';

interface AnalyticsDashboardProps {
  className?: string;
}

interface SystemMetrics {
  totalUsers: number;
  activeUsers: number;
  totalTransactions: number;
  totalPointsAwarded: number;
  totalPointsSpent: number;
  revenue: number;
  totalGamesPlayed: number;
  totalRaffleEntries: number;
}

interface UserActivity {
  date: string;
  newUsers: number;
  activeUsers: number;
  transactions: number;
  pointsAwarded: number;
  gamesPlayed: number;
}

interface PopularItems {
  itemId: string;
  name: string;
  category: string;
  totalSales: number;
  revenue: number;
  trend: 'up' | 'down' | 'stable';
}

interface GameStats {
  gameId: string;
  name: string;
  totalPlayed: number;
  totalWagered: number;
  totalWon: number;
  averageSession: number;
  houseEdge: number;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  className = ''
}) => {
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalUsers: 0,
    activeUsers: 0,
    totalTransactions: 0,
    totalPointsAwarded: 0,
    totalPointsSpent: 0,
    revenue: 0,
    totalGamesPlayed: 0,
    totalRaffleEntries: 0
  });
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
  const [popularItems, setPopularItems] = useState<PopularItems[]>([]);
  const [gameStats, setGameStats] = useState<GameStats[]>([]);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Load system metrics
      await loadSystemMetrics();
      
      // Load user activity data
      await loadUserActivity();
      
      // Load popular items
      await loadPopularItems();
      
      // Load game statistics
      await loadGameStats();
      
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    }
    setLoading(false);
  };

  const loadSystemMetrics = async () => {
    // Mock data - in production, these would be API calls
    const mockMetrics: SystemMetrics = {
      totalUsers: 1247,
      activeUsers: 342,
      totalTransactions: 8956,
      totalPointsAwarded: 125430,
      totalPointsSpent: 98765,
      revenue: 45230,
      totalGamesPlayed: 3421,
      totalRaffleEntries: 1876
    };
    setMetrics(mockMetrics);
  };

  const loadUserActivity = async () => {
    // Mock user activity data
    const mockActivity: UserActivity[] = [
      { date: '2024-01-01', newUsers: 23, activeUsers: 156, transactions: 89, pointsAwarded: 2340, gamesPlayed: 145 },
      { date: '2024-01-02', newUsers: 31, activeUsers: 178, transactions: 112, pointsAwarded: 2890, gamesPlayed: 167 },
      { date: '2024-01-03', newUsers: 18, activeUsers: 134, transactions: 76, pointsAwarded: 1980, gamesPlayed: 123 },
      { date: '2024-01-04', newUsers: 27, activeUsers: 198, transactions: 134, pointsAwarded: 3450, gamesPlayed: 189 },
      { date: '2024-01-05', newUsers: 35, activeUsers: 221, transactions: 156, pointsAwarded: 4120, gamesPlayed: 234 },
      { date: '2024-01-06', newUsers: 29, activeUsers: 189, transactions: 143, pointsAwarded: 3780, gamesPlayed: 198 },
      { date: '2024-01-07', newUsers: 42, activeUsers: 267, transactions: 189, pointsAwarded: 4890, gamesPlayed: 278 }
    ];
    setUserActivity(mockActivity);
  };

  const loadPopularItems = async () => {
    // Mock popular items data
    const mockItems: PopularItems[] = [
      { itemId: '1', name: 'Premium Lootbox', category: 'Lootbox', totalSales: 234, revenue: 23400, trend: 'up' },
      { itemId: '2', name: 'Rare NFT Collection', category: 'NFT', totalSales: 89, revenue: 17800, trend: 'up' },
      { itemId: '3', name: 'Discord VIP Access', category: 'Access', totalSales: 156, revenue: 7800, trend: 'stable' },
      { itemId: '4', name: 'Community Hoodie', category: 'Physical', totalSales: 67, revenue: 6700, trend: 'down' },
      { itemId: '5', name: 'Exclusive Emotes', category: 'Digital', totalSales: 345, revenue: 3450, trend: 'up' }
    ];
    setPopularItems(mockItems);
  };

  const loadGameStats = async () => {
    // Mock game statistics
    const mockGameStats: GameStats[] = [
      { gameId: '1', name: 'Plinko', totalPlayed: 2341, totalWagered: 45670, totalWon: 41230, averageSession: 95.6, houseEdge: 2.5 },
      { gameId: '2', name: 'Coin Flip', totalPlayed: 1876, totalWagered: 23450, totalWon: 21780, averageSession: 67.3, houseEdge: 3.2 },
      { gameId: '3', name: 'Dice Roll', totalPlayed: 987, totalWagered: 15670, totalWon: 14230, averageSession: 78.9, houseEdge: 4.1 }
    ];
    setGameStats(mockGameStats);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="text-green-500" />;
      case 'down': return <TrendingDown className="text-red-500" />;
      default: return <div className="w-5 h-5" />; // placeholder
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return 'text-green-500';
      case 'down': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  // Chart colors
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <Typography variant="h4" className="text-white font-bold">
          📊 Analytics Dashboard
        </Typography>
        <FormControl size="small" className="min-w-[120px]">
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            label="Time Range"
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <MenuItem value="1d">Last Day</MenuItem>
            <MenuItem value="7d">Last 7 Days</MenuItem>
            <MenuItem value="30d">Last 30 Days</MenuItem>
            <MenuItem value="90d">Last 90 Days</MenuItem>
          </Select>
        </FormControl>
      </div>

      {/* Key Metrics Cards */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="card-background">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="body2" className="text-gray-400">
                    Total Users
                  </Typography>
                  <Typography variant="h4" className="text-white font-bold">
                    {formatNumber(metrics.totalUsers)}
                  </Typography>
                  <Typography variant="body2" className="text-green-400">
                    +12.5% from last week
                  </Typography>
                </div>
                <Users className="text-blue-500 text-4xl" />
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="card-background">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="body2" className="text-gray-400">
                    Active Users
                  </Typography>
                  <Typography variant="h4" className="text-white font-bold">
                    {formatNumber(metrics.activeUsers)}
                  </Typography>
                  <Typography variant="body2" className="text-green-400">
                    +8.3% from last week
                  </Typography>
                </div>
                <TrendingUp className="text-green-500 text-4xl" />
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="card-background">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="body2" className="text-gray-400">
                    Total Revenue
                  </Typography>
                  <Typography variant="h4" className="text-white font-bold">
                    ${formatNumber(metrics.revenue)}
                  </Typography>
                  <Typography variant="body2" className="text-green-400">
                    +15.7% from last week
                  </Typography>
                </div>
                <ShoppingCart className="text-yellow-500 text-4xl" />
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="card-background">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="body2" className="text-gray-400">
                    Games Played
                  </Typography>
                  <Typography variant="h4" className="text-white font-bold">
                    {formatNumber(metrics.totalGamesPlayed)}
                  </Typography>
                  <Typography variant="body2" className="text-green-400">
                    +22.1% from last week
                  </Typography>
                </div>
                <GamepadIcon className="text-purple-500 text-4xl" />
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* User Activity Chart */}
      <Card className="card-background">
        <CardContent>
          <Typography variant="h6" className="text-white mb-4">
            User Activity Trends
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={userActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="activeUsers" 
                stackId="1"
                stroke="#3B82F6" 
                fill="#3B82F6"
                fillOpacity={0.6}
                name="Active Users"
              />
              <Area 
                type="monotone" 
                dataKey="newUsers" 
                stackId="1"
                stroke="#10B981" 
                fill="#10B981"
                fillOpacity={0.6}
                name="New Users"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <Grid container spacing={3}>
        {/* Points Flow Chart */}
        <Grid item xs={12} md={6}>
          <Card className="card-background">
            <CardContent>
              <Typography variant="h6" className="text-white mb-4">
                Points Flow
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={userActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="pointsAwarded" fill="#3B82F6" name="Points Awarded" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Transaction Distribution */}
        <Grid item xs={12} md={6}>
          <Card className="card-background">
            <CardContent>
              <Typography variant="h6" className="text-white mb-4">
                Transaction Types
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Shop Purchases', value: 45, fill: '#3B82F6' },
                      { name: 'Game Bets', value: 30, fill: '#10B981' },
                      { name: 'Raffle Entries', value: 15, fill: '#F59E0B' },
                      { name: 'Admin Awards', value: 10, fill: '#EF4444' }
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Popular Items Table */}
      <Card className="card-background">
        <CardContent>
          <Typography variant="h6" className="text-white mb-4">
            Popular Items
          </Typography>
          <TableContainer component={Paper} className="bg-secondary">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Item</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Sales</TableCell>
                  <TableCell align="right">Revenue</TableCell>
                  <TableCell align="center">Trend</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {popularItems.map((item) => (
                  <TableRow key={item.itemId}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>
                      <Chip label={item.category} size="small" />
                    </TableCell>
                    <TableCell align="right">{item.totalSales}</TableCell>
                    <TableCell align="right">${formatNumber(item.revenue)}</TableCell>
                    <TableCell align="center">
                      <div className="flex items-center justify-center">
                        {getTrendIcon(item.trend)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Game Performance */}
      <Card className="card-background">
        <CardContent>
          <Typography variant="h6" className="text-white mb-4">
            Game Performance
          </Typography>
          <TableContainer component={Paper} className="bg-secondary">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Game</TableCell>
                  <TableCell align="right">Sessions</TableCell>
                  <TableCell align="right">Total Wagered</TableCell>
                  <TableCell align="right">Total Won</TableCell>
                  <TableCell align="right">House Edge</TableCell>
                  <TableCell align="right">Avg Session</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {gameStats.map((game) => (
                  <TableRow key={game.gameId}>
                    <TableCell>{game.name}</TableCell>
                    <TableCell align="right">{formatNumber(game.totalPlayed)}</TableCell>
                    <TableCell align="right">{formatNumber(game.totalWagered)}</TableCell>
                    <TableCell align="right">{formatNumber(game.totalWon)}</TableCell>
                    <TableCell align="right">{game.houseEdge}%</TableCell>
                    <TableCell align="right">{game.averageSession.toFixed(1)}s</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* System Performance Indicators */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card className="card-background">
            <CardContent>
              <Typography variant="h6" className="text-white mb-2">
                Server Performance
              </Typography>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>CPU Usage</span>
                    <span>34%</span>
                  </div>
                  <LinearProgress variant="determinate" value={34} color="primary" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Memory</span>
                    <span>67%</span>
                  </div>
                  <LinearProgress variant="determinate" value={67} color="warning" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Database Load</span>
                    <span>23%</span>
                  </div>
                  <LinearProgress variant="determinate" value={23} color="success" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card className="card-background">
            <CardContent>
              <Typography variant="h6" className="text-white mb-2">
                API Performance
              </Typography>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Response Time</span>
                  <span className="text-green-400">245ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Requests/sec</span>
                  <span className="text-blue-400">156</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Error Rate</span>
                  <span className="text-red-400">0.12%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Uptime</span>
                  <span className="text-green-400">99.98%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card className="card-background">
            <CardContent>
              <Typography variant="h6" className="text-white mb-2">
                User Engagement
              </Typography>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Daily Active Users</span>
                  <span className="text-blue-400">{formatNumber(metrics.activeUsers)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Session Duration</span>
                  <span className="text-green-400">12m 34s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Retention Rate</span>
                  <span className="text-purple-400">78.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Bounce Rate</span>
                  <span className="text-yellow-400">23.1%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default AnalyticsDashboard;