'use client';

import { ThemeProvider, CssBaseline } from '@mui/material';
import { SessionProvider } from 'next-auth/react';
import { UserProvider } from '@/contexts/UserContext';
import theme from '@/theme';
import MainLayout from '@/components/layout/MainLayout';
import WagmiProvider from '@/providers/WagmiProvider';
import ErrorBoundary from '@/components/common/ErrorBoundary';

export default function RootProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary>
      <WagmiProvider>
        <SessionProvider>
          <UserProvider>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <MainLayout>
                <ErrorBoundary>{children}</ErrorBoundary>
              </MainLayout>
            </ThemeProvider>
          </UserProvider>
        </SessionProvider>
      </WagmiProvider>
    </ErrorBoundary>
  );
} 