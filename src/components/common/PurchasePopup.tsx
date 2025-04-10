import { Box, Typography, Fade, Paper } from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';
import TicketPrice from './TicketPrice';

interface PurchasePopupProps {
  show: boolean;
  type: 'success' | 'error';
  itemName: string;
  price?: number;
  message: string;
}

export default function PurchasePopup({ show, type, itemName, price, message }: PurchasePopupProps) {
  return (
    <Fade in={show}>
      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 'auto',
          maxWidth: '90vw',
          borderRadius: 2,
          p: 2,
          zIndex: 1400,
          animation: show ? 'slideIn 0.5s ease-out' : 'none',
          bgcolor: type === 'success' ? 'success.main' : 'error.main',
          color: '#fff',
          '@keyframes slideIn': {
            '0%': {
              transform: 'translateY(100%)',
              opacity: 0,
            },
            '100%': {
              transform: 'translateY(0)',
              opacity: 1,
            },
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          {type === 'success' ? (
            <CheckCircle sx={{ fontSize: 40 }} />
          ) : (
            <Cancel sx={{ fontSize: 40 }} />
          )}
          
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
              {type === 'success' ? 'Purchase Successful!' : 'Purchase Failed'}
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 0.5, opacity: 0.9 }}>
              {itemName}
            </Typography>

            {type === 'success' && price && (
              <Box sx={{ mt: 1 }}>
                <TicketPrice 
                  amount={price} 
                  size="small"
                  sx={{
                    '& .MuiSvgIcon-root': { color: '#fff' },
                    '& .MuiTypography-root': { color: '#fff' }
                  }}
                />
              </Box>
            )}

            <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.9 }}>
              {message}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Fade>
  );
} 