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
        minHeight: { xs: '80px', sm: '150px' }, 
        display: 'flex',
        p: { xs: 2, sm: 3 }
      }}
    >
      <Box sx={{ 
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: { xs: 'row', sm: 'column' },
        alignItems: { xs: 'center', sm: 'stretch' },
        gap: { xs: 2, sm: 0 },
        justifyContent: { xs: 'space-between', sm: 'space-between' }
      }}>
        {/* Title Section */}
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          minWidth: { xs: 'fit-content', sm: '100%' },
          justifyContent: { sm: 'center' },
          flex: { xs: 'initial', sm: '0 0 auto' }
        }}>
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
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            {title}
          </Typography>
        </Box>

        {/* Content Section */}
        <Box sx={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: { xs: 'flex-end', sm: 'center' },
          justifyContent: 'center',
          gap: 1,
          flex: { xs: '1 1 auto', sm: '1 1 auto' },
          width: '100%',
          minHeight: { sm: '70px' }
        }}>
          {/* Main Content */}
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: { xs: 'flex-end', sm: 'center' },
            width: '100%'
          }}>
            {children}
          </Box>

          {/* Change Indicator */}
          {change && (
            <Typography
              variant="body2"
              sx={{
                color: change.startsWith('+') ? 'success.main' : 'error.main',
                whiteSpace: 'nowrap',
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                display: 'flex',
                alignItems: 'center',
                justifyContent: { xs: 'flex-end', sm: 'center' },
                width: '100%'
              }}
            >
              {change}
            </Typography>
          )}
        </Box>
      </Box>
    </BaseCard>
  );
} 