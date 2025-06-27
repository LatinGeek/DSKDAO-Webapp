import React, { useState } from 'react';
import {
  BottomNavigation,
  BottomNavigationAction,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Home,
  Store,
  SportsEsports,
  LocalOffer,
  Person,
  Menu as MenuIcon,
  Notifications,
  AccountBalanceWallet,
  Settings,
  ExitToApp,
  AdminPanelSettings
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { useEnhancedUser } from '@/hooks/useEnhancedUser';
import { UserRole } from '@/types/enums';

interface MobileNavigationProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  currentPath,
  onNavigate
}) => {
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();
  
  const { user, balance, hasRole, signOut } = useEnhancedUser();

  // Bottom navigation items
  const bottomNavItems = [
    { label: 'Home', value: '/', icon: <Home /> },
    { label: 'Shop', value: '/shop', icon: <Store /> },
    { label: 'Games', value: '/games', icon: <SportsEsports /> },
    { label: 'Raffles', value: '/raffles', icon: <LocalOffer /> },
    { label: 'Profile', value: '/profile', icon: <Person /> }
  ];

  // Side menu items
  const sideMenuItems = [
    { label: 'Dashboard', path: '/', icon: <Home />, public: true },
    { label: 'Shop', path: '/shop', icon: <Store />, public: true },
    { label: 'Games', path: '/games', icon: <SportsEsports />, public: true },
    { label: 'Raffles', path: '/raffles', icon: <LocalOffer />, public: true },
    { label: 'Wallet', path: '/wallet', icon: <AccountBalanceWallet />, requireAuth: true },
    { label: 'Transactions', path: '/transactions', icon: <AccountBalanceWallet />, requireAuth: true },
    { label: 'Settings', path: '/settings', icon: <Settings />, requireAuth: true }
  ];

  const adminMenuItems = [
    { label: 'Admin Dashboard', path: '/admin', icon: <AdminPanelSettings /> },
    { label: 'User Management', path: '/admin/users', icon: <Person /> },
    { label: 'Content Management', path: '/admin/content', icon: <Store /> }
  ];

  const handleBottomNavChange = (event: React.SyntheticEvent, newValue: string) => {
    onNavigate(newValue);
    router.push(newValue);
  };

  const handleSideMenuClick = (path: string) => {
    setSideMenuOpen(false);
    onNavigate(path);
    router.push(path);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleSignOut = async () => {
    handleUserMenuClose();
    await signOut();
    router.push('/');
  };

  const getNavValue = (): string => {
    // Map current path to bottom nav value
    if (currentPath.startsWith('/shop')) return '/shop';
    if (currentPath.startsWith('/games')) return '/games';
    if (currentPath.startsWith('/raffles')) return '/raffles';
    if (currentPath.startsWith('/profile')) return '/profile';
    return '/';
  };

  return (
    <>
      {/* Mobile App Bar */}
      {isMobile && (
        <AppBar position="sticky" className="bg-secondary border-b border-primary/20">
          <Toolbar className="flex justify-between">
            {/* Menu Button */}
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setSideMenuOpen(true)}
              className="text-white"
            >
              <MenuIcon />
            </IconButton>

            {/* Logo/Title */}
            <Typography variant="h6" className="text-white font-bold">
              DSKDAO
            </Typography>

            {/* User Section */}
            <div className="flex items-center space-x-2">
              {/* Notifications */}
              <IconButton color="inherit">
                <Badge badgeContent={3} color="error">
                  <Notifications className="text-white" />
                </Badge>
              </IconButton>

              {/* User Avatar */}
              {user ? (
                <IconButton onClick={handleUserMenuOpen} className="p-1">
                  <Avatar
                    src={user.avatar}
                    className="w-8 h-8"
                    alt={user.displayName}
                  >
                    {user.displayName?.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
              ) : (
                <IconButton onClick={() => router.push('/auth/signin')} color="inherit">
                  <Person className="text-white" />
                </IconButton>
              )}
            </div>
          </Toolbar>

          {/* Balance Display for Mobile */}
          {user && balance && (
            <div className="bg-primary/10 px-4 py-2 flex justify-center space-x-4">
              <div className="text-center">
                <Typography variant="caption" className="text-gray-400">
                  Redeemable
                </Typography>
                <Typography variant="body2" className="text-white font-semibold">
                  💎 {balance.redeemablePoints.toLocaleString()}
                </Typography>
              </div>
              <div className="text-center">
                <Typography variant="caption" className="text-gray-400">
                  Soul-Bound
                </Typography>
                <Typography variant="body2" className="text-white font-semibold">
                  ⚡ {balance.soulBoundPoints.toLocaleString()}
                </Typography>
              </div>
            </div>
          )}
        </AppBar>
      )}

      {/* Bottom Navigation for Mobile */}
      {isMobile && (
        <BottomNavigation
          value={getNavValue()}
          onChange={handleBottomNavChange}
          className="fixed bottom-0 left-0 right-0 z-50 bg-secondary border-t border-primary/20"
          showLabels
        >
          {bottomNavItems.map((item) => (
            <BottomNavigationAction
              key={item.value}
              label={item.label}
              value={item.value}
              icon={item.icon}
              className="text-gray-400 data-[selected]:text-primary"
            />
          ))}
        </BottomNavigation>
      )}

      {/* Side Drawer Menu */}
      <Drawer
        anchor="left"
        open={sideMenuOpen}
        onClose={() => setSideMenuOpen(false)}
        className="z-50"
      >
        <div className="w-80 bg-secondary text-white h-full">
          {/* Header */}
          <div className="p-4 bg-primary/10 border-b border-primary/20">
            <div className="flex items-center space-x-3">
              {user ? (
                <>
                  <Avatar src={user.avatar} className="w-12 h-12">
                    {user.displayName?.charAt(0).toUpperCase()}
                  </Avatar>
                  <div>
                    <Typography variant="h6" className="text-white">
                      {user.displayName}
                    </Typography>
                    <Typography variant="body2" className="text-gray-400">
                      {user.email}
                    </Typography>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Avatar className="w-12 h-12 bg-gray-600">
                    <Person />
                  </Avatar>
                  <Typography variant="h6" className="text-white">
                    Guest User
                  </Typography>
                </div>
              )}
            </div>

            {/* Balance in Drawer */}
            {user && balance && (
              <div className="mt-3 pt-3 border-t border-gray-600">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <Typography variant="caption" className="text-gray-400">
                      Redeemable
                    </Typography>
                    <Typography variant="body1" className="text-white font-semibold">
                      💎 {balance.redeemablePoints.toLocaleString()}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="caption" className="text-gray-400">
                      Soul-Bound
                    </Typography>
                    <Typography variant="body1" className="text-white font-semibold">
                      ⚡ {balance.soulBoundPoints.toLocaleString()}
                    </Typography>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Menu Items */}
          <List className="flex-1">
            {/* Main Menu Items */}
            {sideMenuItems.map((item) => {
              if (item.requireAuth && !user) return null;
              
              return (
                <ListItem
                  key={item.path}
                  button
                  onClick={() => handleSideMenuClick(item.path)}
                  className={`hover:bg-primary/10 ${
                    currentPath === item.path ? 'bg-primary/20 border-r-2 border-primary' : ''
                  }`}
                >
                  <ListItemIcon className="text-gray-400 min-w-[40px]">
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.label}
                    className="text-white"
                  />
                </ListItem>
              );
            })}

            {/* Admin Section */}
            {user && hasRole(UserRole.ADMIN) && (
              <>
                <Divider className="my-2 bg-gray-600" />
                <ListItem className="py-1">
                  <Typography variant="subtitle2" className="text-gray-400 font-semibold">
                    Administration
                  </Typography>
                </ListItem>
                {adminMenuItems.map((item) => (
                  <ListItem
                    key={item.path}
                    button
                    onClick={() => handleSideMenuClick(item.path)}
                    className={`hover:bg-primary/10 ${
                      currentPath === item.path ? 'bg-primary/20 border-r-2 border-primary' : ''
                    }`}
                  >
                    <ListItemIcon className="text-gray-400 min-w-[40px]">
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.label}
                      className="text-white"
                    />
                  </ListItem>
                ))}
              </>
            )}
          </List>

          {/* Footer Actions */}
          {user && (
            <div className="p-4 border-t border-gray-600">
              <ListItem
                button
                onClick={handleSignOut}
                className="hover:bg-red-500/10 rounded-lg"
              >
                <ListItemIcon className="text-red-400 min-w-[40px]">
                  <ExitToApp />
                </ListItemIcon>
                <ListItemText 
                  primary="Sign Out"
                  className="text-red-400"
                />
              </ListItem>
            </div>
          )}
        </div>
      </Drawer>

      {/* User Menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {user ? (
          [
            <MenuItem key="profile" onClick={() => { handleUserMenuClose(); router.push('/profile'); }}>
              <Person className="mr-2" />
              Profile
            </MenuItem>,
            <MenuItem key="wallet" onClick={() => { handleUserMenuClose(); router.push('/wallet'); }}>
              <AccountBalanceWallet className="mr-2" />
              Wallet
            </MenuItem>,
            <MenuItem key="settings" onClick={() => { handleUserMenuClose(); router.push('/settings'); }}>
              <Settings className="mr-2" />
              Settings
            </MenuItem>,
            <Divider key="divider" />,
            <MenuItem key="signout" onClick={handleSignOut}>
              <ExitToApp className="mr-2" />
              Sign Out
            </MenuItem>
          ]
        ) : (
          <MenuItem onClick={() => { handleUserMenuClose(); router.push('/auth/signin'); }}>
            <Person className="mr-2" />
            Sign In
          </MenuItem>
        )}
      </Menu>

      {/* Padding for bottom navigation */}
      {isMobile && <div className="h-14" />}
    </>
  );
};

export default MobileNavigation;