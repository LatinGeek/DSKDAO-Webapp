'use client';

import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Grid,
  Button,
  Divider,
  Chip,
  Stack
} from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import TicketPrice from '@/components/common/TicketPrice';
import { usePurchases } from '@/hooks/usePurchases';

export default function ProfilePage() {
  const { user } = useAuth();
  const { purchases } = usePurchases(user?.discordId || undefined);

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Profile
        </Typography>
        <Card>
          <CardContent>
            <Typography>
              Please sign in to view your profile.
            </Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  const totalSpent = purchases?.reduce((sum, purchase) => sum + purchase.totalPrice, 0) || 0;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Profile
      </Typography>

      <Grid container spacing={3}>
        {/* Main Profile Card */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={3} mb={3}>
                <Avatar
                  src={user.image || undefined}
                  alt={user.displayName || 'User'}
                  sx={{ 
                    width: 80, 
                    height: 80,
                    bgcolor: 'primary.main' // Fallback color when no image
                  }}
                >
                  {!user.image && (user.displayName?.charAt(0) || 'U')}
                </Avatar>
                <Box>
                  <Typography variant="h5" gutterBottom>
                    {user.displayName || 'User'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user.email}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Discord Account
                  </Typography>
                  {user.discordId ? (
                    <Chip
                      label={user.discordUsername || 'Connected'}
                      color="success"
                      variant="outlined"
                    />
                  ) : (
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => {/* TODO: Implement Discord connection */}}
                    >
                      Connect Discord Account
                    </Button>
                  )}
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Balance and Stats Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Balance
              </Typography>
              <Box mb={2}>
                <TicketPrice amount={user.balance || 0} size="large" />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Total Purchases
                  </Typography>
                  <Typography variant="h6">
                    {purchases?.length || 0}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Points Spent
                  </Typography>
                  <TicketPrice amount={totalSpent} />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
} 