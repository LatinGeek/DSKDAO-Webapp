import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Chip, 
  LinearProgress, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box
} from '@mui/material';
import { Raffle, RaffleEntry } from '@/types/entities/raffle';
import { RaffleStatus } from '@/types/enums';
import { useRaffles, formatTimeRemaining, getRaffleStatusColor, getRaffleStatusLabel } from '@/hooks/useRaffles';
import { formatPoints } from '@/hooks/useEnhancedUser';

interface RaffleCardProps {
  raffle: Raffle;
  userEntries?: RaffleEntry[];
  userId?: string;
  onPurchaseSuccess?: () => void;
  variant?: 'card' | 'detailed';
  className?: string;
}

export const RaffleCard: React.FC<RaffleCardProps> = ({
  raffle,
  userEntries = [],
  userId,
  onPurchaseSuccess,
  variant = 'card',
  className = ''
}) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [numberOfEntries, setNumberOfEntries] = useState(1);
  
  const { purchaseEntries, loading } = useRaffles();

  // Calculate user statistics
  const userTotalEntries = userEntries.reduce((sum, entry) => sum + entry.ticketNumbers.length, 0);
  const userTotalSpent = userEntries.reduce((sum, entry) => sum + entry.purchasePrice, 0);
  const userWinChance = raffle.totalTicketsSold > 0 ? (userTotalEntries / raffle.totalTicketsSold) * 100 : 0;

  // Calculate raffle statistics
  const ticketsRemaining = raffle.maxEntries - raffle.totalTicketsSold;
  const soldPercentage = (raffle.totalTicketsSold / raffle.maxEntries) * 100;
  const now = new Date();
  const endDate = new Date(raffle.endDate);
  const startDate = new Date(raffle.startDate);
  
  const hasStarted = now >= startDate;
  const hasEnded = now >= endDate;
  const isActive = raffle.status === RaffleStatus.ACTIVE;
  const canPurchase = isActive && hasStarted && !hasEnded && ticketsRemaining > 0 && userId;

  // Update countdown timer
  useEffect(() => {
    const updateTimer = () => {
      const remaining = Math.max(0, endDate.getTime() - Date.now());
      setTimeRemaining(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [endDate]); // endDate is derived from raffle.endDate

  const handlePurchase = async () => {
    if (!userId || !canPurchase) return;

    try {
      const result = await purchaseEntries(raffle.id, userId, numberOfEntries);
      if (result) {
        setShowPurchaseDialog(false);
        setNumberOfEntries(1);
        onPurchaseSuccess?.();
      }
    } catch (error) {
      console.error('Failed to purchase raffle entries:', error);
    }
  };

  const totalCost = raffle.ticketPrice * numberOfEntries;
  const maxUserEntries = raffle.maxEntriesPerUser > 0 ? 
    Math.min(raffle.maxEntriesPerUser - userTotalEntries, ticketsRemaining) : 
    ticketsRemaining;

  if (variant === 'detailed') {
    return (
      <Card className={`card-background ${className}`}>
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <Typography variant="h5" className="text-white mb-2">
                {raffle.title}
              </Typography>
              <Chip 
                label={getRaffleStatusLabel(raffle.status)}
                className={`text-${getRaffleStatusColor(raffle.status)}-400 border-${getRaffleStatusColor(raffle.status)}-400`}
                variant="outlined"
              />
            </div>
            {raffle.image && (
              <img 
                src={raffle.image} 
                alt={raffle.title}
                className="w-20 h-20 rounded-lg object-cover"
              />
            )}
          </div>

          {/* Description */}
          <Typography variant="body1" className="text-gray-300 mb-4">
            {raffle.description}
          </Typography>

          {/* Prize Information */}
          <div className="bg-secondary/20 rounded-lg p-4 mb-4">
            <Typography variant="h6" className="text-yellow-400 mb-2">
              🏆 Prize
            </Typography>
            <Typography variant="body1" className="text-white">
              {raffle.prizeDescription}
            </Typography>
            {raffle.prizeValue > 0 && (
              <Typography variant="body2" className="text-gray-400 mt-1">
                Estimated Value: {formatPoints(raffle.prizeValue)} points
              </Typography>
            )}
          </div>

          {/* Timer and Progress */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <Typography variant="body2" className="text-gray-400">
                {hasEnded ? 'Ended' : hasStarted ? 'Time Remaining' : 'Starts In'}
              </Typography>
              <Typography variant="body2" className="text-white font-mono">
                {formatTimeRemaining(timeRemaining)}
              </Typography>
            </div>
            <LinearProgress 
              variant="determinate" 
              value={soldPercentage} 
              className="h-2 rounded-full bg-gray-600"
            />
            <div className="flex justify-between items-center mt-1">
              <Typography variant="body2" className="text-gray-400">
                {raffle.totalTicketsSold} / {raffle.maxEntries} tickets sold
              </Typography>
              <Typography variant="body2" className="text-gray-400">
                {soldPercentage.toFixed(1)}%
              </Typography>
            </div>
          </div>

          {/* User Statistics */}
          {userId && userTotalEntries > 0 && (
            <div className="bg-primary/10 rounded-lg p-4 mb-4">
              <Typography variant="h6" className="text-primary mb-2">
                Your Entries
              </Typography>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Typography variant="body2" className="text-gray-400">Tickets</Typography>
                  <Typography variant="h6" className="text-white">{userTotalEntries}</Typography>
                </div>
                <div>
                  <Typography variant="body2" className="text-gray-400">Spent</Typography>
                  <Typography variant="h6" className="text-white">{formatPoints(userTotalSpent)}</Typography>
                </div>
                <div>
                  <Typography variant="body2" className="text-gray-400">Win Chance</Typography>
                  <Typography variant="h6" className="text-primary">{userWinChance.toFixed(2)}%</Typography>
                </div>
              </div>
            </div>
          )}

          {/* Raffle Information */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Typography variant="body2" className="text-gray-400">Ticket Price</Typography>
              <Typography variant="h6" className="text-white">{formatPoints(raffle.ticketPrice)}</Typography>
            </div>
            <div>
              <Typography variant="body2" className="text-gray-400">Participants</Typography>
              <Typography variant="h6" className="text-white">{raffle.totalParticipants}</Typography>
            </div>
          </div>

          {/* Winner Information */}
          {raffle.status === RaffleStatus.ENDED && raffle.winnerUserId && (
            <div className="bg-green-500/10 rounded-lg p-4 mb-4">
              <Typography variant="h6" className="text-green-400 mb-2">
                🎉 Winner Announced!
              </Typography>
              <Typography variant="body1" className="text-white">
                Winning Ticket: #{raffle.winnerTicketNumber}
              </Typography>
              <Typography variant="body2" className="text-gray-400">
                Drawn on {new Date(raffle.drawnAt!).toLocaleDateString()}
              </Typography>
            </div>
          )}

          {/* Purchase Button */}
          {canPurchase && (
            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              onClick={() => setShowPurchaseDialog(true)}
              disabled={loading || maxUserEntries <= 0}
              className="button-primary"
            >
              {maxUserEntries <= 0 ? 'Max Entries Reached' : 'Buy Entries'}
            </Button>
          )}

          {!canPurchase && userId && (
            <Button
              variant="outlined"
              color="secondary"
              fullWidth
              size="large"
              disabled
              className="button-secondary"
            >
              {!hasStarted ? 'Not Started' : hasEnded ? 'Ended' : !isActive ? 'Inactive' : 'Sold Out'}
            </Button>
          )}
        </CardContent>

        {/* Purchase Dialog */}
        <Dialog 
          open={showPurchaseDialog} 
          onClose={() => setShowPurchaseDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Purchase Raffle Entries</DialogTitle>
          <DialogContent>
            <Box className="space-y-4 pt-2">
              <Typography variant="body1">
                {raffle.title}
              </Typography>
              
              <TextField
                label="Number of Entries"
                type="number"
                value={numberOfEntries}
                onChange={(e) => setNumberOfEntries(Math.max(1, Math.min(maxUserEntries, parseInt(e.target.value) || 1)))}
                inputProps={{ min: 1, max: maxUserEntries }}
                fullWidth
                helperText={`Max: ${maxUserEntries} entries`}
              />

              <div className="bg-gray-100 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <Typography variant="body2">Cost per Entry:</Typography>
                  <Typography variant="body2">{formatPoints(raffle.ticketPrice)}</Typography>
                </div>
                <div className="flex justify-between items-center">
                  <Typography variant="body2">Number of Entries:</Typography>
                  <Typography variant="body2">{numberOfEntries}</Typography>
                </div>
                <div className="border-t border-gray-300 mt-2 pt-2">
                  <div className="flex justify-between items-center">
                    <Typography variant="h6">Total Cost:</Typography>
                    <Typography variant="h6" className="text-primary">
                      {formatPoints(totalCost)}
                    </Typography>
                  </div>
                </div>
              </div>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowPurchaseDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handlePurchase}
              variant="contained"
              color="primary"
              disabled={loading || numberOfEntries <= 0}
            >
              {loading ? 'Processing...' : 'Purchase'}
            </Button>
          </DialogActions>
        </Dialog>
      </Card>
    );
  }

  // Compact card variant
  return (
    <Card className={`card-background hover:bg-secondary/10 transition-colors cursor-pointer ${className}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <Typography variant="h6" className="text-white mb-1">
              {raffle.title}
            </Typography>
            <Chip 
              label={getRaffleStatusLabel(raffle.status)}
              size="small"
              className={`text-${getRaffleStatusColor(raffle.status)}-400 border-${getRaffleStatusColor(raffle.status)}-400`}
              variant="outlined"
            />
          </div>
          {raffle.image && (
            <img 
              src={raffle.image} 
              alt={raffle.title}
              className="w-12 h-12 rounded-lg object-cover ml-3"
            />
          )}
        </div>

        <Typography variant="body2" className="text-gray-400 mb-3 line-clamp-2">
          {raffle.description}
        </Typography>

        <div className="space-y-2 mb-3">
          <div className="flex justify-between">
            <Typography variant="body2" className="text-gray-400">Prize:</Typography>
            <Typography variant="body2" className="text-yellow-400">{raffle.prizeDescription}</Typography>
          </div>
          <div className="flex justify-between">
            <Typography variant="body2" className="text-gray-400">Ticket Price:</Typography>
            <Typography variant="body2" className="text-white">{formatPoints(raffle.ticketPrice)}</Typography>
          </div>
          <div className="flex justify-between">
            <Typography variant="body2" className="text-gray-400">Time Left:</Typography>
            <Typography variant="body2" className="text-white font-mono">
              {formatTimeRemaining(timeRemaining)}
            </Typography>
          </div>
        </div>

        <LinearProgress 
          variant="determinate" 
          value={soldPercentage} 
          className="h-1 rounded-full bg-gray-600 mb-2"
        />
        <Typography variant="body2" className="text-gray-400 text-center">
          {raffle.totalTicketsSold} / {raffle.maxEntries} tickets sold
        </Typography>

        {userId && userTotalEntries > 0 && (
          <div className="bg-primary/10 rounded p-2 mt-3">
            <Typography variant="body2" className="text-primary">
              Your entries: {userTotalEntries} ({userWinChance.toFixed(1)}% chance)
            </Typography>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RaffleCard;