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
        display: 'flex',
        flexDirection: { xs: 'row', sm: 'column' },
        alignItems: { xs: 'center', sm: 'flex-start' },
        gap: { xs: 2, sm: 2 },
        justifyContent: { xs: 'space-between', sm: 'flex-start' },
        height: '100%'
      }}>
        {/* Left Section: Icon and Title */}
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          minWidth: { xs: 'fit-content', sm: '100%' },
          mb: { sm: 2 }
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

        {/* Right Section: Content and Change */}
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flex: { xs: '1 1 auto', sm: 'initial' },
          width: { sm: '100%' },
          justifyContent: { xs: 'flex-end', sm: 'flex-start' }
        }}>
          {/* Content */}
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            maxWidth: { xs: '70%', sm: '100%' },
            overflow: 'hidden'
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
                ml: { xs: 1, sm: 'auto' },
                mt: { sm: 2 }
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