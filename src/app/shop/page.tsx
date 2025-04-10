'use client';

import { Box, Container, Grid, Typography, Alert, CircularProgress } from '@mui/material';
import { useItems } from '@/hooks/useItems';
import ItemCard from '@/components/ItemCard';
import { purchaseItem } from '@/services/purchaseService';
import { useState } from 'react';
import { Item } from '@/types/item';

// Helper function to generate placeholder images
const getPlaceholderImage = (name: string, color: string = '0075FF') => {
  // Using UI Avatars to generate placeholder images
  // Format: square images with item name as text, using our theme's primary color
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${color}&color=fff&size=200&bold=true&format=svg`;
};

const items = [
  {
    id: '1',
    name: 'Premium Membership',
    description: 'Access exclusive content and features',
    price: 500,
    image: getPlaceholderImage('Premium', '6366f1'),
    currency: 'POINTS',
    stock: 999,
  },
  {
    id: '2',
    name: 'Rare Avatar',
    description: 'Limited edition profile picture',
    price: 1000,
    image: getPlaceholderImage('Avatar', '06b6d4'),
    currency: 'POINTS',
    stock: 50,
  },
  {
    id: '3',
    name: 'Custom Role',
    description: 'Create your own Discord role',
    price: 2000,
    image: getPlaceholderImage('Role', 'f59e0b'),
    currency: 'POINTS',
    stock: 10,
  },
  {
    id: '4',
    name: 'Server Boost',
    description: '1 month of server boosting',
    price: 3000,
    image: getPlaceholderImage('Boost', '10b981'),
    currency: 'POINTS',
    stock: 100,
  },
];

export default function ShopPage() {
  const { items, loading, error } = useItems();
  const [purchaseStatus, setPurchaseStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const handlePurchase = async (item: Item) => {
    try {
      // TODO: Replace with actual user ID from auth
      const userId = 'test-user';
      
      await purchaseItem({
        itemId: item.id,
        quantity: 1,
        userId
      });

      setPurchaseStatus({
        type: 'success',
        message: `Successfully purchased ${item.name}!`
      });
    } catch (error) {
      setPurchaseStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to purchase item'
      });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        DSKDAO Item Shop
      </Typography>

      {purchaseStatus && (
        <Alert 
          severity={purchaseStatus.type}
          onClose={() => setPurchaseStatus(null)}
          sx={{ mb: 2 }}
        >
          {purchaseStatus.message}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {items.map((item) => (
            <Grid item key={item.id} xs={12} sm={6} md={4}>
              <ItemCard
                item={item}
                onPurchase={() => handlePurchase(item)}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
} 