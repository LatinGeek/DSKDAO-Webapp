'use client';

import React, { useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Chip,
  Avatar,
  LinearProgress,
  Alert,
  Divider
} from '@mui/material';
import {
  SportsEsports as GamesIcon,
  Casino as PlinkoIcon,
  Stadium as ArenaIcon,
  EmojiEvents as TrophyIcon,
  LocalFireDepartment as FireIcon,
  AccessTime as TimeIcon,
  People as PeopleIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useGames } from '@/hooks/useGames';
import { formatCurrency } from '@/utils/format';

export default function GamesPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { gameStats, loading } = useGames();

  if (!isAuthenticated) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">
          Please sign in to access games.
        </Alert>
      </Container>
    );
  }

  const gameCards = [
    {
      id: 'plinko',
      title: 'Plinko',
      description: 'Drop balls and watch them bounce through pegs to win big multipliers!',
      icon: <PlinkoIcon sx={{ fontSize: 40, color: '#FFD700' }} />,
      minBet: 1,
      maxBet: 1000,
      maxMultiplier: '1000x',
      difficulty: 'Easy',
      route: '/games/plinko',
      status: 'active',
      players: gameStats?.plinko?.activePlayers || 0,
      totalPlayed: gameStats?.plinko?.totalGames || 0,
      features: ['Physics Simulation', 'Risk Levels', 'Auto-Play'],
      color: '#FFD700'
    },
    {
      id: 'arena',
      title: 'Ticket Arena',
      description: 'Web3-themed survival battles. Last player standing wins big!',
      icon: <ArenaIcon sx={{ fontSize: 40, color: '#FF6B6B' }} />,
      minBet: 0,
      maxBet: 0,
      maxMultiplier: '50 Tickets',
      difficulty: 'Medium',
      route: '/games/arena',
      status: 'active',
      players: gameStats?.arena?.activePlayers || 0,
      totalPlayed: gameStats?.arena?.totalGames || 0,
      features: ['Auto-Join System', '30min Rounds', 'Community Battle'],
      color: '#FF6B6B'
    }
  ];

  const upcomingGames = [
    {
      id: 'blackjack',
      title: 'Blackjack',
      description: 'Classic card game with crypto twist',
      icon: <GamesIcon sx={{ fontSize: 40, color: '#9C27B0' }} />,
      status: 'coming_soon',
      eta: 'Q2 2024'
    },
    {
      id: 'lottery',
      title: 'Daily Lottery',
      description: 'Daily lottery with guaranteed winners',
      icon: <TrophyIcon sx={{ fontSize: 40, color: '#4CAF50' }} />,
      status: 'coming_soon',
      eta: 'Q2 2024'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          mb: 2 
        }}>
          <GamesIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          Games Hub
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Test your luck and skill in our collection of Web3 games. Earn tickets and climb the leaderboards!
        </Typography>
        
        {/* User Stats */}
        <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                    {user?.redeemablePoints || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Available Tickets
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                    {gameStats?.totalWins || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Total Wins
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                    {gameStats?.biggestWin || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Biggest Win
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                    #{gameStats?.leaderboardRank || 'N/A'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Leaderboard Rank
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

      {/* Active Games */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          <FireIcon sx={{ mr: 1, color: '#FF6B6B' }} />
          Active Games
        </Typography>
        <Grid container spacing={3}>
          {gameCards.map((game) => (
            <Grid item xs={12} md={6} key={game.id}>
              <Card sx={{ 
                height: '100%',
                background: `linear-gradient(135deg, ${game.color}20 0%, ${game.color}10 100%)`,
                border: `2px solid ${game.color}40`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 32px ${game.color}40`
                }
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {game.icon}
                    <Box sx={{ ml: 2, flex: 1 }}>
                      <Typography variant="h5" component="h3" gutterBottom>
                        {game.title}
                      </Typography>
                      <Chip 
                        label={game.status === 'active' ? 'Live' : 'Coming Soon'} 
                        size="small"
                        color={game.status === 'active' ? 'success' : 'default'}
                        sx={{ mb: 1 }}
                      />
                    </Box>
                  </Box>

                  <Typography variant="body1" color="text.secondary" paragraph>
                    {game.description}
                  </Typography>

                  {/* Game Stats */}
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PeopleIcon fontSize="small" />
                        <Typography variant="body2">
                          {game.players} playing
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <StarIcon fontSize="small" />
                        <Typography variant="body2">
                          Max: {game.maxMultiplier}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Features */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium' }}>
                      Features:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {game.features.map((feature, index) => (
                        <Chip 
                          key={index}
                          label={feature} 
                          size="small" 
                          variant="outlined"
                          sx={{ fontSize: '0.75rem' }}
                        />
                      ))}
                    </Box>
                  </Box>

                  {/* Bet Range */}
                  {game.minBet > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Bet Range: {game.minBet} - {formatCurrency(game.maxBet)} tickets
                      </Typography>
                    </Box>
                  )}

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="body2" color="text.secondary">
                    Total Games Played: {formatCurrency(game.totalPlayed)}
                  </Typography>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={() => router.push(game.route)}
                    disabled={game.status !== 'active'}
                    sx={{
                      background: game.status === 'active' 
                        ? `linear-gradient(135deg, ${game.color} 0%, ${game.color}CC 100%)`
                        : undefined,
                      '&:hover': {
                        background: game.status === 'active'
                          ? `linear-gradient(135deg, ${game.color}DD 0%, ${game.color}AA 100%)`
                          : undefined
                      }
                    }}
                  >
                    {game.status === 'active' ? 'Play Now' : 'Coming Soon'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Coming Soon Games */}
      <Box>
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          <TimeIcon sx={{ mr: 1, color: '#9C27B0' }} />
          Coming Soon
        </Typography>
        <Grid container spacing={3}>
          {upcomingGames.map((game) => (
            <Grid item xs={12} sm={6} md={4} key={game.id}>
              <Card sx={{ 
                height: '100%',
                opacity: 0.7,
                background: 'linear-gradient(135deg, #9C27B020 0%, #9C27B010 100%)',
                border: '2px solid #9C27B040'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {game.icon}
                    <Box sx={{ ml: 2 }}>
                      <Typography variant="h6" component="h3">
                        {game.title}
                      </Typography>
                      <Chip 
                        label={`ETA: ${game.eta}`} 
                        size="small"
                        color="secondary"
                      />
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {game.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button variant="outlined" fullWidth disabled>
                    Coming Soon
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Quick Links */}
      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Quick Links
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Button 
            variant="outlined" 
            onClick={() => router.push('/leaderboards')}
            startIcon={<TrophyIcon />}
          >
            Leaderboards
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => router.push('/history')}
            startIcon={<TimeIcon />}
          >
            Game History
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => router.push('/raffles')}
            startIcon={<GamesIcon />}
          >
            Raffles
          </Button>
        </Box>
      </Box>
    </Container>
  );
}