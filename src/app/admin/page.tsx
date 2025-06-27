'use client';

import React from 'react';
import { Container, Alert, CircularProgress, Box } from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/enums';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export default function AdminPage() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress size={48} />
        </Box>
      </Container>
    );
  }

  if (!isAuthenticated) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">
          Please sign in to access the admin dashboard.
        </Alert>
      </Container>
    );
  }

  if (!user?.roles?.includes(UserRole.ADMIN)) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Access denied. Admin privileges required.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <AdminDashboard currentUserId={user.id} />
    </Container>
  );
}