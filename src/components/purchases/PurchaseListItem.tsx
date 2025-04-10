import { Box, Typography, Chip } from '@mui/material';
import { LocalActivity as TicketIcon } from '@mui/icons-material';
import BaseCard from '../common/BaseCard';

interface PurchaseListItemProps {
  purchase: {
    id: string;
    itemName: string;
    price: number;
    date: string;
    status: 'completed' | 'pending' | 'failed';
    transactionHash?: string;
  };
}

export default function PurchaseListItem({ purchase }: PurchaseListItemProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <BaseCard
      borderIndicator
      borderIndicatorColor={getStatusColor(purchase.status) + '.main'}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {purchase.itemName}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {new Date(purchase.date).toLocaleDateString()} at{' '}
            {new Date(purchase.date).toLocaleTimeString()}
          </Typography>
          {purchase.transactionHash && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: 'block',
                mt: 0.5,
                fontFamily: 'monospace',
                wordBreak: 'break-all'
              }}
            >
              Tx: {purchase.transactionHash}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TicketIcon color="primary" fontSize="small" />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {purchase.price}
            </Typography>
          </Box>
          <Chip
            label={purchase.status}
            color={getStatusColor(purchase.status)}
            size="small"
            sx={{ textTransform: 'capitalize' }}
          />
        </Box>
      </Box>
    </BaseCard>
  );
} 