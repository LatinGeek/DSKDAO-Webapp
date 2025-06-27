import React from 'react';
import { Box, Typography, Card, CardContent, Tooltip, IconButton } from '@mui/material';
import { formatPoints, getPointTypeLabel, getPointTypeDescription } from '@/hooks/useEnhancedUser';
import { PointType } from '@/types/enums';

interface EnhancedPointsDisplayProps {
  redeemablePoints: number;
  soulBoundPoints: number;
  totalEarned?: number;
  loading?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'card' | 'inline' | 'dashboard';
  showTotals?: boolean;
  showDescriptions?: boolean;
  className?: string;
}

export const EnhancedPointsDisplay: React.FC<EnhancedPointsDisplayProps> = ({
  redeemablePoints,
  soulBoundPoints,
  totalEarned,
  loading = false,
  size = 'medium',
  variant = 'card',
  showTotals = false,
  showDescriptions = true,
  className = ''
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          title: 'text-sm',
          value: 'text-lg font-bold',
          description: 'text-xs'
        };
      case 'large':
        return {
          title: 'text-lg',
          value: 'text-2xl font-bold',
          description: 'text-sm'
        };
      default:
        return {
          title: 'text-base',
          value: 'text-xl font-bold',
          description: 'text-sm'
        };
    }
  };

  const sizeClasses = getSizeClasses();

  const PointItem = ({ 
    pointType, 
    value, 
    icon 
  }: { 
    pointType: PointType; 
    value: number; 
    icon?: string;
  }) => (
    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/10 border border-primary/20">
      <div className="flex items-center space-x-3">
        {icon && <span className="text-2xl">{icon}</span>}
        <div>
          <div className={`${sizeClasses.title} text-gray-300`}>
            {getPointTypeLabel(pointType)}
          </div>
          {showDescriptions && (
            <Tooltip title={getPointTypeDescription(pointType)} arrow>
              <div className={`${sizeClasses.description} text-gray-500 cursor-help`}>
                {getPointTypeDescription(pointType)}
              </div>
            </Tooltip>
          )}
        </div>
      </div>
      <div className={`${sizeClasses.value} ${pointType === PointType.REDEEMABLE ? 'text-primary' : 'text-purple-400'}`}>
        {loading ? '...' : formatPoints(value)}
      </div>
    </div>
  );

  const TotalEarnedDisplay = () => {
    if (!showTotals || totalEarned === undefined) return null;

    return (
      <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">🏆</span>
          <div>
            <div className={`${sizeClasses.title} text-green-300`}>
              Total Earned
            </div>
            {showDescriptions && (
              <div className={`${sizeClasses.description} text-green-500`}>
                Lifetime points earned
              </div>
            )}
          </div>
        </div>
        <div className={`${sizeClasses.value} text-green-400`}>
          {loading ? '...' : formatPoints(totalEarned)}
        </div>
      </div>
    );
  };

  if (variant === 'inline') {
    return (
      <div className={`flex items-center space-x-4 ${className}`}>
        <div className="flex items-center space-x-2">
          <span className="text-primary">💎</span>
          <span className={`${sizeClasses.value} text-primary`}>
            {loading ? '...' : formatPoints(redeemablePoints)}
          </span>
          <span className={`${sizeClasses.description} text-gray-400`}>
            Redeemable
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-purple-400">⚡</span>
          <span className={`${sizeClasses.value} text-purple-400`}>
            {loading ? '...' : formatPoints(soulBoundPoints)}
          </span>
          <span className={`${sizeClasses.description} text-gray-400`}>
            Soul-Bound
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'dashboard') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
        <Card className="card-background">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-2xl">💎</span>
                </div>
                <div>
                  <Typography variant="h6" className="text-primary">
                    {loading ? '...' : formatPoints(redeemablePoints)}
                  </Typography>
                  <Typography variant="body2" className="text-gray-400">
                    Redeemable Points
                  </Typography>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-background">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <span className="text-2xl">⚡</span>
                </div>
                <div>
                  <Typography variant="h6" className="text-purple-400">
                    {loading ? '...' : formatPoints(soulBoundPoints)}
                  </Typography>
                  <Typography variant="body2" className="text-gray-400">
                    Soul-Bound Points
                  </Typography>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {showTotals && totalEarned !== undefined && (
          <Card className="card-background md:col-span-2">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                    <span className="text-2xl">🏆</span>
                  </div>
                  <div>
                    <Typography variant="h6" className="text-green-400">
                      {loading ? '...' : formatPoints(totalEarned)}
                    </Typography>
                    <Typography variant="body2" className="text-gray-400">
                      Total Earned (Lifetime)
                    </Typography>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Default card variant
  return (
    <Card className={`card-background ${className}`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <Typography variant="h6" className="text-white mb-4">
            Point Balance
          </Typography>
          
          <PointItem 
            pointType={PointType.REDEEMABLE}
            value={redeemablePoints}
            icon="💎"
          />
          
          <PointItem 
            pointType={PointType.SOUL_BOUND}
            value={soulBoundPoints}
            icon="⚡"
          />

          <TotalEarnedDisplay />
        </div>
      </CardContent>
    </Card>
  );
};

// Separate component for point indicators in headers/navbars
export const PointsIndicator: React.FC<{
  redeemablePoints: number;
  soulBoundPoints: number;
  loading?: boolean;
  compact?: boolean;
}> = ({ redeemablePoints, soulBoundPoints, loading = false, compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center space-x-3">
        <Tooltip title="Redeemable Points - Can be spent" arrow>
          <div className="flex items-center space-x-1">
            <span className="text-primary">💎</span>
            <span className="text-primary font-semibold">
              {loading ? '...' : formatPoints(redeemablePoints)}
            </span>
          </div>
        </Tooltip>
        
        <Tooltip title="Soul-Bound Points - Voting power" arrow>
          <div className="flex items-center space-x-1">
            <span className="text-purple-400">⚡</span>
            <span className="text-purple-400 font-semibold">
              {loading ? '...' : formatPoints(soulBoundPoints)}
            </span>
          </div>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4 p-3 rounded-lg bg-secondary/10">
      <div className="flex items-center space-x-2">
        <span className="text-primary text-lg">💎</span>
        <div>
          <div className="text-primary font-bold">
            {loading ? '...' : formatPoints(redeemablePoints)}
          </div>
          <div className="text-xs text-gray-400">Redeemable</div>
        </div>
      </div>
      
      <div className="w-px h-8 bg-gray-600"></div>
      
      <div className="flex items-center space-x-2">
        <span className="text-purple-400 text-lg">⚡</span>
        <div>
          <div className="text-purple-400 font-bold">
            {loading ? '...' : formatPoints(soulBoundPoints)}
          </div>
          <div className="text-xs text-gray-400">Soul-Bound</div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedPointsDisplay;