'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  IconButton,
  Tooltip,
  Grid,
  Snackbar,
  Alert,
  Avatar,
  Collapse,
  Divider
} from '@mui/material';
import {
  Edit,
  Delete,
  Add,
  Visibility,
  PersonAdd,
  LocalOffer,
  ExpandMore,
  GamepadIcon,
  ConfirmationNumberIcon,
  SettingsIcon,
  AutoModeIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { UserRole, PointType, ItemCategory, ItemType, RaffleStatus, TransactionType } from '@/types/enums';
import { User } from '@/types/entities/user';
import { Item } from '@/types/item';
import { Raffle } from '@/types/entities/raffle';
import { formatPoints, getRoleColor, getRoleLabel } from '@/hooks/useEnhancedUser';
import { ITEM_CATEGORIES, ITEM_TYPES } from '@/hooks/useShop';
import { DatabaseService, COLLECTIONS } from '@/lib/db';
import { UserService } from '@/services/userService';

interface AdminDashboardProps {
  currentUserId: string;
  className?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// Discord Bot specific interfaces
interface DiscordRaffle {
  id: string;
  title: string;
  prizeTitle: string;
  prizeImageUrl: string;
  endingDateTime: Date;
  maxParticipants: number;
  ticketPrice: number;
  participants: string[];
  ticketsSold: number;
  winnerUserID?: string;
  active: boolean;
  createdAt: Date;
  createdBy: string;
}

interface ArenaGame {
  id: string;
  roundNumber: number;
  startTime: Date;
  endTime: Date;
  participants: string[];
  autoJoinParticipants: string[];
  winner?: string;
  active: boolean;
  ticketReward: number;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUserId,
  className = ''
}) => {
  const [currentTab, setCurrentTab] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [raffles, setRaffles] = useState<DiscordRaffle[]>([]);
  const [arenaGames, setArenaGames] = useState<ArenaGame[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialogs
  const [userDialog, setUserDialog] = useState<{ open: boolean; user?: User; mode: 'edit' | 'create' }>({
    open: false,
    mode: 'create'
  });
  const [itemDialog, setItemDialog] = useState<{ open: boolean; item?: Item; mode: 'edit' | 'create' }>({
    open: false,
    mode: 'create'
  });
  const [raffleDialog, setRaffleDialog] = useState<{ open: boolean; raffle?: DiscordRaffle; mode: 'edit' | 'create' }>({
    open: false,
    mode: 'create'
  });

  // Form states
  const [userForm, setUserForm] = useState({
    displayName: '',
    email: '',
    roles: [UserRole.USER],
    redeemablePoints: 0,
    soulBoundPoints: 0
  });

  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    price: 0,
    amount: 0,
    type: ItemType.DIGITAL,
    category: ItemCategory.COLLECTIBLE,
    active: true,
    featured: false,
    sortOrder: 0,
    tags: '',
    metadata: {}
  });

  const [raffleForm, setRaffleForm] = useState({
    title: '',
    prizeTitle: '',
    prizeImageUrl: '',
    durationHours: 24,
    ticketPrice: 10,
    maxParticipants: 100
  });

  const [ticketAwardForm, setTicketAwardForm] = useState({
    userId: '',
    amount: 0,
    reason: ''
  });

  // Load data based on current tab
  useEffect(() => {
    switch (currentTab) {
      case 0:
        loadUsers();
        break;
      case 1:
        loadItems();
        break;
      case 2:
        loadDiscordBotData();
        break;
      case 3:
        loadAnalytics();
        break;
      case 5:
        loadDiscordBotData();
        break;
    }
  }, [currentTab]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/users');
      const result = await response.json();
      if (result.success) {
        setUsers(result.data.items || []);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    }
    setLoading(false);
  };

  const loadItems = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/items?includeInactive=true');
      const result = await response.json();
      if (result.success) {
        setItems(result.data.items || []);
      }
    } catch (error) {
      console.error('Failed to load items:', error);
    }
    setLoading(false);
  };

  const loadDiscordBotData = async () => {
    try {
      setLoading(true);
      
      // Load active raffles
      const raffleData = await DatabaseService.getMany('raffles', [
        DatabaseService.orderBy('createdAt', 'desc')
      ]);
      setRaffles(raffleData as DiscordRaffle[]);

      // Load recent arena games
      const arenaData = await DatabaseService.getMany('arena_games', [
        DatabaseService.orderBy('startTime', 'desc'),
        DatabaseService.limit(20)
      ]);
      setArenaGames(arenaData as ArenaGame[]);

    } catch (error) {
      console.error('Error loading Discord bot data:', error);
      setSnackbar({ open: true, message: 'Error loading Discord bot data', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    // TODO: Implement analytics loading
    console.log('Loading analytics...');
  };

  // User management functions
  const handleUserAction = async (action: string, userId?: string, data?: any) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          userId,
          data: { ...data, adminUserId: currentUserId }
        })
      });

      const result = await response.json();
      if (result.success) {
        loadUsers();
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('User action failed:', error);
      throw error;
    }
  };

  // Item management functions
  const handleItemSave = async () => {
    try {
      const method = itemDialog.mode === 'create' ? 'POST' : 'PUT';
      const itemData = {
        ...itemForm,
        tags: itemForm.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      };

      if (itemDialog.mode === 'edit' && itemDialog.item) {
        itemData.itemId = itemDialog.item.id;
      }

      const response = await fetch('/api/admin/items', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData)
      });

      const result = await response.json();
      if (result.success) {
        loadItems();
        setItemDialog({ open: false, mode: 'create' });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Item save failed:', error);
    }
  };

  // Raffle management functions
  const handleRaffleAction = async (action: string, raffleId?: string, data?: any) => {
    try {
      const response = await fetch('/api/admin/raffles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          raffleId,
          adminUserId: currentUserId,
          ...data
        })
      });

      const result = await response.json();
      if (result.success) {
        loadDiscordBotData();
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Raffle action failed:', error);
      throw error;
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  // Discord Bot Management Functions
  const handleCreateRaffle = async () => {
    if (!raffleForm.title || !raffleForm.prizeTitle || !raffleForm.durationHours || !raffleForm.ticketPrice || !raffleForm.maxParticipants) {
      setSnackbar({ open: true, message: 'Please fill in all required fields', severity: 'error' });
      return;
    }

    try {
      const endingDateTime = new Date(Date.now() + (raffleForm.durationHours * 60 * 60 * 1000));
      
      const raffleData: Partial<DiscordRaffle> = {
        id: `raffle_${Date.now()}`,
        title: raffleForm.title,
        prizeTitle: raffleForm.prizeTitle,
        prizeImageUrl: raffleForm.prizeImageUrl || '',
        endingDateTime,
        maxParticipants: raffleForm.maxParticipants,
        ticketPrice: raffleForm.ticketPrice,
        participants: [],
        ticketsSold: 0,
        active: true,
        createdAt: new Date(),
        createdBy: 'admin' // Replace with actual admin user ID
      };

      await DatabaseService.create('raffles', raffleData);
      setSnackbar({ open: true, message: 'Raffle created successfully', severity: 'success' });
      setRaffleDialog({ open: false, mode: 'create' });
      resetRaffleForm();
      loadDiscordBotData();
    } catch (error) {
      console.error('Error creating raffle:', error);
      setSnackbar({ open: true, message: 'Error creating raffle', severity: 'error' });
    }
  };

  const handleEndRaffle = async (raffleId: string) => {
    try {
      const raffleDoc = raffles.find(r => r.id === raffleId);
      if (!raffleDoc) return;

      if (raffleDoc.participants.length === 0) {
        // No participants
        await DatabaseService.update('raffles', raffleDoc.id, {
          active: false
        });
        setSnackbar({ open: true, message: 'Raffle ended with no participants', severity: 'info' });
      } else {
        // Pick random winner
        const winnerUserId = raffleDoc.participants[Math.floor(Math.random() * raffleDoc.participants.length)];
        
        await DatabaseService.update('raffles', raffleDoc.id, {
          active: false,
          winnerUserID: winnerUserId
        });
        
        setSnackbar({ open: true, message: `Raffle ended! Winner: ${winnerUserId}`, severity: 'success' });
      }
      
      loadDiscordBotData();
    } catch (error) {
      console.error('Error ending raffle:', error);
      setSnackbar({ open: true, message: 'Error ending raffle', severity: 'error' });
    }
  };

  const handleAwardTickets = async (userId: string, amount: number, reason: string) => {
    try {
      await UserService.updateUserBalance(
        userId,
        PointType.REDEEMABLE,
        amount,
        TransactionType.ADMIN_ADJUSTMENT,
        reason,
        { adminAction: true }
      );
      
      setSnackbar({ open: true, message: `Successfully awarded ${amount} tickets`, severity: 'success' });
      loadUsers();
    } catch (error) {
      console.error('Error awarding tickets:', error);
      setSnackbar({ open: true, message: 'Error awarding tickets', severity: 'error' });
    }
  };

  const resetRaffleForm = () => {
    setRaffleForm({
      title: '',
      prizeTitle: '',
      prizeImageUrl: '',
      durationHours: 24,
      ticketPrice: 10,
      maxParticipants: 100
    });
  };

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' as 'success' | 'error' | 'info' | 'warning' });

  const tabs = [
    { label: 'Users', icon: <PersonAdd /> },
    { label: 'Items', icon: <LocalOffer /> },
    { label: 'Analytics', icon: <AnalyticsIcon /> },
    { label: 'Transactions', icon: <ConfirmationNumberIcon /> },
    { label: 'Settings', icon: <SettingsIcon /> },
    { label: 'Discord Bot', icon: <AutoModeIcon /> }
  ];

  return (
    <Card className={`card-background ${className}`}>
      <CardContent className="p-0">
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={currentTab} onChange={handleTabChange} variant="fullWidth">
            {tabs.map((tab, index) => (
              <Tab key={index} label={tab.label} icon={tab.icon} />
            ))}
          </Tabs>
        </Box>

        {/* Users Tab */}
        <TabPanel value={currentTab} index={0}>
          <div className="flex justify-between items-center mb-4">
            <Typography variant="h6" className="text-white">User Management</Typography>
            <Button
              startIcon={<PersonAdd />}
              variant="contained"
              color="primary"
              onClick={() => setUserDialog({ open: true, mode: 'create' })}
            >
              Add User
            </Button>
          </div>

          <TableContainer component={Paper} className="bg-secondary">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Roles</TableCell>
                  <TableCell>Points</TableCell>
                  <TableCell>Last Active</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <Typography variant="body1">{user.displayName}</Typography>
                        <Typography variant="body2" className="text-gray-400">
                          {user.email}
                        </Typography>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.roles.map((role) => (
                        <Chip
                          key={role}
                          label={getRoleLabel(role)}
                          size="small"
                          className={`mr-1 ${getRoleColor(role)}`}
                        />
                      ))}
                    </TableCell>
                    <TableCell>
                      <div>
                        <Typography variant="body2">
                          💎 {formatPoints(user.redeemablePoints)}
                        </Typography>
                        <Typography variant="body2">
                          ⚡ {formatPoints(user.soulBoundPoints)}
                        </Typography>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.lastActivityAt ? new Date(user.lastActivityAt).toLocaleDateString() : 'Never'}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Edit User">
                        <IconButton
                          onClick={() => {
                            setUserForm({
                              displayName: user.displayName,
                              email: user.email,
                              roles: user.roles,
                              redeemablePoints: user.redeemablePoints,
                              soulBoundPoints: user.soulBoundPoints
                            });
                            setUserDialog({ open: true, user, mode: 'edit' });
                          }}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Items Tab */}
        <TabPanel value={currentTab} index={1}>
          <div className="flex justify-between items-center mb-4">
            <Typography variant="h6" className="text-white">Item Management</Typography>
            <Button
              startIcon={<Add />}
              variant="contained"
              color="primary"
              onClick={() => setItemDialog({ open: true, mode: 'create' })}
            >
              Add Item
            </Button>
          </div>

          <TableContainer component={Paper} className="bg-secondary">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Item</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <Typography variant="body1">{item.name}</Typography>
                        <Typography variant="body2" className="text-gray-400">
                          {item.description}
                        </Typography>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip label={item.category} size="small" />
                    </TableCell>
                    <TableCell>{formatPoints(item.price)}</TableCell>
                    <TableCell>{item.amount}</TableCell>
                    <TableCell>
                      <Chip
                        label={item.active ? 'Active' : 'Inactive'}
                        color={item.active ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Edit Item">
                        <IconButton
                          onClick={() => {
                            setItemForm({
                              name: item.name,
                              description: item.description,
                              price: item.price,
                              amount: item.amount,
                              type: item.type,
                              category: item.category,
                              active: item.active,
                              featured: item.featured,
                              sortOrder: item.sortOrder,
                              tags: item.tags.join(', '),
                              metadata: item.metadata || {}
                            });
                            setItemDialog({ open: true, item, mode: 'edit' });
                          }}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={currentTab} index={2}>
          <Typography variant="h6" className="text-white mb-4">Analytics & Reports</Typography>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-primary/10">
              <CardContent>
                <Typography variant="h6" className="text-primary">Total Users</Typography>
                <Typography variant="h4" className="text-white">{users.length}</Typography>
              </CardContent>
            </Card>
            <Card className="bg-green-500/10">
              <CardContent>
                <Typography variant="h6" className="text-green-400">Active Items</Typography>
                <Typography variant="h4" className="text-white">
                  {items.filter(item => item.active).length}
                </Typography>
              </CardContent>
            </Card>
            <Card className="bg-yellow-500/10">
              <CardContent>
                <Typography variant="h6" className="text-yellow-400">Active Raffles</Typography>
                <Typography variant="h4" className="text-white">
                  {raffles.filter(raffle => raffle.active).length}
                </Typography>
              </CardContent>
            </Card>
            <Card className="bg-purple-500/10">
              <CardContent>
                <Typography variant="h6" className="text-purple-400">Total Revenue</Typography>
                <Typography variant="h4" className="text-white">Coming Soon</Typography>
              </CardContent>
            </Card>
          </div>
        </TabPanel>

        {/* Discord Bot Management Tab */}
        {currentTab === 5 && (
          <Box>
            <Grid container spacing={3}>
              {/* Raffle Management Section */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ConfirmationNumberIcon />
                        Raffle Management
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setRaffleDialog({ open: true, mode: 'create' })}
                      >
                        Create Raffle
                      </Button>
                    </Box>

                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>Prize</TableCell>
                            <TableCell>Entries</TableCell>
                            <TableCell>Price</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Ends</TableCell>
                            <TableCell>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {raffles.map((raffle) => (
                            <TableRow key={raffle.id}>
                              <TableCell>{raffle.title}</TableCell>
                              <TableCell>{raffle.prizeTitle}</TableCell>
                              <TableCell>{raffle.ticketsSold}/{raffle.maxParticipants}</TableCell>
                              <TableCell>{raffle.ticketPrice} tickets</TableCell>
                              <TableCell>
                                <Chip 
                                  label={raffle.active ? 'Active' : (raffle.winnerUserID ? 'Ended' : 'No Winner')}
                                  color={raffle.active ? 'success' : 'default'}
                                />
                              </TableCell>
                              <TableCell>
                                {new Date(raffle.endingDateTime).toLocaleString()}
                              </TableCell>
                              <TableCell>
                                {raffle.active && (
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    color="warning"
                                    onClick={() => handleEndRaffle(raffle.id)}
                                  >
                                    End Raffle
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>

              {/* Arena Games Section */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <GamepadIcon />
                        Arena Games History
                      </Typography>
                    </Box>

                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Round</TableCell>
                            <TableCell>Start Time</TableCell>
                            <TableCell>Participants</TableCell>
                            <TableCell>Winner</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Reward</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {arenaGames.map((game) => (
                            <TableRow key={game.id}>
                              <TableCell>#{game.roundNumber}</TableCell>
                              <TableCell>
                                {new Date(game.startTime).toLocaleString()}
                              </TableCell>
                              <TableCell>
                                {game.participants.length + game.autoJoinParticipants.length}
                                {game.autoJoinParticipants.length > 0 && (
                                  <Chip 
                                    size="small" 
                                    label={`${game.autoJoinParticipants.length} auto-join`}
                                    sx={{ ml: 1 }}
                                  />
                                )}
                              </TableCell>
                              <TableCell>
                                {game.winner ? game.winner : 'No participants'}
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={game.active ? 'Active' : 'Ended'}
                                  color={game.active ? 'success' : 'default'}
                                />
                              </TableCell>
                              <TableCell>{game.ticketReward} tickets</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>

              {/* Quick Actions Section */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Quick Ticket Management
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <TextField
                        fullWidth
                        label="User Discord ID"
                        value={ticketAwardForm.userId}
                        onChange={(e) => setTicketAwardForm({...ticketAwardForm, userId: e.target.value})}
                      />
                      <TextField
                        fullWidth
                        type="number"
                        label="Ticket Amount"
                        value={ticketAwardForm.amount}
                        onChange={(e) => setTicketAwardForm({...ticketAwardForm, amount: parseInt(e.target.value) || 0})}
                      />
                      <TextField
                        fullWidth
                        label="Reason"
                        value={ticketAwardForm.reason}
                        onChange={(e) => setTicketAwardForm({...ticketAwardForm, reason: e.target.value})}
                      />
                      <Button
                        variant="contained"
                        onClick={() => handleAwardTickets(ticketAwardForm.userId, ticketAwardForm.amount, ticketAwardForm.reason)}
                        disabled={!ticketAwardForm.userId || !ticketAwardForm.amount || !ticketAwardForm.reason}
                      >
                        Award Tickets
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Discord Bot Stats */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Discord Bot Statistics
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography>Active Raffles:</Typography>
                        <Typography fontWeight="bold">
                          {raffles.filter(r => r.active).length}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography>Active Arena Games:</Typography>
                        <Typography fontWeight="bold">
                          {arenaGames.filter(g => g.active).length}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography>Total Raffle Entries:</Typography>
                        <Typography fontWeight="bold">
                          {raffles.reduce((sum, r) => sum + r.ticketsSold, 0)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography>Total Arena Participants:</Typography>
                        <Typography fontWeight="bold">
                          {arenaGames.reduce((sum, g) => sum + g.participants.length + g.autoJoinParticipants.length, 0)}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </CardContent>

      {/* User Dialog */}
      <Dialog open={userDialog.open} onClose={() => setUserDialog({ open: false, mode: 'create' })} maxWidth="sm" fullWidth>
        <DialogTitle>{userDialog.mode === 'create' ? 'Add User' : 'Edit User'}</DialogTitle>
        <DialogContent>
          <div className="space-y-4 pt-2">
            <TextField
              label="Display Name"
              value={userForm.displayName}
              onChange={(e) => setUserForm({ ...userForm, displayName: e.target.value })}
              fullWidth
            />
            <TextField
              label="Email"
              value={userForm.email}
              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
              fullWidth
            />
            <TextField
              label="Redeemable Points"
              type="number"
              value={userForm.redeemablePoints}
              onChange={(e) => setUserForm({ ...userForm, redeemablePoints: parseInt(e.target.value) || 0 })}
              fullWidth
            />
            <TextField
              label="Soul-Bound Points"
              type="number"
              value={userForm.soulBoundPoints}
              onChange={(e) => setUserForm({ ...userForm, soulBoundPoints: parseInt(e.target.value) || 0 })}
              fullWidth
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDialog({ open: false, mode: 'create' })}>Cancel</Button>
          <Button onClick={() => console.log('Save user')} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Item Dialog */}
      <Dialog open={itemDialog.open} onClose={() => setItemDialog({ open: false, mode: 'create' })} maxWidth="md" fullWidth>
        <DialogTitle>{itemDialog.mode === 'create' ? 'Add Item' : 'Edit Item'}</DialogTitle>
        <DialogContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <TextField
              label="Name"
              value={itemForm.name}
              onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Price"
              type="number"
              value={itemForm.price}
              onChange={(e) => setItemForm({ ...itemForm, price: parseInt(e.target.value) || 0 })}
              fullWidth
            />
            <TextField
              label="Description"
              value={itemForm.description}
              onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
              className="md:col-span-2"
            />
            <TextField
              label="Amount/Stock"
              type="number"
              value={itemForm.amount}
              onChange={(e) => setItemForm({ ...itemForm, amount: parseInt(e.target.value) || 0 })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={itemForm.category}
                label="Category"
                onChange={(e) => setItemForm({ ...itemForm, category: e.target.value as ItemCategory })}
              >
                {ITEM_CATEGORIES.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>{cat.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={itemForm.type}
                label="Type"
                onChange={(e) => setItemForm({ ...itemForm, type: e.target.value as ItemType })}
              >
                {ITEM_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Sort Order"
              type="number"
              value={itemForm.sortOrder}
              onChange={(e) => setItemForm({ ...itemForm, sortOrder: parseInt(e.target.value) || 0 })}
              fullWidth
            />
            <TextField
              label="Tags (comma separated)"
              value={itemForm.tags}
              onChange={(e) => setItemForm({ ...itemForm, tags: e.target.value })}
              fullWidth
              className="md:col-span-2"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={itemForm.active}
                  onChange={(e) => setItemForm({ ...itemForm, active: e.target.checked })}
                />
              }
              label="Active"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={itemForm.featured}
                  onChange={(e) => setItemForm({ ...itemForm, featured: e.target.checked })}
                />
              }
              label="Featured"
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setItemDialog({ open: false, mode: 'create' })}>Cancel</Button>
          <Button onClick={handleItemSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Raffle Dialog */}
      <Dialog open={raffleDialog.open} onClose={() => setRaffleDialog({ open: false, mode: 'create' })} maxWidth="md" fullWidth>
        <DialogTitle>{raffleDialog.mode === 'create' ? 'Create New Raffle' : 'Edit Raffle'}</DialogTitle>
        <DialogContent>
          <div className="space-y-4 pt-2">
            <TextField
              label="Raffle Title"
              value={raffleForm.title}
              onChange={(e) => setRaffleForm({...raffleForm, title: e.target.value})}
              fullWidth
            />
            <TextField
              label="Prize Description"
              value={raffleForm.prizeTitle}
              onChange={(e) => setRaffleForm({...raffleForm, prizeTitle: e.target.value})}
              fullWidth
            />
            <TextField
              label="Prize Image URL"
              value={raffleForm.prizeImageUrl}
              onChange={(e) => setRaffleForm({...raffleForm, prizeImageUrl: e.target.value})}
              fullWidth
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                type="number"
                label="Duration (hours)"
                value={raffleForm.durationHours}
                onChange={(e) => setRaffleForm({...raffleForm, durationHours: parseInt(e.target.value) || 24})}
                inputProps={{ min: 1, max: 168 }}
              />
              <TextField
                type="number"
                label="Ticket Price"
                value={raffleForm.ticketPrice}
                onChange={(e) => setRaffleForm({...raffleForm, ticketPrice: parseInt(e.target.value) || 10})}
                inputProps={{ min: 1 }}
              />
              <TextField
                type="number"
                label="Max Participants"
                value={raffleForm.maxParticipants}
                onChange={(e) => setRaffleForm({...raffleForm, maxParticipants: parseInt(e.target.value) || 100})}
                inputProps={{ min: 1 }}
              />
            </Box>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRaffleDialog({ open: false, mode: 'create' })}>Cancel</Button>
          <Button onClick={handleCreateRaffle} variant="contained">
            {raffleDialog.mode === 'create' ? 'Create Raffle' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({...snackbar, open: false})}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({...snackbar, open: false})}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default AdminDashboard;