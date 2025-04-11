import { Box, Typography } from '@mui/material';
import BaseCard from '../common/BaseCard';

interface StatBaseCardProps {
  title: string;
  icon: React.ReactNode;
  change?: string;
  children: React.ReactNode;
}

export default function StatBaseCard({ 
  title, 
  icon, 
  change, 
  children 
}: StatBaseCardProps) {
  return (
    <BaseCard
      gradient
      sx={{ 
        height: '100%', 
        minHeight: { xs: '80px', sm: '120px' }, 
        display: 'flex',
        p: { xs: 2, sm: 3 }
      }}
    >
      <Box sx={{ 
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: { xs: 'row', sm: 'row' },
        alignItems: { xs: 'center', sm: 'center' },
        gap: { xs: 2, sm: 2 },
        justifyContent: { xs: 'space-between', sm: 'space-between' }
      }}>
        {/* Content Section */}
        <Box sx={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: { xs: 'flex-start', sm: 'flex-start' },
          justifyContent: 'center',
          gap: 0.5
        }}>
          {/* Title */}
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            {title}
          </Typography>

          {/* Main Content */}
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            {children}
            {change && (
              <Typography
                variant="body2"
                sx={{
                  color: change.startsWith('+') ? 'success.main' : 'error.main',
                  whiteSpace: 'nowrap',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {change}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Icon Section */}
        <Box
          sx={{
            p: 1,
            borderRadius: 1,
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          {icon}
        </Box>
      </Box>
    </BaseCard>
  );
} 