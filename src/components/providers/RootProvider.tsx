'use client';

import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from '@/theme';
import MainLayout from '@/components/layout/MainLayout';

export default function RootProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MainLayout>{children}</MainLayout>
    </ThemeProvider>
  );
} 