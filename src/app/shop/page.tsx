'use client';

import { Box, Container, Grid, Typography, Alert, CircularProgress } from '@mui/material';
import { useItems } from '@/hooks/useItems';
import ItemCard from '@/components/ItemCard';
import { purchaseItem } from '@/services/purchaseService';
import { UserService, InsufficientBalanceError, UserNotFoundError } from '@/services/userService';
import { PointType, TransactionType } from '@/types/enums';
import { useState, useEffect } from 'react';
import { Item } from '@/types/item';
import { useAuth } from '@/hooks/useAuth';
import PurchasePopup from '@/components/common/PurchasePopup';

export default function ShopPage() {
  const { items, loading, error } = useItems();
  const { user } = useAuth();
  const [purchaseStatus, setPurchaseStatus] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
    itemName: string;
    price?: number;
  } | null>(null);

  // Auto-hide the popup after 5 seconds
  useEffect(() => {
    if (purchaseStatus?.show) {
      const timer = setTimeout(() => {
        setPurchaseStatus(prev => prev ? { ...prev, show: false } : null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [purchaseStatus?.show]);

  const handlePurchase = async (item: Item) => {
    if (!user?.discordId) {
      setPurchaseStatus({
        show: true,
        type: 'error',
        itemName: item.name,
        message: 'Please connect your Discord account to make purchases'
      });
      return;
    }

    try {
      // Update user balance first using Discord ID
      await UserService.updateUserBalance(
        user.discordId, 
        PointType.REDEEMABLE, 
        -item.price, 
        TransactionType.PURCHASE, 
        `Purchase: ${item.name}`,
        { itemId: item.id, itemName: item.name }
      );

      // If balance update succeeds, proceed with purchase
      await purchaseItem({
        itemId: item.id,
        quantity: 1,
        userId: user.discordId
      });

      setPurchaseStatus({
        show: true,
        type: 'success',
        itemName: item.name,
        price: item.price,
        message: 'Your purchase was successful!'
      });
    } catch (error) {
      // Handle specific error types
      if (error instanceof InsufficientBalanceError) {
        setPurchaseStatus({
          show: true,
          type: 'error',
          itemName: item.name,
          message: 'Insufficient balance to complete this purchase'
        });
      } else if (error instanceof UserNotFoundError) {
        setPurchaseStatus({
          show: true,
          type: 'error',
          itemName: item.name,
          message: 'Your Discord account is not registered in our system. Please link your account first.'
        });
      } else {
        setPurchaseStatus({
          show: true,
          type: 'error',
          itemName: item.name,
          message: error instanceof Error ? error.message : 'Failed to purchase item'
        });
      }
    }
  };

  const getAuthAlert = () => {
    if (!user) {
      return (
        <Alert severity="info" sx={{ mb: 2 }}>
          Please login to make purchases
        </Alert>
      );
    }
    if (!user.discordId) {
      return (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Please connect your Discord account to make purchases
        </Alert>
      );
    }
    return null;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        DSKDAO Item Shop
      </Typography>

      {getAuthAlert()}

      {purchaseStatus && (
        <PurchasePopup
          show={purchaseStatus.show}
          type={purchaseStatus.type}
          itemName={purchaseStatus.itemName}
          price={purchaseStatus.price}
          message={purchaseStatus.message}
        />
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
                onAddToCart={() => handlePurchase(item)}
                disabled={!user?.discordId}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
} 