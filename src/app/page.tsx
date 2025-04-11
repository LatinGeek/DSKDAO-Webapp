'use client';

import { Box, Card, CardContent, Grid, Typography, Container, CircularProgress } from '@mui/material';
import { Stars, Whatshot, EmojiEvents } from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import PurchaseList from '@/components/dashboard/PurchaseList';
import BalanceCard from '@/components/dashboard/BalanceCard';
import StatBaseCard from '@/components/dashboard/StatBaseCard';
import UserRoles from '@/components/dashboard/UserRoles';
import SoulPoints from '@/components/common/SoulPoints';
import ExperiencePoints from '@/components/common/ExperiencePoints';
import NFTGallery from '@/components/dashboard/NFTGallery';
import { useExperiencePoints } from '@/hooks/useExperiencePoints';

export default function DashboardPage() {
  const { user } = useAuth();
  const { total: xp, daily: dailyXP, loading: xpLoading, error: xpError } = useExperiencePoints();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        General Statistics
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <BalanceCard 
            balance={user?.balance || 0}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <UserRoles />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatBaseCard
            title="Soul-Bound Points"
            icon={<Whatshot sx={{ color: '#fff' }} />}
          >
            <SoulPoints amount={1250} size="large" />
          </StatBaseCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatBaseCard
            title="Experience Points"
            icon={<EmojiEvents sx={{ color: '#fff' }} />}
          >
            {xpLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight={56}>
                <CircularProgress size={24} />
              </Box>
            ) : xpError ? (
              <Typography color="error" sx={{ fontSize: '0.875rem' }}>
                {xpError}
              </Typography>
            ) : (
              <ExperiencePoints amount={xp} size="large" />
            )}
          </StatBaseCard>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Your NFT Collection
        </Typography>
        <NFTGallery />
      </Box>

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