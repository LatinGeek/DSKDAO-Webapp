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
  Tooltip
} from '@mui/material';
import { Edit, Delete, Add, Visibility, PersonAdd, LocalOffer } from '@mui/icons-material';
import { UserRole, PointType, ItemCategory, ItemType, RaffleStatus } from '@/types/enums';
import { User } from '@/types/entities/user';
import { Item } from '@/types/item';
import { Raffle } from '@/types/entities/raffle';
import { formatPoints, getRoleColor, getRoleLabel } from '@/hooks/useEnhancedUser';
import { ITEM_CATEGORIES, ITEM_TYPES } from '@/hooks/useShop';

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

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUserId,
  className = ''
}) => {
  const [currentTab, setCurrentTab] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(false);

  // Dialogs
  const [userDialog, setUserDialog] = useState<{ open: boolean; user?: User; mode: 'edit' | 'create' }>({
    open: false,
    mode: 'create'
  });
  const [itemDialog, setItemDialog] = useState<{ open: boolean; item?: Item; mode: 'edit' | 'create' }>({
    open: false,
    mode: 'create'
  });
  const [raffleDialog, setRaffleDialog] = useState<{ open: boolean; raffle?: Raffle; mode: 'edit' | 'create' }>({
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
    description: '',
    prizeDescription: '',
    prizeValue: 0,
    ticketPrice: 0,
    maxEntries: 100,
    maxEntriesPerUser: 5,
    startDate: '',
    endDate: '',
    featured: false
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
        loadRaffles();
        break;
      case 3:
        loadAnalytics();
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

  const loadRaffles = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/raffles?includeEnded=true');
      const result = await response.json();
      if (result.success) {
        setRaffles(result.data || []);
      }
    } catch (error) {
      console.error('Failed to load raffles:', error);
    }
    setLoading(false);
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
        loadRaffles();
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

  return (
    <Card className={`card-background ${className}`}>
      <CardContent className="p-0">
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={currentTab} onChange={handleTabChange} variant="fullWidth">
            <Tab label="Users" />
            <Tab label="Items" />
            <Tab label="Raffles" />
            <Tab label="Analytics" />
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

        {/* Raffles Tab */}
        <TabPanel value={currentTab} index={2}>
          <div className="flex justify-between items-center mb-4">
            <Typography variant="h6" className="text-white">Raffle Management</Typography>
            <Button
              startIcon={<LocalOffer />}
              variant="contained"
              color="primary"
              onClick={() => setRaffleDialog({ open: true, mode: 'create' })}
            >
              Create Raffle
            </Button>
          </div>

          <TableContainer component={Paper} className="bg-secondary">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Raffle</TableCell>
                  <TableCell>Prize</TableCell>
                  <TableCell>Ticket Price</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Participants</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {raffles.map((raffle) => (
                  <TableRow key={raffle.id}>
                    <TableCell>
                      <div>
                        <Typography variant="body1">{raffle.title}</Typography>
                        <Typography variant="body2" className="text-gray-400">
                          {raffle.description}
                        </Typography>
                      </div>
                    </TableCell>
                    <TableCell>{raffle.prizeDescription}</TableCell>
                    <TableCell>{formatPoints(raffle.ticketPrice)}</TableCell>
                    <TableCell>
                      <Chip
                        label={raffle.status}
                        color={raffle.status === RaffleStatus.ACTIVE ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {raffle.totalParticipants} / {raffle.maxEntries}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Raffle">
                        <IconButton>
                          <Visibility />
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
        <TabPanel value={currentTab} index={3}>
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
                  {raffles.filter(raffle => raffle.status === RaffleStatus.ACTIVE).length}
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
    </Card>
  );
};

export default AdminDashboard;