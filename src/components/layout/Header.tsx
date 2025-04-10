'use client';

import { AppBar, Box, IconButton, InputAdornment, TextField, Toolbar, Typography } from '@mui/material';
import { Menu as MenuIcon, Search as SearchIcon, Settings as SettingsIcon, NotificationsNone as NotificationsIcon } from '@mui/icons-material';

export default function Header() {
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

        <IconButton color="inherit">
          <NotificationsIcon />
        </IconButton>
        
        <IconButton color="inherit">
          <SettingsIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
} 