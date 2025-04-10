'use client';

import { Box, Card, CardContent, Grid, Typography, Container } from '@mui/material';
import { ShoppingCart, Battery50 } from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import PurchaseList from '@/components/dashboard/PurchaseList';
import BalanceCard from '@/components/dashboard/BalanceCard';
import StatBaseCard from '@/components/dashboard/StatBaseCard';
import UserRoles from '@/components/dashboard/UserRoles';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        General Statistics
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <BalanceCard 
            balance={user?.balance || 0}
            change="+55%"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <UserRoles />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatBaseCard
            title="Total Sales"
            icon={<ShoppingCart sx={{ color: '#fff' }} />}
            change="+8%"
          >
            <Typography variant="h4" sx={{ mb: 2 }}>
              173,000
            </Typography>
          </StatBaseCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatBaseCard
            title="Battery Health"
            icon={<Battery50 sx={{ color: '#fff' }} />}
            change="-11%"
            progressValue={76}
          >
            <Typography variant="h4" sx={{ mb: 2 }}>
              76%
            </Typography>
          </StatBaseCard>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          My Purchases
        </Typography>
        <Card>
          <CardContent>
            {user?.discordId ? (
              <PurchaseList userId={user.discordId} />
            ) : (
              <Typography color="text.secondary">
                Please connect your Discord account to view your purchases.
              </Typography>
            )}
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
} 