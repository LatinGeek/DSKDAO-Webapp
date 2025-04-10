'use client';

import { Box } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import { SidebarProvider } from '../../contexts/SidebarContext';
import { DRAWER_WIDTH } from './constants';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Box sx={{ 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: (theme) => theme.palette.customGradient,
        overflow: 'hidden',
      }}>
        <Header />
        <Box sx={{ display: 'flex', flex: 1 }}>
          <Sidebar />
          <Box 
            component="main" 
            sx={{ 
              flex: 1,
              p: { xs: 2, sm: 3, md: 4 },
              overflowX: 'hidden',
              overflowY: 'auto',
              transition: 'all 0.3s ease-in-out',
              backdropFilter: 'blur(12px)',
              backgroundColor: 'rgba(17, 28, 68, 0.35)',
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
            }}
          >
            <Box sx={{ minHeight: '64px' }} /> {/* Toolbar spacer */}
            {children}
          </Box>
        </Box>
      </Box>
    </SidebarProvider>
  );
} 