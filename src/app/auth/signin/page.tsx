'use client';

import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import { signIn } from 'next-auth/react';
import Image from 'next/image';

export default function SignInPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        background: 'linear-gradient(45deg, #0B1437 30%, #1A237E 90%)',
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%' }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome to DSKDAO
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Sign in with Discord to access the item shop
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={() => signIn('discord', { callbackUrl: '/' })}
            sx={{
              bgcolor: '#5865F2',
              '&:hover': {
                bgcolor: '#4752C4',
              },
              py: 1.5,
              px: 4,
              borderRadius: 2,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Image
              src="/discord-logo.svg"
              alt="Discord"
              width={24}
              height={24}
              style={{ filter: 'brightness(0) invert(1)' }}
            />
            Sign in with Discord
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
} 