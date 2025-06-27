'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
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
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  LinearProgress,
  Avatar,
  Divider
} from '@mui/material';
import { Grid } from '@mui/material';
import {
  Stadium as ArenaIcon,
  ArrowBack as BackIcon,
  People as PeopleIcon,
  Timer as TimerIcon,
  EmojiEvents as TrophyIcon,
  AutoMode as AutoIcon,
  History as HistoryIcon,
  LocalFireDepartment as FireIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency, formatTimeAgo } from '@/utils/format';
import { DatabaseService } from '@/lib/db';

interface ArenaGame {
  id: string;
  roundNumber: number;
  startTime: Date;
  endTime: Date;
  participants: string[];
  autoJoinParticipants: string[];
  winner?: string;
  active: boolean;
  ticketReward: number;
}

export default function ArenaPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [arenaGames, setArenaGames] = useState<ArenaGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoJoinDialog, setAutoJoinDialog] = useState(false);
  const [autoJoinRounds, setAutoJoinRounds] = useState(5);
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (isAuthenticated) {
      loadArenaData();
      const interval = setInterval(loadArenaData, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Update countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      const activeGame = arenaGames.find(game => game.active);
      if (activeGame) {
        const now = new Date();
        const endTime = new Date(activeGame.endTime);
        const timeDiff = endTime.getTime() - now.getTime();
        
        if (timeDiff > 0) {
          const minutes = Math.floor(timeDiff / (1000 * 60));
          const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
          setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        } else {
          setTimeLeft('Ending soon...');
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [arenaGames]);

  const loadArenaData = async () => {
    try {
      const games = await DatabaseService.getMany('arena_games', [
        DatabaseService.orderBy('startTime', 'desc'),
        DatabaseService.limit(20)
      ]);
      setArenaGames(games as ArenaGame[]);
    } catch (error) {
      console.error('Error loading arena data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinArena = async (gameId: string) => {
    if (!user) return;

    try {
      // Find the game
      const gameIndex = arenaGames.findIndex(g => g.id === gameId);
      if (gameIndex === -1) return;

      const game = arenaGames[gameIndex];
      
      // Check if already joined
      if (game.participants.includes(user.id) || game.autoJoinParticipants.includes(user.id)) {
        alert('You have already joined this arena game!');
        return;
      }

      // Update the game with new participant
      const updatedGame = {
        ...game,
        participants: [...game.participants, user.id]
      };

      await DatabaseService.update('arena_games', gameId, {
        participants: updatedGame.participants
      });

      // Update local state
      const updatedGames = [...arenaGames];
      updatedGames[gameIndex] = updatedGame;
      setArenaGames(updatedGames);

    } catch (error) {
      console.error('Error joining arena:', error);
      alert('Failed to join arena game. Please try again.');
    }
  };

  const handlePurchaseAutoJoin = async () => {
    if (!user) return;

    const cost = autoJoinRounds * 10;
    if (user.balance < cost) {
      alert(`Insufficient tickets! You need ${cost} tickets but only have ${user.balance}.`);
      return;
    }

    try {
      // This would integrate with the Discord bot's auto-join system
      alert(`Auto-join purchase functionality will be integrated with Discord bot. Cost: ${cost} tickets for ${autoJoinRounds} rounds.`);
      setAutoJoinDialog(false);
    } catch (error) {
      console.error('Error purchasing auto-join:', error);
      alert('Failed to purchase auto-join. Please try again.');
    }
  };

  if (!isAuthenticated) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">
          Please sign in to participate in Arena games.
        </Alert>
      </Container>
    );
  }

  const activeGame = arenaGames.find(game => game.active);
  const recentGames = arenaGames.filter(game => !game.active).slice(0, 10);

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
        <Typography color="text.primary">Arena</Typography>
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
        <ArenaIcon sx={{ fontSize: 32, color: '#FF6B6B', mr: 2 }} />
        <Typography variant="h3" component="h1">
          Ticket Arena
        </Typography>
        <Chip 
          label="Live" 
          color="success" 
          sx={{ ml: 2 }}
        />
      </Box>

             <Grid container spacing={3}>
         {/* Active Game Section */}
         <Grid item xs={12} lg={8}>
          {activeGame ? (
            <Card sx={{ 
              background: 'linear-gradient(135deg, #FF6B6B20 0%, #FF6B6B10 100%)',
              border: '2px solid #FF6B6B60',
              mb: 3
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FireIcon sx={{ color: '#FF6B6B' }} />
                    Arena Round #{activeGame.roundNumber}
                  </Typography>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h5" sx={{ color: '#FF6B6B', fontWeight: 'bold' }}>
                      {timeLeft}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Time Remaining
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" paragraph>
                    🏟️ Web3-themed survival game is live!
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Join the arena and fight for survival. Last player standing wins big!
                  </Typography>
                </Box>

                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ color: '#FF6B6B', fontWeight: 'bold' }}>
                        30
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Minutes Duration
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ color: '#FFD700', fontWeight: 'bold' }}>
                        50
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Winner Prize (Tickets)
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                        5
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Participation Reward
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* Participants */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    <PeopleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Participants ({activeGame.participants.length + activeGame.autoJoinParticipants.length})
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    {activeGame.participants.slice(0, 10).map((participantId, index) => (
                      <Avatar key={index} sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                        {index + 1}
                      </Avatar>
                    ))}
                    {activeGame.autoJoinParticipants.slice(0, 5).map((participantId, index) => (
                      <Avatar key={`auto-${index}`} sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                        <AutoIcon fontSize="small" />
                      </Avatar>
                    ))}
                    {(activeGame.participants.length + activeGame.autoJoinParticipants.length) > 15 && (
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'grey.500' }}>
                        +{(activeGame.participants.length + activeGame.autoJoinParticipants.length) - 15}
                      </Avatar>
                    )}
                  </Box>

                  {activeGame.autoJoinParticipants.length > 0 && (
                    <Typography variant="body2" color="text.secondary">
                      <AutoIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                      {activeGame.autoJoinParticipants.length} auto-join participants
                    </Typography>
                  )}
                </Box>

                {/* Progress Bar */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Game Progress
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={timeLeft === 'Ending soon...' ? 100 : Math.max(0, 100 - ((new Date().getTime() - new Date(activeGame.startTime).getTime()) / (30 * 60 * 1000)) * 100)}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              </CardContent>
              <CardActions sx={{ p: 3, pt: 0 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<ArenaIcon />}
                  onClick={() => handleJoinArena(activeGame.id)}
                  disabled={activeGame.participants.includes(user?.id || '') || activeGame.autoJoinParticipants.includes(user?.id || '')}
                  sx={{
                    background: 'linear-gradient(135deg, #FF6B6B 0%, #FF5252 100%)',
                    mr: 2
                  }}
                >
                  {activeGame.participants.includes(user?.id || '') || activeGame.autoJoinParticipants.includes(user?.id || '') 
                    ? 'Already Joined' 
                    : 'Join Arena'
                  }
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<AutoIcon />}
                  onClick={() => setAutoJoinDialog(true)}
                >
                  Buy Auto-Join
                </Button>
              </CardActions>
            </Card>
          ) : (
            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <TimerIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  No Active Arena Game
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Arena games start every 30 minutes. Check back soon!
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Next game will start automatically when enough players are ready.
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Arena History */}
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HistoryIcon />
                Recent Arena Games
              </Typography>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : recentGames.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No completed games yet.
                </Typography>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Round</TableCell>
                        <TableCell>Started</TableCell>
                        <TableCell>Participants</TableCell>
                        <TableCell>Winner</TableCell>
                        <TableCell>Prize</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentGames.map((game) => (
                        <TableRow key={game.id}>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              #{game.roundNumber}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {formatTimeAgo(game.startTime)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2">
                                {game.participants.length + game.autoJoinParticipants.length}
                              </Typography>
                              {game.autoJoinParticipants.length > 0 && (
                                <Chip 
                                  size="small" 
                                  label={`${game.autoJoinParticipants.length} auto`}
                                  sx={{ fontSize: '0.7rem' }}
                                />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            {game.winner ? (
                              <Chip 
                                icon={<TrophyIcon />}
                                label="Winner"
                                size="small"
                                color="success"
                              />
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                No participants
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              {game.ticketReward} tickets
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

        {/* Sidebar */}
        <Grid xs={12} lg={4}>
          <Grid container spacing={3}>
            {/* User Balance */}
            <Grid xs={12}>
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

            {/* Arena Rules */}
            <Grid xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    How Arena Works
                  </Typography>
                  <Typography variant="body2" paragraph>
                    🏟️ <strong>Join the Battle:</strong> Free to participate in 30-minute survival rounds
                  </Typography>
                  <Typography variant="body2" paragraph>
                    🎯 <strong>Survive to Win:</strong> Last player standing wins 50 tickets
                  </Typography>
                  <Typography variant="body2" paragraph>
                    🎫 <strong>Participation Reward:</strong> Everyone gets 5 tickets for joining
                  </Typography>
                  <Typography variant="body2" paragraph>
                    🤖 <strong>Auto-Join:</strong> Purchase credits to automatically join future games
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="body2" color="text.secondary">
                    Games start every 30 minutes with automatic matchmaking.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Auto-Join Info */}
            <Grid xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AutoIcon />
                    Auto-Join System
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Purchase auto-join credits to automatically participate in upcoming arena games.
                  </Typography>
                  <Box sx={{ bgcolor: 'info.main', color: 'info.contrastText', p: 2, borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      💡 10 tickets per auto-join credit
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button 
                    variant="contained" 
                    fullWidth
                    startIcon={<AutoIcon />}
                    onClick={() => setAutoJoinDialog(true)}
                  >
                    Purchase Auto-Join
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Auto-Join Purchase Dialog */}
      <Dialog open={autoJoinDialog} onClose={() => setAutoJoinDialog(false)}>
        <DialogTitle>Purchase Auto-Join Credits</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Auto-join credits allow you to automatically participate in future arena games without manually joining.
          </Typography>
          <TextField
            fullWidth
            type="number"
            label="Number of Rounds"
            value={autoJoinRounds}
            onChange={(e) => setAutoJoinRounds(Math.max(1, parseInt(e.target.value) || 1))}
            inputProps={{ min: 1, max: 50 }}
            sx={{ mt: 2 }}
          />
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="body2">
              <strong>Cost:</strong> {autoJoinRounds * 10} tickets
            </Typography>
            <Typography variant="body2">
              <strong>Your Balance:</strong> {user?.balance || 0} tickets
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAutoJoinDialog(false)}>Cancel</Button>
          <Button 
            onClick={handlePurchaseAutoJoin}
            variant="contained"
            disabled={(user?.balance || 0) < (autoJoinRounds * 10)}
          >
            Purchase ({autoJoinRounds * 10} tickets)
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}