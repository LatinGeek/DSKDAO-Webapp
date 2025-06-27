'use client';

import React, { useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Button,
  Alert,
  Breadcrumbs,
  Link,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { Grid } from '@mui/material';
import {
  Casino as PlinkoIcon,
  ArrowBack as BackIcon,
  TrendingUp as StatsIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useGames } from '@/hooks/useGames';
import PlinkoGame from '@/components/games/PlinkoGame';
import { formatCurrency, formatDate } from '@/utils/format';

export default function PlinkoPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { plinkoStats, plinkoHistory, loading } = useGames();
  const [showHistory, setShowHistory] = useState(false);

  if (!isAuthenticated) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">
          Please sign in to play Plinko.
        </Alert>
      </Container>
    );
  }

  const recentGames = plinkoHistory?.slice(0, 5) || [];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link 
          component="button" 
          variant="body1" 
          onClick={() => router.push('/games')}
          sx={{ textDecoration: 'none' }}
        >
          Games
        </Link>
        <Typography color="text.primary">Plinko</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => router.push('/games')}
          sx={{ mr: 2 }}
        >
          Back to Games
        </Button>
        <PlinkoIcon sx={{ fontSize: 32, color: '#FFD700', mr: 2 }} />
        <Typography variant="h3" component="h1">
          Plinko
        </Typography>
        <Chip 
          label="Live" 
          color="success" 
          sx={{ ml: 2 }}
        />
      </Box>

      <Grid container spacing={3}>
        {/* Game Area */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #FFD70020 0%, #FFD70010 100%)',
            border: '2px solid #FFD70040'
          }}>
            <CardContent>
                             <PlinkoGame gameId="plinko-main" userId={user?.id || ''} />
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar - Stats & History */}
        <Grid item xs={12} lg={4}>
          <Grid container spacing={3}>
            {/* User Balance */}
            <Grid item xs={12}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                color: 'white'
              }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Your Balance
                  </Typography>
                                     <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                     {user?.balance || 0}
                   </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Available Tickets
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Game Stats */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <StatsIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">
                      Your Plinko Stats
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                          {plinkoStats?.totalGames || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Games Played
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" color="success.main" sx={{ fontWeight: 'bold' }}>
                          {plinkoStats?.totalWins || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Wins
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" color="warning.main" sx={{ fontWeight: 'bold' }}>
                          {plinkoStats?.biggestWin || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Biggest Win
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" color="info.main" sx={{ fontWeight: 'bold' }}>
                          {plinkoStats?.winRate ? `${(plinkoStats.winRate * 100).toFixed(1)}%` : '0%'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Win Rate
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Recent Games */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <HistoryIcon sx={{ mr: 1 }} />
                      <Typography variant="h6">
                        Recent Games
                      </Typography>
                    </Box>
                    <Button 
                      size="small" 
                      onClick={() => setShowHistory(!showHistory)}
                    >
                      {showHistory ? 'Show Less' : 'View All'}
                    </Button>
                  </Box>

                  {recentGames.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                      No games played yet. Start playing to see your history!
                    </Typography>
                  ) : (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Bet</TableCell>
                            <TableCell>Multiplier</TableCell>
                            <TableCell>Win</TableCell>
                            <TableCell>Time</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {(showHistory ? plinkoHistory : recentGames)?.map((game, index) => (
                            <TableRow key={index}>
                              <TableCell>{formatCurrency(game.bet)}</TableCell>
                              <TableCell>
                                <Chip 
                                  label={`${game.multiplier}x`}
                                  size="small"
                                  color={game.multiplier >= 2 ? 'success' : 'default'}
                                />
                              </TableCell>
                              <TableCell>
                                <Typography 
                                  variant="body2" 
                                  color={game.payout > game.bet ? 'success.main' : 'error.main'}
                                  sx={{ fontWeight: 'medium' }}
                                >
                                  {game.payout > game.bet ? '+' : ''}{formatCurrency(game.payout - game.bet)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="text.secondary">
                                  {formatDate(game.timestamp)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Game Rules */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    How to Play
                  </Typography>
                  <Typography variant="body2" paragraph>
                    1. Choose your bet amount and risk level
                  </Typography>
                  <Typography variant="body2" paragraph>
                    2. Click "Drop Ball" to start the game
                  </Typography>
                  <Typography variant="body2" paragraph>
                    3. Watch the ball bounce through pegs
                  </Typography>
                  <Typography variant="body2" paragraph>
                    4. Win based on where the ball lands!
                  </Typography>
                  
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'warning.main', borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ color: 'warning.contrastText', fontWeight: 'medium' }}>
                      💡 Tip: Higher risk levels offer bigger multipliers but lower win chances!
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
}