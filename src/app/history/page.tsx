'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Tabs,
  Tab,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Avatar
} from '@mui/material';
import {
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Casino as GameIcon,
  Store as ShopIcon,
  ConfirmationNumber as RaffleIcon,
  EmojiEvents as RewardIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import { TransactionType } from '@/types/enums';
import { formatCurrency, formatDate } from '@/utils/format';
import { DatabaseService, COLLECTIONS } from '@/lib/db';

interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  description: string;
  metadata?: any;
  timestamp: Date;
  balanceAfter: number;
}

export default function HistoryPage() {
  const { user, isAuthenticated } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState(0);
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  useEffect(() => {
    if (isAuthenticated && user) {
      loadTransactions();
    }
  }, [isAuthenticated, user]);

  const loadTransactions = async () => {
    if (!user) return;

    try {
      const transactionData = await DatabaseService.getMany(COLLECTIONS.TRANSACTIONS, [
        DatabaseService.where('userId', '==', user.id),
        DatabaseService.orderBy('timestamp', 'desc'),
        DatabaseService.limit(100)
      ]);
      setTransactions(transactionData as Transaction[]);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">
          Please sign in to view your transaction history.
        </Alert>
      </Container>
    );
  }

  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case TransactionType.PURCHASE:
        return <ShopIcon color="primary" />;
      case TransactionType.PLINKO_GAME:
        return <GameIcon color="secondary" />;
      case TransactionType.RAFFLE_ENTRY:
        return <RaffleIcon color="warning" />;
      case TransactionType.DISCORD_REWARD:
        return <RewardIcon color="success" />;
      case TransactionType.GAME_REWARD:
        return <RewardIcon color="success" />;
      default:
        return <HistoryIcon color="action" />;
    }
  };

  const getTransactionColor = (type: TransactionType, amount: number) => {
    if (amount > 0) return 'success.main';
    if (amount < 0) return 'error.main';
    return 'text.primary';
  };

  const getFilteredTransactions = () => {
    let filtered = transactions;

    if (filter !== 'all') {
      filtered = filtered.filter(t => t.type === filter);
    }

    if (dateRange !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      
      switch (dateRange) {
        case 'today':
          cutoff.setHours(0, 0, 0, 0);
          break;
        case 'week':
          cutoff.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoff.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(t => new Date(t.timestamp) >= cutoff);
    }

    return filtered;
  };

  const getStatistics = () => {
    const stats = {
      totalTransactions: transactions.length,
      totalSpent: 0,
      totalEarned: 0,
      gameWins: 0,
      discordRewards: 0
    };

    transactions.forEach(t => {
      if (t.amount > 0) {
        stats.totalEarned += t.amount;
        if (t.type === TransactionType.DISCORD_REWARD || t.type === TransactionType.GAME_REWARD) {
          stats.discordRewards += t.amount;
        }
        if (t.type === TransactionType.PLINKO_GAME && t.amount > 0) {
          stats.gameWins++;
        }
      } else {
        stats.totalSpent += Math.abs(t.amount);
      }
    });

    return stats;
  };

  const stats = getStatistics();
  const filteredTransactions = getFilteredTransactions();

  const tabs = [
    { label: 'All Transactions', value: 'all' },
    { label: 'Games', value: 'games' },
    { label: 'Shop', value: 'shop' },
    { label: 'Rewards', value: 'rewards' }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2 
        }}>
          <HistoryIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          Transaction History
        </Typography>
        <Typography variant="h6" color="text.secondary">
          View your complete transaction history including games, purchases, and Discord rewards.
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                    {stats.totalTransactions}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Transactions
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <HistoryIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(stats.totalEarned)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Earned
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <TrendingUpIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" color="error.main" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(stats.totalSpent)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Spent
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'error.main' }}>
                  <TrendingDownIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" color="warning.main" sx={{ fontWeight: 'bold' }}>
                    {stats.discordRewards}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Discord Rewards
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <RewardIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterIcon />
            Filters
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Transaction Type</InputLabel>
                <Select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  label="Transaction Type"
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value={TransactionType.PURCHASE}>Shop Purchases</MenuItem>
                  <MenuItem value={TransactionType.PLINKO_GAME}>Plinko Games</MenuItem>
                  <MenuItem value={TransactionType.RAFFLE_ENTRY}>Raffle Entries</MenuItem>
                  <MenuItem value={TransactionType.DISCORD_REWARD}>Discord Rewards</MenuItem>
                  <MenuItem value={TransactionType.GAME_REWARD}>Game Rewards</MenuItem>
                  <MenuItem value={TransactionType.ADMIN_ADJUSTMENT}>Admin Adjustments</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Date Range</InputLabel>
                <Select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  label="Date Range"
                >
                  <MenuItem value="all">All Time</MenuItem>
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="week">Last 7 Days</MenuItem>
                  <MenuItem value="month">Last 30 Days</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Button
                variant="outlined"
                fullWidth
                sx={{ height: 56 }}
                onClick={() => {
                  setFilter('all');
                  setDateRange('all');
                }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Transactions ({filteredTransactions.length})
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : filteredTransactions.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <HistoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No transactions found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {filter !== 'all' || dateRange !== 'all' 
                  ? 'Try adjusting your filters to see more results.'
                  : 'Start playing games or making purchases to see your transaction history here.'
                }
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="right">Balance After</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getTransactionIcon(transaction.type)}
                          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                            {transaction.type.replace('_', ' ')}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {transaction.description}
                        </Typography>
                        {transaction.metadata && (
                          <Typography variant="caption" color="text.secondary">
                            {JSON.stringify(transaction.metadata).length > 50 
                              ? `${JSON.stringify(transaction.metadata).substring(0, 50)}...`
                              : JSON.stringify(transaction.metadata)
                            }
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 'medium',
                            color: getTransactionColor(transaction.type, transaction.amount)
                          }}
                        >
                          {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="text.secondary">
                          {formatCurrency(transaction.balanceAfter)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(transaction.timestamp)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label="Completed" 
                          size="small" 
                          color="success"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}