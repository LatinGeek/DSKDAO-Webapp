import { Card, CardContent, Box, Typography, LinearProgress } from '@mui/material';

interface StatBaseCardProps {
  title: string;
  icon: React.ReactNode;
  change?: string;
  progressValue?: number;
  children: React.ReactNode;
}

export default function StatBaseCard({ 
  title, 
  icon, 
  change, 
  progressValue = 70,
  children 
}: StatBaseCardProps) {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                p: 1,
                borderRadius: 1,
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {icon}
            </Box>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Box>
          {change && (
            <Typography
              variant="body2"
              sx={{
                color: change.startsWith('+') ? 'success.main' : 'error.main',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {change}
            </Typography>
          )}
        </Box>
        <Box sx={{ mb: 2 }}>
          {children}
        </Box>
        <LinearProgress
          variant="determinate"
          value={progressValue}
          sx={{
            height: 6,
            borderRadius: 3,
            bgcolor: 'background.default',
            '& .MuiLinearProgress-bar': {
              borderRadius: 3,
            },
          }}
        />
      </CardContent>
    </Card>
  );
} 