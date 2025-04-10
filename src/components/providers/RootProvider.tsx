'use client';

import { ThemeProvider, CssBaseline } from '@mui/material';
import { SessionProvider } from 'next-auth/react';
import { UserProvider } from '@/contexts/UserContext';
import theme from '@/theme';
import MainLayout from '@/components/layout/MainLayout';
import WagmiProvider from '@/providers/WagmiProvider';

export default function RootProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WagmiProvider>
      <SessionProvider>
        <UserProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <MainLayout>{children}</MainLayout>
          </ThemeProvider>
        </UserProvider>
      </SessionProvider>
    </WagmiProvider>
  );
} 