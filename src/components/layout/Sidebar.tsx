'use client';

import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import {
  Home as HomeIcon,
  Store as StoreIcon,
  Person as PersonIcon,
  History as HistoryIcon,
  Games as GamesIcon,
  Casino as PlinkoIcon,
  Stadium as ArenaIcon,
  ConfirmationNumber as RaffleIcon,
  EmojiEvents as LeaderboardIcon,
  AdminPanelSettings as AdminIcon,
  Info as AboutIcon,
  Dashboard as DashboardIcon,
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSidebar } from '../../contexts/SidebarContext';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/enums';
import { DRAWER_WIDTH } from './constants';

const menuItems = [
  { 
    category: 'MAIN',
    items: [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
      { text: 'Profile', icon: <PersonIcon />, path: '/profile' },
      { text: 'Shop', icon: <ShoppingCartIcon />, path: '/shop' },
    ]
  },
  {
    category: 'GAMES',
    items: [
      { text: 'Games Hub', icon: <GamesIcon />, path: '/games' },
      { text: 'Plinko', icon: <PlinkoIcon />, path: '/games/plinko' },
      { text: 'Arena', icon: <ArenaIcon />, path: '/games/arena' },
    ]
  },
  {
    category: 'COMMUNITY',
    items: [
      { text: 'Leaderboards', icon: <LeaderboardIcon />, path: '/leaderboards' },
      { text: 'Raffles', icon: <RaffleIcon />, path: '/raffles' },
    ]
  },
  {
    category: 'ACCOUNT',
    items: [
      { text: 'Transaction History', icon: <HistoryIcon />, path: '/history' },
    ]
  },
  {
    category: 'INFO',
    items: [
      { text: 'About', icon: <AboutIcon />, path: '/about' },
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, toggleSidebar, isMobile } = useSidebar();
  const { user, isAuthenticated } = useAuth();

  // Filter menu items based on user permissions
  const getFilteredMenuItems = () => {
    let filteredItems = [...menuItems];
    
    // Add admin section if user is admin
    if (isAuthenticated && user?.roles?.includes(UserRole.ADMIN)) {
      filteredItems.push({
        category: 'ADMIN',
        items: [
          { text: 'Admin Dashboard', icon: <AdminIcon />, path: '/admin' },
        ]
      });
    }
    
    return filteredItems;
  };

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
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>D</Typography>
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          DSKDAO
        </Typography>
      </Box>

      <Box sx={{ mt: 2 }}>
        {getFilteredMenuItems().map((section) => (
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
                    selected={pathname === item.path || 
                      (item.path === '/games' && pathname.startsWith('/games')) ||
                      (item.path === '/games/plinko' && pathname === '/games/plinko') ||
                      (item.path === '/games/arena' && pathname === '/games/arena')
                    }
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
                      color: (pathname === item.path || 
                        (item.path === '/games' && pathname.startsWith('/games')) ||
                        (item.path === '/games/plinko' && pathname === '/games/plinko') ||
                        (item.path === '/games/arena' && pathname === '/games/arena')
                      ) ? 'white' : 'inherit' 
                    }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text} 
                      sx={{
                        '& .MuiListItemText-primary': {
                          color: (pathname === item.path || 
                            (item.path === '/games' && pathname.startsWith('/games')) ||
                            (item.path === '/games/plinko' && pathname === '/games/plinko') ||
                            (item.path === '/games/arena' && pathname === '/games/arena')
                          ) ? 'white' : 'inherit',
                          fontWeight: (pathname === item.path || 
                            (item.path === '/games' && pathname.startsWith('/games')) ||
                            (item.path === '/games/plinko' && pathname === '/games/plinko') ||
                            (item.path === '/games/arena' && pathname === '/games/arena')
                          ) ? 600 : 400
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

      {/* User Status Footer */}
      {isAuthenticated && user && (
        <Box sx={{ 
          position: 'absolute', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          p: 2, 
          borderTop: 1, 
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                {user.displayName?.charAt(0).toUpperCase() || 'U'}
              </Typography>
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" sx={{ 
                fontWeight: 600, 
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {user.displayName || 'User'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user.balance || 0} tickets
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
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
          position: 'relative',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
} 