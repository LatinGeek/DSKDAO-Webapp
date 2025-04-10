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
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
  NotificationsNone as NotificationsIcon,
  Login as LoginIcon,
  LocalActivity as TicketIcon,
} from '@mui/icons-material';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useUser } from '@/contexts/UserContext';
import { useState } from 'react';

export default function Header() {
  const { data: session } = useSession();
  const { userData } = useUser();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = () => {
    handleMenuClose();
    signOut();
  };

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        bgcolor: 'background.paper',
        boxShadow: 'none',
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Toolbar sx={{ gap: 2 }}>
        <IconButton
          size="medium"
          edge="start"
          color="inherit"
          aria-label="menu"
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
            DSKDAO
          </Typography>
        </Box>

        <Box sx={{ flex: 1 }} />

        <TextField
          placeholder="Type here..."
          size="small"
          sx={{
            maxWidth: 400,
            width: '100%',
            '& .MuiOutlinedInput-root': {
              bgcolor: 'background.default',
              borderRadius: 2,
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
        />

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
              onClick={handleMenuClose}
              PaperProps={{
                sx: {
                  mt: 1,
                  minWidth: 200,
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle1" noWrap>
                  {session.user?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {session.user?.email}
                </Typography>
                <Typography variant="body2" color="primary" sx={{ mt: 0.5, fontWeight: 600 }}>
                  Balance: {userData?.balance || 0} Tickets
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={handleSignOut}>Sign out</MenuItem>
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