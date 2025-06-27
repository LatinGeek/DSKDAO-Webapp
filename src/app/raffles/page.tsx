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
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Divider,
  Grid
} from '@mui/material';
import {
  ConfirmationNumber as RaffleIcon,
  LocalFireDepartment as FireIcon,
  AccessTime as TimerIcon,
  People as PeopleIcon,
  EmojiEvents as TrophyIcon,
  History as HistoryIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useRaffles } from '@/hooks/useRaffles';
import { formatCurrency, formatTimeAgo } from '@/utils/format';
import { DatabaseService } from '@/lib/db';

interface DiscordRaffle {
  id: string;
  title: string;
  prizeTitle: string;
  prizeImageUrl: string;
  endingDateTime: Date;
  maxParticipants: number;
  ticketPrice: number;
  participants: string[];
  ticketsSold: number;
  winnerUserID?: string;
  active: boolean;
  createdAt: Date;
  createdBy: string;
}

export default function RafflesPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [raffles, setRaffles] = useState<DiscordRaffle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRaffle, setSelectedRaffle] = useState<DiscordRaffle | null>(null);
  const [entryDialog, setEntryDialog] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadRaffles();
      const interval = setInterval(loadRaffles, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const loadRaffles = async () => {
    try {
      const raffleData = await DatabaseService.getMany('raffles', [
        DatabaseService.orderBy('createdAt', 'desc')
      ]);
      setRaffles(raffleData as DiscordRaffle[]);
    } catch (error) {
      console.error('Error loading raffles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnterRaffle = async () => {
    if (!selectedRaffle || !user) return;

    // Check if user has enough tickets
    if (user.balance < selectedRaffle.ticketPrice) {
      alert(`Insufficient tickets! You need ${selectedRaffle.ticketPrice} tickets but only have ${user.balance}.`);
      return;
    }

    // Check if already entered
    if (selectedRaffle.participants.includes(user.id)) {
      alert('You have already entered this raffle!');
      return;
    }

    // Check if raffle is full
    if (selectedRaffle.ticketsSold >= selectedRaffle.maxParticipants) {
      alert('This raffle is full!');
      return;
    }

    try {
      // This would integrate with the Discord bot's raffle system
      alert(`Raffle entry functionality will be integrated with Discord bot. Cost: ${selectedRaffle.ticketPrice} tickets.`);
      setEntryDialog(false);
      setSelectedRaffle(null);
    } catch (error) {
      console.error('Error entering raffle:', error);
      alert('Failed to enter raffle. Please try again.');
    }
  };

  if (!isAuthenticated) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">
          Please sign in to participate in raffles.
        </Alert>
      </Container>
    );
  }

  const activeRaffles = raffles.filter(raffle => raffle.active);
  const endedRaffles = raffles.filter(raffle => !raffle.active);

  const getTimeLeft = (endDate: Date) => {
    const now = new Date();
    const timeDiff = endDate.getTime() - now.getTime();
    
    if (timeDiff <= 0) return 'Ended';
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getProgress = (raffle: DiscordRaffle) => {
    return (raffle.ticketsSold / raffle.maxParticipants) * 100;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2 
        }}>
          <RaffleIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          Raffles
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Enter Discord raffles to win exclusive prizes! All raffles are managed through our Discord bot.
        </Typography>

        {/* User Balance */}
        <Card sx={{ 
          mb: 3,
          background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
          color: 'white'
        }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm={6}>
                <Typography variant="h5" gutterBottom>
                  Your Balance
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                  {user?.balance || 0} tickets
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Ready to enter raffles and win amazing prizes!
                  </Typography>
                  <Button 
                    variant="outlined" 
                    sx={{ 
                      mt: 1,
                      borderColor: 'rgba(255,255,255,0.5)',
                      color: 'white',
                      '&:hover': {
                        borderColor: 'white',
                        backgroundColor: 'rgba(255,255,255,0.1)'
                      }
                    }}
                    onClick={() => router.push('/history')}
                  >
                    View History
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

      <Grid container spacing={4}>
        {/* Active Raffles */}
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FireIcon sx={{ color: '#FF6B6B' }} />
            Active Raffles ({activeRaffles.length})
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={48} />
            </Box>
          ) : activeRaffles.length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <RaffleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  No Active Raffles
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Check back soon for new raffles, or join our Discord to stay updated!
                </Typography>
                <Button variant="outlined" onClick={() => router.push('/games')}>
                  Explore Games
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {activeRaffles.map((raffle) => (
                <Grid item xs={12} md={6} lg={4} key={raffle.id}>
                  <Card sx={{ 
                    height: '100%',
                    background: 'linear-gradient(135deg, #FFD70020 0%, #FFD70010 100%)',
                    border: '2px solid #FFD70040',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 32px #FFD70040'
                    }
                  }}>
                    <CardContent>
                      {/* Prize Image */}
                      {raffle.prizeImageUrl && (
                        <Box 
                          sx={{ 
                            width: '100%',
                            height: 200,
                            backgroundImage: `url(${raffle.prizeImageUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            borderRadius: 1,
                            mb: 2
                          }}
                        />
                      )}

                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                        {raffle.title}
                      </Typography>
                      
                      <Typography variant="body1" color="text.secondary" paragraph>
                        {raffle.prizeTitle}
                      </Typography>

                      {/* Raffle Info */}
                      <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                              {raffle.ticketPrice}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Ticket Price
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" color="warning.main" sx={{ fontWeight: 'bold' }}>
                              {getTimeLeft(raffle.endingDateTime)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Time Left
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>

                      {/* Progress */}
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">
                            Entries: {raffle.ticketsSold}/{raffle.maxParticipants}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {Math.round(getProgress(raffle))}%
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={getProgress(raffle)}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>

                      {/* Entry Status */}
                      {raffle.participants.includes(user?.id || '') ? (
                        <Chip 
                          label="Already Entered" 
                          color="success" 
                          sx={{ width: '100%', mb: 2 }}
                        />
                      ) : raffle.ticketsSold >= raffle.maxParticipants ? (
                        <Chip 
                          label="Raffle Full" 
                          color="error" 
                          sx={{ width: '100%', mb: 2 }}
                        />
                      ) : (user?.balance || 0) < raffle.ticketPrice ? (
                        <Chip 
                          label="Insufficient Tickets" 
                          color="warning" 
                          sx={{ width: '100%', mb: 2 }}
                        />
                      ) : (
                        <Chip 
                          label="Ready to Enter" 
                          color="primary" 
                          sx={{ width: '100%', mb: 2 }}
                        />
                      )}
                    </CardContent>
                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        disabled={
                          raffle.participants.includes(user?.id || '') ||
                          raffle.ticketsSold >= raffle.maxParticipants ||
                          (user?.balance || 0) < raffle.ticketPrice
                        }
                        onClick={() => {
                          setSelectedRaffle(raffle);
                          setEntryDialog(true);
                        }}
                        sx={{
                          background: 'linear-gradient(135deg, #FFD700 0%, #FFA000 100%)',
                          color: 'black',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #FFC107 0%, #FF8F00 100%)'
                          }
                        }}
                      >
                        {raffle.participants.includes(user?.id || '') 
                          ? 'Entered' 
                          : `Enter (${raffle.ticketPrice} tickets)`
                        }
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>

        {/* Recent Raffles */}
        {endedRaffles.length > 0 && (
          <Grid item xs={12}>
            <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 4 }}>
              <HistoryIcon />
              Recent Raffles
            </Typography>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Raffle</TableCell>
                    <TableCell>Prize</TableCell>
                    <TableCell>Entries</TableCell>
                    <TableCell>Winner</TableCell>
                    <TableCell>Ended</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {endedRaffles.slice(0, 10).map((raffle) => (
                    <TableRow key={raffle.id}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {raffle.title}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {raffle.prizeTitle}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {raffle.ticketsSold}/{raffle.maxParticipants}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {raffle.winnerUserID ? (
                          <Chip 
                            icon={<TrophyIcon />}
                            label="Winner Selected"
                            size="small"
                            color="success"
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No entries
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatTimeAgo(raffle.endingDateTime)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        )}
      </Grid>

      {/* Entry Confirmation Dialog */}
      <Dialog open={entryDialog} onClose={() => setEntryDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Enter Raffle: {selectedRaffle?.title}
        </DialogTitle>
        <DialogContent>
          {selectedRaffle && (
            <Box>
              <Typography variant="body1" paragraph>
                <strong>Prize:</strong> {selectedRaffle.prizeTitle}
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>Entry Cost:</strong> {selectedRaffle.ticketPrice} tickets
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>Current Entries:</strong> {selectedRaffle.ticketsSold}/{selectedRaffle.maxParticipants}
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>Time Remaining:</strong> {getTimeLeft(selectedRaffle.endingDateTime)}
              </Typography>
              
              <Box sx={{ mt: 2, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ color: 'warning.contrastText' }}>
                  <strong>Note:</strong> This raffle is managed through our Discord bot. 
                  Winners will be announced in Discord and contacted directly.
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEntryDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleEnterRaffle}
            variant="contained"
            disabled={!selectedRaffle || (user?.balance || 0) < (selectedRaffle?.ticketPrice || 0)}
          >
            Enter Raffle
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}