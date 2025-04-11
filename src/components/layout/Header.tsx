'use client';

import {
  AppBar,
  Box,
  IconButton,
  InputAdornment,
  TextField,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Chip,
  Stack,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
  NotificationsNone as NotificationsIcon,
  Login as LoginIcon,
  LocalActivity as TicketIcon,
  AccountBalanceWallet as WalletIcon,
} from '@mui/icons-material';
import DiscordIcon from '@/components/icons/DiscordIcon';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useUser } from '@/contexts/UserContext';
import { useState } from 'react';
import { useSidebar } from '../../contexts/SidebarContext';
import { DRAWER_WIDTH } from './constants';
import ConnectWallet from '../wallet/ConnectWallet';

export default function Header() {
  const { data: session } = useSession();
  const { userData } = useUser();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { toggleSidebar, isSidebarOpen } = useSidebar();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    handleMenuClose();
    await signOut();
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.04))',
        width: { sm: isSidebarOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%' },
        ml: { sm: isSidebarOpen ? `${DRAWER_WIDTH}px` : 0 },
        bgcolor: 'background',
        boxShadow: 'none',
        borderBottom: '1px solid',
        borderColor: 'divider',
        transition: 'margin 225ms cubic-bezier(0, 0, 0.2, 1) 0ms, width 225ms cubic-bezier(0, 0, 0.2, 1) 0ms'
      }}
    >
      <Toolbar sx={{ gap: 2 }}>
        <IconButton
          color="inherit"
          aria-label="toggle drawer"
          edge="start"
          onClick={toggleSidebar}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700,
              color: 'text.primary',
              display: { xs: 'none', sm: 'block' }
            }}
          >
          </Typography>
        </Box>

        <Box sx={{ flex: 1 }} />



        <Box sx={{ flex: 1 }} />

        {session ? (
          <>
            <Chip
              icon={<TicketIcon />}
              label={`${userData?.balance || 0} Tickets`}
              color="primary"
              sx={{
                fontWeight: 600,
                px: 1,
                '& .MuiChip-icon': {
                  color: 'inherit',
                },
              }}
            />

            <IconButton color="inherit">
              <NotificationsIcon />
            </IconButton>
            
            <IconButton color="inherit">
              <SettingsIcon />
            </IconButton>

            <IconButton
              onClick={handleMenuOpen}
              sx={{
                ml: 1,
                '&:hover': {
                  opacity: 0.8,
                },
              }}
            >
              <Avatar
                src={session.user?.image || undefined}
                alt={session.user?.name || 'User'}
                sx={{ width: 32, height: 32 }}
              />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              onClick={(e) => e.stopPropagation()}
              slotProps={{
                paper: {
                  elevation: 0,
                  sx: {
                    mt: 1,
                    minWidth: 280,
                    overflow: 'visible',
                  },
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      src={session.user?.image || undefined}
                      alt={session.user?.name || 'User'}
                      sx={{ width: 40, height: 40 }}
                    />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {session.user?.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {session.user?.email}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />

                  <Stack spacing={0.5}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DiscordIcon sx={{ color: '#5865F2', fontSize: 20 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                        ID: {userData?.discordUserId}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TicketIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {userData?.balance || 0} Tickets Available
                      </Typography>
                    </Box>
                  </Stack>

                  <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />
                  
                  <ConnectWallet onClose={handleMenuClose} />

                  <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />

                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    onClick={handleSignOut}
                    size="small"
                  >
                    Sign Out
                  </Button>
                </Stack>
              </Box>
            </Menu>
          </>
        ) : (
          <Button
            variant="contained"
            startIcon={<LoginIcon />}
            onClick={() => signIn('discord')}
          >
            Sign in
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
} 