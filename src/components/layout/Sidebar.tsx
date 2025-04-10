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
import { useSidebar } from '../../contexts/SidebarContext';
import { DRAWER_WIDTH } from './constants';

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
  const { isSidebarOpen, toggleSidebar, isMobile } = useSidebar();

  const drawerContent = (
    <>
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
          DSKDAO
        </Typography>
      </Box>

      <Box sx={{ mt: 2 }}>
        {menuItems.map((section) => (
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
                    onClick={isMobile ? toggleSidebar : undefined}
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
    </>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={isSidebarOpen}
        onClose={toggleSidebar}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            bgcolor: 'background.paper',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="persistent"
      open={isSidebarOpen}
      sx={{
        width: isSidebarOpen ? DRAWER_WIDTH : 0,
        flexShrink: 0,
        display: { xs: 'none', sm: 'block' },
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          bgcolor: 'background.paper',
          borderRight: '1px solid',
          borderColor: 'divider',
          transform: isSidebarOpen ? 'none' : 'translateX(-100%)',
          transition: 'transform 225ms cubic-bezier(0, 0, 0.2, 1) 0ms',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
} 