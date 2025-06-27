import React, { useState, useEffect, useRef } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  TextField, 
  Box, 
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { usePlinko, getPlinkoMultiplierColor, formatMultiplier, calculatePotentialWin, getRiskLevelColor, getRiskLevelDescription } from '@/hooks/useGames';
import { formatPoints } from '@/hooks/useEnhancedUser';

interface PlinkoGameProps {
  gameId: string;
  userId: string;
  onBalanceUpdate?: (newBalance: number) => void;
  className?: string;
}

export const PlinkoGame: React.FC<PlinkoGameProps> = ({
  gameId,
  userId,
  onBalanceUpdate,
  className = ''
}) => {
  const [betAmount, setBetAmount] = useState(10);
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [showResult, setShowResult] = useState(false);
  const [animating, setAnimating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { 
    play, 
    lastResult, 
    sessionStats, 
    loading, 
    error 
  } = usePlinko(gameId, userId);

  // Plinko board configuration
  const BOARD_CONFIG = {
    rows: 14,
    pegs: 15,
    slots: 15,
    width: 600,
    height: 400,
    pegRadius: 4,
    ballRadius: 6,
    slotHeight: 40
  };

  // Default multipliers (these would come from game config in production)
  const multipliers = [0.2, 0.5, 1, 1.5, 2, 3, 5, 10, 5, 3, 2, 1.5, 1, 0.5, 0.2];

  // Handle play button click
  const handlePlay = async () => {
    if (loading || animating) return;

    setAnimating(true);
    setShowResult(false);

    try {
      // Start ball animation
      animateBall();

      // Play the game
      const result = await play(betAmount, riskLevel);
      
      if (result) {
        // Show result after animation
        setTimeout(() => {
          setShowResult(true);
          setAnimating(false);
          onBalanceUpdate?.(result.newBalance);
        }, 3000); // Animation duration
      }
    } catch (error) {
      console.error('Failed to play Plinko:', error);
      setAnimating(false);
    }
  };

  // Draw the Plinko board
  const drawBoard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height, rows, pegRadius, slotHeight } = BOARD_CONFIG;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Set canvas size
    canvas.width = width;
    canvas.height = height;
    
    // Draw background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);
    
    // Draw pegs
    ctx.fillStyle = '#16213e';
    for (let row = 0; row < rows; row++) {
      const pegsInRow = row + 3;
      const pegSpacing = width / (pegsInRow + 1);
      const y = (height - slotHeight) * (row + 1) / rows;
      
      for (let peg = 0; peg < pegsInRow; peg++) {
        const x = pegSpacing * (peg + 1);
        ctx.beginPath();
        ctx.arc(x, y, pegRadius, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
    
    // Draw multiplier slots at bottom
    const slotWidth = width / multipliers.length;
    for (let i = 0; i < multipliers.length; i++) {
      const x = i * slotWidth;
      const y = height - slotHeight;
      
      // Slot background
      const multiplier = multipliers[i];
      if (multiplier >= 5) {
        ctx.fillStyle = '#f39c12'; // Gold for high multipliers
      } else if (multiplier >= 2) {
        ctx.fillStyle = '#3498db'; // Blue for good multipliers
      } else if (multiplier >= 1) {
        ctx.fillStyle = '#27ae60'; // Green for break-even+
      } else {
        ctx.fillStyle = '#e74c3c'; // Red for losses
      }
      
      ctx.fillRect(x, y, slotWidth - 1, slotHeight);
      
      // Slot text
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        formatMultiplier(multiplier),
        x + slotWidth / 2,
        y + slotHeight / 2 + 4
      );
    }
  };

  // Animate ball falling
  const animateBall = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height, rows, ballRadius, slotHeight } = BOARD_CONFIG;
    
    let ballX = width / 2; // Start at center
    let ballY = 20;
    let currentRow = 0;
    
    const animate = () => {
      // Redraw board
      drawBoard();
      
      // Draw ball
      ctx.fillStyle = '#ff6b6b';
      ctx.beginPath();
      ctx.arc(ballX, ballY, ballRadius, 0, 2 * Math.PI);
      ctx.fill();
      
      // Move ball down
      ballY += 3;
      
      // Check if ball reached a peg row
      const rowY = (height - slotHeight) * (currentRow + 1) / rows;
      if (ballY >= rowY && currentRow < rows) {
        // Random bounce left or right
        const direction = Math.random() < 0.5 ? -1 : 1;
        ballX += direction * 15;
        currentRow++;
      }
      
      // Continue animation if ball hasn't reached bottom
      if (ballY < height - slotHeight) {
        requestAnimationFrame(animate);
      } else {
        // Ball reached bottom, determine final slot
        const slotWidth = width / multipliers.length;
        const finalSlot = Math.max(0, Math.min(multipliers.length - 1, Math.floor(ballX / slotWidth)));
        
        // Snap ball to center of final slot
        ballX = finalSlot * slotWidth + slotWidth / 2;
        
        // Redraw final position
        drawBoard();
        ctx.fillStyle = '#ff6b6b';
        ctx.beginPath();
        ctx.arc(ballX, height - slotHeight / 2, ballRadius, 0, 2 * Math.PI);
        ctx.fill();
        
        // Highlight winning slot
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.strokeRect(finalSlot * slotWidth, height - slotHeight, slotWidth - 1, slotHeight);
      }
    };
    
    animate();
  };

  // Initialize board on mount
  useEffect(() => {
    drawBoard();
  }, []);

  // Redraw board when component resizes
  useEffect(() => {
    const handleResize = () => drawBoard();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const potentialWin = calculatePotentialWin(betAmount, 10); // Show max potential

  return (
    <Card className={`card-background ${className}`}>
      <CardContent className="p-6">
        <Typography variant="h5" className="text-white mb-4">
          🎯 Plinko Game
        </Typography>

        {/* Game Board */}
        <div className="relative mb-6">
          <canvas
            ref={canvasRef}
            className="border border-primary/20 rounded-lg bg-gray-900"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
          
          {animating && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
              <div className="text-center">
                <LinearProgress className="mb-2" />
                <Typography variant="body2" className="text-white">
                  Ball is falling...
                </Typography>
              </div>
            </div>
          )}
        </div>

        {/* Game Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Bet Amount */}
          <TextField
            label="Bet Amount"
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(Math.max(1, parseInt(e.target.value) || 1))}
            disabled={loading || animating}
            inputProps={{ min: 1, max: 1000 }}
            fullWidth
            variant="outlined"
          />

          {/* Risk Level */}
          <FormControl fullWidth>
            <InputLabel>Risk Level</InputLabel>
            <Select
              value={riskLevel}
              label="Risk Level"
              onChange={(e) => setRiskLevel(e.target.value as 'low' | 'medium' | 'high')}
              disabled={loading || animating}
            >
              <MenuItem value="low">
                <span className={getRiskLevelColor('low')}>Low Risk</span>
              </MenuItem>
              <MenuItem value="medium">
                <span className={getRiskLevelColor('medium')}>Medium Risk</span>
              </MenuItem>
              <MenuItem value="high">
                <span className={getRiskLevelColor('high')}>High Risk</span>
              </MenuItem>
            </Select>
          </FormControl>

          {/* Play Button */}
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handlePlay}
            disabled={loading || animating || betAmount <= 0}
            fullWidth
            className="h-14"
          >
            {animating ? 'Playing...' : loading ? 'Processing...' : `Drop Ball`}
          </Button>
        </div>

        {/* Risk Level Description */}
        <Typography variant="body2" className="text-gray-400 mb-4 text-center">
          {getRiskLevelDescription(riskLevel)}
        </Typography>

        {/* Game Info */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <Typography variant="body2" className="text-gray-400">Bet Amount</Typography>
            <Typography variant="h6" className="text-white">{formatPoints(betAmount)}</Typography>
          </div>
          <div className="text-center">
            <Typography variant="body2" className="text-gray-400">Max Win</Typography>
            <Typography variant="h6" className="text-yellow-400">{formatPoints(potentialWin)}</Typography>
          </div>
        </div>

        {/* Session Statistics */}
        {sessionStats && (
          <div className="bg-secondary/10 rounded-lg p-4 mb-4">
            <Typography variant="h6" className="text-white mb-2">Session Stats</Typography>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <Typography variant="body2" className="text-gray-400">Games</Typography>
                <Typography variant="body1" className="text-white">{sessionStats.totalSessions}</Typography>
              </div>
              <div>
                <Typography variant="body2" className="text-gray-400">Win Rate</Typography>
                <Typography variant="body1" className="text-primary">{sessionStats.winRate.toFixed(1)}%</Typography>
              </div>
              <div>
                <Typography variant="body2" className="text-gray-400">Net Result</Typography>
                <Typography variant="body1" className={sessionStats.netResult >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {sessionStats.netResult >= 0 ? '+' : ''}{formatPoints(sessionStats.netResult)}
                </Typography>
              </div>
              <div>
                <Typography variant="body2" className="text-gray-400">Biggest Win</Typography>
                <Typography variant="body1" className="text-yellow-400">{formatPoints(sessionStats.biggestWin)}</Typography>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
            <Typography variant="body2" className="text-red-400">
              {error}
            </Typography>
          </div>
        )}
      </CardContent>

      {/* Result Dialog */}
      <Dialog open={showResult} onClose={() => setShowResult(false)}>
        <DialogTitle>Game Result</DialogTitle>
        <DialogContent>
          {lastResult && (
            <div className="text-center py-4">
              {lastResult.winAmount > 0 ? (
                <div>
                  <Typography variant="h4" className="text-green-400 mb-2">🎉 You Won!</Typography>
                  <Typography variant="h5" className="text-white mb-2">
                    {formatPoints(lastResult.winAmount)}
                  </Typography>
                  <Chip 
                    label={`${formatMultiplier(lastResult.gameData.multiplier)} Multiplier`}
                    className="bg-green-500 text-white"
                  />
                </div>
              ) : (
                <div>
                  <Typography variant="h4" className="text-red-400 mb-2">💔 Better Luck Next Time</Typography>
                  <Typography variant="body1" className="text-gray-400">
                    You lost {formatPoints(betAmount)}
                  </Typography>
                </div>
              )}
              
              <div className="mt-4 pt-4 border-t border-gray-600">
                <Typography variant="body2" className="text-gray-400">
                  New Balance: {formatPoints(lastResult.newBalance)}
                </Typography>
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowResult(false)} color="primary">
            Continue Playing
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default PlinkoGame;