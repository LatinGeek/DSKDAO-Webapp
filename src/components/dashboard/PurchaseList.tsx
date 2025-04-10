import { FC } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Stack,
  Chip,
  CardMedia,
  Grid,
  Divider
} from '@mui/material';
import { usePurchases } from '@/hooks/usePurchases';
import { formatPrice } from '@/utils/format';
import { generatePlaceholderImage } from '@/utils/images';
import { format } from 'date-fns';

interface PurchaseListProps {
  userId: string;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
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

const PurchaseList: FC<PurchaseListProps> = ({ userId }) => {
  const { purchases, loading, error } = usePurchases(userId);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (purchases.length === 0) {
    return (
      <Alert severity="info">
        You haven't made any purchases yet. Visit the shop to get started!
      </Alert>
    );
  }

  return (
    <Stack spacing={3}>
      {purchases.map((purchase) => {
        const itemName = purchase.item?.name || `Item #${purchase.itemId.slice(-6)}`;
        
        return (
          <Card key={purchase.id} variant="outlined" sx={{ overflow: 'visible' }}>
            <CardContent>
              <Grid container spacing={3}>
                {/* Item Image */}
                <Grid item xs={12} sm={3}>
                  <CardMedia
                    component="img"
                    image={purchase.item?.image || generatePlaceholderImage(itemName)}
                    alt={itemName}
                    sx={{
                      height: 140,
                      width: '100%',
                      objectFit: 'contain',
                      bgcolor: 'background.default',
                      borderRadius: 1,
                    }}
                  />
                </Grid>

                {/* Purchase Details */}
                <Grid item xs={12} sm={9}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {itemName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Order #{purchase.id.slice(-6)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {format(new Date(purchase.createdAt), 'PPpp')}
                      </Typography>
                    </Box>
                    <Box display="flex" flexDirection="column" alignItems="flex-end">
                      <Typography variant="h6" color="primary" gutterBottom>
                        {formatPrice(purchase.totalPrice)}
                      </Typography>
                      <Chip
                        label={purchase.status}
                        color={getStatusColor(purchase.status) as any}
                        size="small"
                        sx={{ minWidth: 90 }}
                      />
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Quantity: {purchase.quantity}
                      </Typography>
                      {purchase.item?.description && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mt: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {purchase.item.description}
                        </Typography>
                      )}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box display="flex" flexDirection="column" alignItems="flex-end">
                        <Typography variant="body2" color="text.secondary">
                          Price per item: {formatPrice(purchase.totalPrice / purchase.quantity)}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );
};

export default PurchaseList; 