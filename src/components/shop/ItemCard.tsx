'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import { ShoppingCart as ShoppingCartIcon } from '@mui/icons-material';

interface Item {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  currency: string;
  stock: number;
}

interface ItemCardProps {
  item: Item;
}

export default function ItemCard({ item }: ItemCardProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    setLoading(true);
    try {
      // Implement purchase logic here
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulated API call
      setOpen(false);
    } catch (error) {
      console.error('Purchase failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          '&:hover': {
            transform: 'translateY(-4px)',
            transition: 'transform 0.2s ease-in-out',
          },
        }}
      >
        <CardMedia
          component="img"
          height="200"
          image={item.image}
          alt={item.name}
          sx={{ objectFit: 'cover' }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            bgcolor: 'background.paper',
            borderRadius: 1,
            px: 1,
            py: 0.5,
          }}
        >
          <Typography variant="body2" fontWeight="medium">
            {item.stock} left
          </Typography>
        </Box>
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography gutterBottom variant="h6" component="div">
            {item.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {item.description}
          </Typography>
          <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Chip
              label={`${item.price} ${item.currency}`}
              color="primary"
              sx={{ fontWeight: 'medium' }}
            />
            <Button
              variant="contained"
              startIcon={<ShoppingCartIcon />}
              onClick={() => setOpen(true)}
              disabled={item.stock === 0}
            >
              Purchase
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => !loading && setOpen(false)}>
        <DialogTitle>Confirm Purchase</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to purchase {item.name} for {item.price} {item.currency}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handlePurchase}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <ShoppingCartIcon />}
          >
            {loading ? 'Processing...' : 'Confirm Purchase'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 