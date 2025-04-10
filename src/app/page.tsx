'use client';

import { Box, Card, CardContent, Grid, Typography, LinearProgress } from '@mui/material';
import { AttachMoney, Person, ShoppingCart, Battery50 } from '@mui/icons-material';
import TaskList from '@/components/dashboard/TaskList';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  positive?: boolean;
}

const StatCard = ({ title, value, change, icon, positive = true }: StatCardProps) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
        </Box>
        <Typography
          variant="body2"
          sx={{
            color: positive ? 'success.main' : 'error.main',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {change}
        </Typography>
      </Box>
      <Typography variant="h4" sx={{ mb: 2 }}>
        {value}
      </Typography>
      <LinearProgress
        variant="determinate"
        value={70}
        sx={{
          height: 6,
          borderRadius: 3,
          bgcolor: 'background.default',
          '& .MuiLinearProgress-bar': {
            borderRadius: 3,
          },
        }}
      />
    </CardContent>
  </Card>
);

export default function DashboardPage() {
  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        General Statistics
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Today's Money"
            value="$53,000"
            change="+55%"
            icon={<AttachMoney />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Today's Users"
            value="2,300"
            change="+5%"
            icon={<Person />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Sales"
            value="$173,000"
            change="+8%"
            icon={<ShoppingCart />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Battery Health"
            value="76%"
            change="-11%"
            icon={<Battery50 />}
            positive={false}
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Tasks
        </Typography>
        <Card>
          <CardContent>
            <TaskList />
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
} 