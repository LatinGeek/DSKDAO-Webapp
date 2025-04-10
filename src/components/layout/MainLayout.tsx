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
        flexDirection: 'column'
      }}>
        <Header />
        <Box sx={{ display: 'flex', flex: 1 }}>
          <Sidebar />
          <Box 
            component="main" 
            sx={{ 
              flex: 1,
              p: 3,
              background: (theme) => theme.palette.customGradient,
              overflowX: 'hidden',
              transition: 'margin 225ms cubic-bezier(0, 0, 0.2, 1) 0ms'
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