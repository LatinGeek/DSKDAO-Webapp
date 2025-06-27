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
  Avatar,
  Grid,
  Button,
  Divider
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Casino as GameIcon,
  Store as ShopIcon,
  LocalFireDepartment as FireIcon,
  EmojiEvents as CrownIcon
} from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency, formatTimeAgo } from '@/utils/format';
import { DatabaseService, COLLECTIONS } from '@/lib/db';

interface LeaderboardEntry {
  id: string;
  displayName: string;
  discordUserId: string;
  avatar?: string;
  value: number;
  rank: number;
  isCurrentUser?: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`leaderboard-tabpanel-${index}`}
      aria-labelledby={`leaderboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function LeaderboardsPage() {
  const { user, isAuthenticated } = useAuth();
  const [currentTab, setCurrentTab] = useState(0);
  const [leaderboards, setLeaderboards] = useState<{
    tickets: LeaderboardEntry[];
    gamesWon: LeaderboardEntry[];
    totalSpent: LeaderboardEntry[];
    arenaWins: LeaderboardEntry[];
  }>({
    tickets: [],
    gamesWon: [],
    totalSpent: [],
    arenaWins: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboards();
  }, []);

  const loadLeaderboards = async () => {
    try {
      // Load tickets leaderboard
      const ticketsData = await DatabaseService.getMany(COLLECTIONS.USERS, [
        DatabaseService.orderBy('redeemablePoints', 'desc'),
        DatabaseService.limit(50)
      ]);

      // For now, we'll simulate other leaderboards based on the tickets data
      // In a real implementation, these would come from aggregated transaction data
      const tickets = ticketsData.map((user: any, index: number) => ({
        id: user.id,
        displayName: user.displayName || `User ${index + 1}`,
        discordUserId: user.discordUserId || '',
        avatar: user.avatar,
        value: user.redeemablePoints || 0,
        rank: index + 1,
        isCurrentUser: user.id === user?.id
      }));

      // Simulate other leaderboards with variations
      const gamesWon = tickets.map((entry, index) => ({
        ...entry,
        value: Math.max(0, Math.floor(entry.value / 10) + Math.floor(Math.random() * 20)),
        rank: index + 1
      })).sort((a, b) => b.value - a.value).map((entry, index) => ({ ...entry, rank: index + 1 }));

      const totalSpent = tickets.map((entry, index) => ({
        ...entry,
        value: Math.max(0, Math.floor(entry.value * 0.8) + Math.floor(Math.random() * 500)),
        rank: index + 1
      })).sort((a, b) => b.value - a.value).map((entry, index) => ({ ...entry, rank: index + 1 }));

      const arenaWins = tickets.map((entry, index) => ({
        ...entry,
        value: Math.max(0, Math.floor(Math.random() * 15)),
        rank: index + 1
      })).sort((a, b) => b.value - a.value).map((entry, index) => ({ ...entry, rank: index + 1 }));

      setLeaderboards({
        tickets,
        gamesWon,
        totalSpent,
        arenaWins
      });
    } catch (error) {
      console.error('Error loading leaderboards:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <CrownIcon sx={{ color: '#FFD700', fontSize: 28 }} />;
      case 2:
        return <TrophyIcon sx={{ color: '#C0C0C0', fontSize: 24 }} />;
      case 3:
        return <TrophyIcon sx={{ color: '#CD7F32', fontSize: 20 }} />;
      default:
        return (
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 'bold'
            }}
          >
            {rank}
          </Box>
        );
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'linear-gradient(135deg, #FFD700 0%, #FFA000 100%)';
      case 2:
        return 'linear-gradient(135deg, #C0C0C0 0%, #999999 100%)';
      case 3:
        return 'linear-gradient(135deg, #CD7F32 0%, #A0522D 100%)';
      default:
        return undefined;
    }
  };

  const renderLeaderboardTable = (data: LeaderboardEntry[], valueLabel: string, valueFormatter = formatCurrency) => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Rank</TableCell>
            <TableCell>Player</TableCell>
            <TableCell align="right">{valueLabel}</TableCell>
            <TableCell align="center">Badge</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.slice(0, 20).map((entry) => (
            <TableRow 
              key={entry.id}
              sx={{
                background: getRankColor(entry.rank),
                '&:hover': {
                  backgroundColor: entry.isCurrentUser ? 'primary.dark' : 'action.hover'
                },
                ...(entry.isCurrentUser && {
                  bgcolor: 'primary.light',
                  '& td': { fontWeight: 'bold' }
                })
              }}
            >
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getRankIcon(entry.rank)}
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    #{entry.rank}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ width: 32, height: 32 }}>
                    {entry.displayName.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {entry.displayName}
                      {entry.isCurrentUser && (
                        <Chip 
                          label="You" 
                          size="small" 
                          color="primary" 
                          sx={{ ml: 1, fontSize: '0.7rem' }}
                        />
                      )}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell align="right">
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 'bold',
                    color: entry.rank <= 3 ? 'white' : 'text.primary'
                  }}
                >
                  {valueFormatter(entry.value)}
                </Typography>
              </TableCell>
              <TableCell align="center">
                {entry.rank <= 10 && (
                  <Chip
                    label={`Top ${entry.rank <= 3 ? entry.rank : '10'}`}
                    size="small"
                    color={entry.rank === 1 ? 'warning' : entry.rank <= 3 ? 'secondary' : 'default'}
                  />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const tabs = [
    { label: 'Tickets', icon: <StarIcon />, color: '#FFD700' },
    { label: 'Games Won', icon: <GameIcon />, color: '#4CAF50' },
    { label: 'Total Spent', icon: <ShopIcon />, color: '#FF6B6B' },
    { label: 'Arena Wins', icon: <FireIcon />, color: '#9C27B0' }
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
          <TrophyIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          Leaderboards
        </Typography>
        <Typography variant="h6" color="text.secondary">
          See where you rank among the DSKDAO community! Compete for the top spots and earn bragging rights.
        </Typography>
      </Box>

      {/* Top 3 Showcase */}
      {!loading && leaderboards.tickets.length >= 3 && (
        <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <CardContent>
            <Typography variant="h5" sx={{ color: 'white', mb: 3, textAlign: 'center' }}>
              🏆 Top 3 Ticket Holders 🏆
            </Typography>
            <Grid container spacing={3} justifyContent="center">
              {/* 2nd Place */}
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar 
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      mx: 'auto', 
                      mb: 2,
                      bgcolor: '#C0C0C0',
                      fontSize: '2rem',
                      fontWeight: 'bold'
                    }}
                  >
                    2
                  </Avatar>
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                    {leaderboards.tickets[1]?.displayName}
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#C0C0C0', fontWeight: 'bold' }}>
                    {formatCurrency(leaderboards.tickets[1]?.value || 0)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    tickets
                  </Typography>
                </Box>
              </Grid>

              {/* 1st Place */}
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <CrownIcon sx={{ fontSize: 40, color: '#FFD700', mb: 1 }} />
                  <Avatar 
                    sx={{ 
                      width: 100, 
                      height: 100, 
                      mx: 'auto', 
                      mb: 2,
                      bgcolor: '#FFD700',
                      color: 'black',
                      fontSize: '2.5rem',
                      fontWeight: 'bold'
                    }}
                  >
                    1
                  </Avatar>
                  <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
                    {leaderboards.tickets[0]?.displayName}
                  </Typography>
                  <Typography variant="h3" sx={{ color: '#FFD700', fontWeight: 'bold' }}>
                    {formatCurrency(leaderboards.tickets[0]?.value || 0)}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    tickets
                  </Typography>
                </Box>
              </Grid>

              {/* 3rd Place */}
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar 
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      mx: 'auto', 
                      mb: 2,
                      bgcolor: '#CD7F32',
                      fontSize: '2rem',
                      fontWeight: 'bold'
                    }}
                  >
                    3
                  </Avatar>
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                    {leaderboards.tickets[2]?.displayName}
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#CD7F32', fontWeight: 'bold' }}>
                    {formatCurrency(leaderboards.tickets[2]?.value || 0)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    tickets
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)} variant="fullWidth">
            {tabs.map((tab, index) => (
              <Tab 
                key={index}
                label={tab.label} 
                icon={tab.icon}
                sx={{
                  '&.Mui-selected': {
                    color: tab.color
                  }
                }}
              />
            ))}
          </Tabs>
        </Box>

        <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={48} />
            </Box>
          ) : (
            <>
              <TabPanel value={currentTab} index={0}>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <StarIcon sx={{ color: '#FFD700' }} />
                  Top Ticket Holders
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Players ranked by their total ticket balance. Earn tickets through Discord activities and games!
                </Typography>
                {renderLeaderboardTable(leaderboards.tickets, 'Tickets')}
              </TabPanel>

              <TabPanel value={currentTab} index={1}>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <GameIcon sx={{ color: '#4CAF50' }} />
                  Top Game Winners
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Players ranked by their total game wins across all platform games.
                </Typography>
                {renderLeaderboardTable(leaderboards.gamesWon, 'Games Won', (value) => value.toString())}
              </TabPanel>

              <TabPanel value={currentTab} index={2}>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ShopIcon sx={{ color: '#FF6B6B' }} />
                  Top Spenders
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Players ranked by their total spending on games, raffles, and shop items.
                </Typography>
                {renderLeaderboardTable(leaderboards.totalSpent, 'Total Spent')}
              </TabPanel>

              <TabPanel value={currentTab} index={3}>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FireIcon sx={{ color: '#9C27B0' }} />
                  Arena Champions
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Players ranked by their Arena game victories. Only the strongest survive!
                </Typography>
                {renderLeaderboardTable(leaderboards.arenaWins, 'Arena Wins', (value) => value.toString())}
              </TabPanel>
            </>
          )}
        </CardContent>
      </Card>

      {/* Your Position */}
      {isAuthenticated && user && !loading && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Your Current Position
            </Typography>
            <Grid container spacing={2}>
              {tabs.map((tab, index) => {
                const data = Object.values(leaderboards)[index];
                const userEntry = data.find(entry => entry.isCurrentUser);
                return (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Box sx={{ 
                      p: 2, 
                      border: 1, 
                      borderColor: 'divider', 
                      borderRadius: 1,
                      textAlign: 'center'
                    }}>
                      {tab.icon}
                      <Typography variant="body2" color="text.secondary">
                        {tab.label}
                      </Typography>
                      <Typography variant="h6" color="primary">
                        #{userEntry?.rank || 'N/A'}
                      </Typography>
                      <Typography variant="body2">
                        {userEntry ? (index === 1 || index === 3 ? userEntry.value.toString() : formatCurrency(userEntry.value)) : '0'}
                      </Typography>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </CardContent>
        </Card>
      )}

      {!isAuthenticated && (
        <Alert severity="info" sx={{ mt: 3 }}>
          Sign in to see your position on the leaderboards and compete with other players!
        </Alert>
      )}
    </Container>
  );
}