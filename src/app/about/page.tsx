'use client';

import React from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Grid,
  Button,
  Avatar,
  Divider,
  Chip
} from '@mui/material';
import {
  Games as GamesIcon,
  Store as StoreIcon,
  ConfirmationNumber as RaffleIcon,
  AutoMode as BotIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Public as CommunityIcon,
  TrendingUp as GrowthIcon,
  EmojiEvents as RewardIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export default function AboutPage() {
  const router = useRouter();

  const features = [
    {
      icon: <GamesIcon sx={{ fontSize: 40, color: '#FFD700' }} />,
      title: 'Interactive Games',
      description: 'Play Plinko, participate in Arena battles, and enjoy physics-based gaming experiences.',
      color: '#FFD700'
    },
    {
      icon: <BotIcon sx={{ fontSize: 40, color: '#7289DA' }} />,
      title: 'Discord Integration',
      description: 'Earn tickets through Discord activities and seamlessly manage everything from our bot.',
      color: '#7289DA'
    },
    {
      icon: <RaffleIcon sx={{ fontSize: 40, color: '#FF6B6B' }} />,
      title: 'Raffle System',
      description: 'Enter exciting raffles for exclusive prizes and win amazing rewards.',
      color: '#FF6B6B'
    },
    {
      icon: <StoreIcon sx={{ fontSize: 40, color: '#4CAF50' }} />,
      title: 'Item Shop',
      description: 'Purchase digital and physical items using your earned tickets.',
      color: '#4CAF50'
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40, color: '#9C27B0' }} />,
      title: 'Secure & Fair',
      description: 'Built with enterprise-grade security and transparent, auditable systems.',
      color: '#9C27B0'
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40, color: '#FF9800' }} />,
      title: 'Real-time Updates',
      description: 'Live synchronization between Discord activities and web platform.',
      color: '#FF9800'
    }
  ];

  const stats = [
    { label: 'Active Users', value: '1,000+', color: '#4CAF50' },
    { label: 'Tickets Distributed', value: '50,000+', color: '#FFD700' },
    { label: 'Games Played', value: '10,000+', color: '#FF6B6B' },
    { label: 'Raffles Completed', value: '100+', color: '#9C27B0' }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Welcome to DSKDAO
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph sx={{ maxWidth: 800, mx: 'auto' }}>
          A cutting-edge Web3 gaming platform that bridges Discord communities with interactive 
          experiences, rewards, and a thriving digital economy.
        </Typography>
        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button 
            variant="contained" 
            size="large"
            onClick={() => router.push('/games')}
            sx={{ 
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA000 100%)',
              color: 'black',
              px: 4,
              py: 1.5
            }}
          >
            Start Playing
          </Button>
          <Button 
            variant="outlined" 
            size="large"
            onClick={() => router.push('/shop')}
            sx={{ px: 4, py: 1.5 }}
          >
            Explore Shop
          </Button>
        </Box>
      </Box>

      {/* Stats Section */}
      <Card sx={{ mb: 6, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <CardContent sx={{ py: 4 }}>
          <Typography variant="h4" sx={{ color: 'white', textAlign: 'center', mb: 4, fontWeight: 'bold' }}>
            Platform Statistics
          </Typography>
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ color: stat.color, fontWeight: 'bold' }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'white' }}>
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Features Section */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h3" component="h2" gutterBottom sx={{ textAlign: 'center', mb: 6 }}>
          Platform Features
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Card sx={{ 
                height: '100%',
                background: `linear-gradient(135deg, ${feature.color}20 0%, ${feature.color}10 100%)`,
                border: `2px solid ${feature.color}40`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 32px ${feature.color}40`
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {feature.icon}
                    <Typography variant="h5" sx={{ ml: 2, fontWeight: 'bold' }}>
                      {feature.title}
                    </Typography>
                  </Box>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* How It Works Section */}
      <Card sx={{ mb: 6 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h3" component="h2" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
            How It Works
          </Typography>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar sx={{ 
                  width: 80, 
                  height: 80, 
                  mx: 'auto', 
                  mb: 2,
                  bgcolor: '#7289DA',
                  fontSize: '2rem'
                }}>
                  1
                </Avatar>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Join Discord
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Connect with our Discord community and start earning tickets through activities like messaging, reactions, and voice chat.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar sx={{ 
                  width: 80, 
                  height: 80, 
                  mx: 'auto', 
                  mb: 2,
                  bgcolor: '#FFD700',
                  color: 'black',
                  fontSize: '2rem'
                }}>
                  2
                </Avatar>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Earn Tickets
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Participate in games, join arena battles, and engage with the community to earn tickets and climb the leaderboards.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar sx={{ 
                  width: 80, 
                  height: 80, 
                  mx: 'auto', 
                  mb: 2,
                  bgcolor: '#4CAF50',
                  fontSize: '2rem'
                }}>
                  3
                </Avatar>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Spend & Win
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Use your tickets in our shop, enter raffles for exclusive prizes, or bet them in games for bigger rewards.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Technology Section */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h3" component="h2" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
          Built with Modern Technology
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CommunityIcon color="primary" />
                  Discord Integration
                </Typography>
                <Typography variant="body2" paragraph>
                  Seamless integration with Discord.js v14, providing real-time synchronization between 
                  your Discord activities and platform rewards.
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Chip label="Discord.js v14" size="small" />
                  <Chip label="Real-time Sync" size="small" />
                  <Chip label="Bot Commands" size="small" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <GrowthIcon color="primary" />
                  Web3 Ready
                </Typography>
                <Typography variant="body2" paragraph>
                  Built with scalability in mind, featuring modern React architecture and 
                  preparation for blockchain integration.
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Chip label="Next.js 14" size="small" />
                  <Chip label="Material-UI" size="small" />
                  <Chip label="TypeScript" size="small" />
                  <Chip label="Firebase" size="small" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Call to Action */}
      <Card sx={{ 
        background: 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)',
        color: 'white',
        textAlign: 'center'
      }}>
        <CardContent sx={{ py: 6 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            Ready to Join the Community?
          </Typography>
          <Typography variant="h6" paragraph sx={{ opacity: 0.9 }}>
            Start earning tickets, playing games, and winning prizes today!
          </Typography>
          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              size="large"
              onClick={() => router.push('/auth/signin')}
              sx={{ 
                bgcolor: 'white',
                color: 'black',
                px: 4,
                py: 1.5,
                '&:hover': {
                  bgcolor: 'grey.100'
                }
              }}
            >
              Sign In with Discord
            </Button>
            <Button 
              variant="outlined" 
              size="large"
              onClick={() => router.push('/leaderboards')}
              sx={{ 
                borderColor: 'white',
                color: 'white',
                px: 4,
                py: 1.5,
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              View Leaderboards
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}