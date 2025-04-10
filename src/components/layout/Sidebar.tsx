'use client';

import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import {
  Home as HomeIcon,
  Store as StoreIcon,
  Inventory as InventoryIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  ShoppingCart as ShoppingCartIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const DRAWER_WIDTH = 280;

const menuItems = [
  { 
    category: 'PAGES',
    items: [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
      { text: 'Profile', icon: <PersonIcon />, path: '/profile' },
      { text: 'Shop', icon: <ShoppingCartIcon />, path: '/shop' },
    ]
  },
  {
    category: 'ACCOUNT',
    items: [
      { text: 'Inventory', icon: <InventoryIcon />, path: '/inventory' },
      { text: 'History', icon: <HistoryIcon />, path: '/history' },
      { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          bgcolor: 'background.paper',
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box 
          sx={{ 
            width: 40, 
            height: 40, 
            bgcolor: 'primary.main',
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>V</Typography>
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          VISION UI PRO
        </Typography>
      </Box>

      <Box sx={{ mt: 2 }}>
        {menuItems.map((section, index) => (
          <Box key={section.category} sx={{ mb: 3 }}>
            <Typography
              variant="caption"
              sx={{
                px: 3,
                py: 1,
                color: 'text.secondary',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              {section.category}
            </Typography>
            <List>
              {section.items.map((item) => (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton
                    component={Link}
                    href={item.path}
                    selected={pathname === item.path}
                    sx={{
                      mx: 2,
                      borderRadius: 1,
                      '&.Mui-selected': {
                        bgcolor: 'primary.main',
                        '&:hover': {
                          bgcolor: 'primary.dark',
                        }
                      }
                    }}
                  >
                    <ListItemIcon sx={{ 
                      minWidth: 40,
                      color: pathname === item.path ? 'white' : 'inherit' 
                    }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text} 
                      sx={{
                        '& .MuiListItemText-primary': {
                          color: pathname === item.path ? 'white' : 'inherit',
                          fontWeight: pathname === item.path ? 600 : 400
                        }
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        ))}
      </Box>
    </Drawer>
  );
} 