import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  IconButton,
  Tooltip
} from '@mui/material';
import { ShoppingCart, Info, Star, Inventory } from '@mui/icons-material';
import { Item } from '@/types/item';
import { ItemCategory, ItemType, LootboxRarity } from '@/types/enums';
import { formatPoints } from '@/hooks/useEnhancedUser';

interface EnhancedShopItemCardProps {
  item: Item;
  onPurchase: (itemId: string, quantity: number) => Promise<void>;
  userBalance?: number;
  loading?: boolean;
  variant?: 'card' | 'list' | 'featured';
  showDetails?: boolean;
  className?: string;
}

export const EnhancedShopItemCard: React.FC<EnhancedShopItemCardProps> = ({
  item,
  onPurchase,
  userBalance = 0,
  loading = false,
  variant = 'card',
  showDetails = false,
  className = ''
}) => {
  const [purchaseDialog, setPurchaseDialog] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [detailsDialog, setDetailsDialog] = useState(false);

  const canAfford = userBalance >= item.price * quantity;
  const inStock = item.amount > 0;
  const maxQuantity = Math.min(10, item.amount); // Limit to 10 or available stock

  const handlePurchaseClick = () => {
    if (maxQuantity === 1) {
      // Direct purchase for single items
      handleConfirmPurchase();
    } else {
      // Show quantity dialog for multiple items
      setPurchaseDialog(true);
    }
  };

  const handleConfirmPurchase = async () => {
    try {
      await onPurchase(item.id, quantity);
      setPurchaseDialog(false);
      setQuantity(1);
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  };

  const getCategoryIcon = (category: ItemCategory) => {
    switch (category) {
      case ItemCategory.LOOTBOX: return '📦';
      case ItemCategory.COLLECTIBLE: return '🎨';
      case ItemCategory.UTILITY: return '🔧';
      case ItemCategory.COSMETIC: return '👕';
      case ItemCategory.ACCESS: return '🎫';
      case ItemCategory.RAFFLE_TICKET: return '🎟️';
      default: return '📁';
    }
  };

  const getRarityColor = (rarity?: LootboxRarity) => {
    if (!rarity) return 'default';
    switch (rarity) {
      case LootboxRarity.COMMON: return 'bg-gray-500';
      case LootboxRarity.UNCOMMON: return 'bg-green-500';
      case LootboxRarity.RARE: return 'bg-blue-500';
      case LootboxRarity.EPIC: return 'bg-purple-500';
      case LootboxRarity.LEGENDARY: return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const totalPrice = item.price * quantity;

  if (variant === 'list') {
    return (
      <Card className={`card-background ${className}`}>
        <CardContent className="flex items-center space-x-4 p-4">
          {/* Item Image/Icon */}
          <div className="w-16 h-16 bg-secondary/20 rounded-lg flex items-center justify-center text-2xl">
            {item.image ? (
              <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
            ) : (
              getCategoryIcon(item.category)
            )}
          </div>

          {/* Item Info */}
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <Typography variant="h6" className="text-white">
                {item.name}
              </Typography>
              {item.featured && <Star className="text-yellow-400 text-sm" />}
              {item.rarity && (
                <Chip
                  label={item.rarity}
                  size="small"
                  className={`${getRarityColor(item.rarity)} text-white`}
                />
              )}
            </div>
            <Typography variant="body2" className="text-gray-400 mb-2">
              {item.description}
            </Typography>
            <div className="flex items-center space-x-2">
              <Chip label={item.category} size="small" variant="outlined" />
              <Chip label={item.type} size="small" variant="outlined" />
            </div>
          </div>

          {/* Price and Actions */}
          <div className="text-right">
            <Typography variant="h6" className="text-primary mb-2">
              {formatPoints(item.price)}
            </Typography>
            <Typography variant="body2" className="text-gray-400 mb-2">
              Stock: {item.amount}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={handlePurchaseClick}
              disabled={!inStock || !canAfford || loading}
              startIcon={<ShoppingCart />}
            >
              {!inStock ? 'Out of Stock' : !canAfford ? 'Cannot Afford' : 'Buy'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'featured') {
    return (
      <Card className={`card-background border-2 border-yellow-400/50 ${className}`}>
        <div className="relative">
          {item.image && (
            <CardMedia
              component="img"
              height="200"
              image={item.image}
              alt={item.name}
              className="h-48 object-cover"
            />
          )}
          <div className="absolute top-2 left-2">
            <Chip label="Featured" className="bg-yellow-400 text-black font-bold" />
          </div>
          <div className="absolute top-2 right-2">
            <Tooltip title="View Details">
              <IconButton onClick={() => setDetailsDialog(true)} className="bg-black/50">
                <Info className="text-white" />
              </IconButton>
            </Tooltip>
          </div>
        </div>

        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <Typography variant="h5" className="text-white">
              {item.name}
            </Typography>
            {item.rarity && (
              <Chip
                label={item.rarity}
                size="small"
                className={`${getRarityColor(item.rarity)} text-white`}
              />
            )}
          </div>

          <Typography variant="body1" className="text-gray-300 mb-3">
            {item.description}
          </Typography>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Chip label={item.category} size="small" />
              <Chip label={item.type} size="small" />
            </div>
            <Typography variant="body2" className="text-gray-400">
              <Inventory className="text-sm mr-1" />
              {item.amount} left
            </Typography>
          </div>

          <div className="flex items-center justify-between">
            <Typography variant="h5" className="text-primary">
              {formatPoints(item.price)}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handlePurchaseClick}
              disabled={!inStock || !canAfford || loading}
              startIcon={<ShoppingCart />}
            >
              {!inStock ? 'Sold Out' : 'Purchase'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default card variant
  return (
    <Card className={`card-background hover:bg-secondary/10 transition-colors ${className}`}>
      <div className="relative">
        {item.image ? (
          <CardMedia
            component="img"
            height="160"
            image={item.image}
            alt={item.name}
            className="h-40 object-cover"
          />
        ) : (
          <div className="h-40 bg-secondary/20 flex items-center justify-center text-4xl">
            {getCategoryIcon(item.category)}
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-2 left-2 space-y-1">
          {item.featured && (
            <Chip label="Featured" size="small" className="bg-yellow-400 text-black" />
          )}
          {item.category === ItemCategory.LOOTBOX && (
            <Chip label="Lootbox" size="small" className="bg-purple-500 text-white" />
          )}
        </div>

        <div className="absolute top-2 right-2">
          <Badge badgeContent={item.amount} color="primary" max={99}>
            <Inventory className="text-white" />
          </Badge>
        </div>

        {/* Rarity indicator */}
        {item.rarity && (
          <div className={`absolute bottom-0 left-0 right-0 h-2 ${getRarityColor(item.rarity)}`} />
        )}
      </div>

      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <Typography variant="h6" className="text-white line-clamp-1">
            {item.name}
          </Typography>
          {showDetails && (
            <IconButton size="small" onClick={() => setDetailsDialog(true)}>
              <Info className="text-gray-400" />
            </IconButton>
          )}
        </div>

        <Typography variant="body2" className="text-gray-400 mb-3 line-clamp-2">
          {item.description}
        </Typography>

        <div className="flex items-center space-x-1 mb-3">
          <Chip label={item.category} size="small" variant="outlined" />
          <Chip label={item.type} size="small" variant="outlined" />
        </div>

        <div className="flex items-center justify-between">
          <Typography variant="h6" className="text-primary">
            {formatPoints(item.price)}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handlePurchaseClick}
            disabled={!inStock || !canAfford || loading}
            startIcon={<ShoppingCart />}
          >
            Buy
          </Button>
        </div>

        {!canAfford && inStock && (
          <Typography variant="caption" className="text-red-400 mt-1 block">
            Insufficient balance
          </Typography>
        )}
      </CardContent>

      {/* Purchase Dialog */}
      <Dialog open={purchaseDialog} onClose={() => setPurchaseDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Purchase {item.name}</DialogTitle>
        <DialogContent>
          <Box className="space-y-4 pt-2">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-secondary/20 rounded-lg flex items-center justify-center text-2xl">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  getCategoryIcon(item.category)
                )}
              </div>
              <div>
                <Typography variant="h6">{item.name}</Typography>
                <Typography variant="body2" className="text-gray-400">
                  {item.description}
                </Typography>
              </div>
            </div>

            <TextField
              label="Quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Math.min(maxQuantity, parseInt(e.target.value) || 1)))}
              inputProps={{ min: 1, max: maxQuantity }}
              fullWidth
              helperText={`Max: ${maxQuantity} | Available: ${item.amount}`}
            />

            <div className="bg-gray-100 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <Typography variant="body2">Unit Price:</Typography>
                <Typography variant="body2">{formatPoints(item.price)}</Typography>
              </div>
              <div className="flex justify-between items-center">
                <Typography variant="body2">Quantity:</Typography>
                <Typography variant="body2">{quantity}</Typography>
              </div>
              <div className="border-t border-gray-300 mt-2 pt-2">
                <div className="flex justify-between items-center">
                  <Typography variant="h6">Total:</Typography>
                  <Typography variant="h6" className="text-primary">
                    {formatPoints(totalPrice)}
                  </Typography>
                </div>
              </div>
              <div className="flex justify-between items-center mt-1">
                <Typography variant="body2" className="text-gray-600">Your Balance:</Typography>
                <Typography variant="body2" className={userBalance >= totalPrice ? 'text-green-600' : 'text-red-600'}>
                  {formatPoints(userBalance)}
                </Typography>
              </div>
            </div>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPurchaseDialog(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmPurchase}
            variant="contained"
            color="primary"
            disabled={!canAfford || loading || quantity <= 0}
          >
            {loading ? 'Processing...' : `Purchase for ${formatPoints(totalPrice)}`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailsDialog} onClose={() => setDetailsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{item.name}</DialogTitle>
        <DialogContent>
          <div className="space-y-4">
            {item.image && (
              <img src={item.image} alt={item.name} className="w-full h-64 object-cover rounded-lg" />
            )}
            
            <Typography variant="body1">{item.description}</Typography>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Typography variant="subtitle2" className="text-gray-600">Category</Typography>
                <Typography variant="body1">{item.category}</Typography>
              </div>
              <div>
                <Typography variant="subtitle2" className="text-gray-600">Type</Typography>
                <Typography variant="body1">{item.type}</Typography>
              </div>
              <div>
                <Typography variant="subtitle2" className="text-gray-600">Price</Typography>
                <Typography variant="body1" className="text-primary">{formatPoints(item.price)}</Typography>
              </div>
              <div>
                <Typography variant="subtitle2" className="text-gray-600">Available</Typography>
                <Typography variant="body1">{item.amount}</Typography>
              </div>
            </div>

            {item.tags && item.tags.length > 0 && (
              <div>
                <Typography variant="subtitle2" className="text-gray-600 mb-2">Tags</Typography>
                <div className="flex flex-wrap gap-1">
                  {item.tags.map((tag) => (
                    <Chip key={tag} label={tag} size="small" variant="outlined" />
                  ))}
                </div>
              </div>
            )}

            {item.metadata && Object.keys(item.metadata).length > 0 && (
              <div>
                <Typography variant="subtitle2" className="text-gray-600 mb-2">Additional Information</Typography>
                <div className="bg-gray-50 rounded-lg p-3">
                  {Object.entries(item.metadata).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <Typography variant="body2" className="capitalize">{key}:</Typography>
                      <Typography variant="body2">{String(value)}</Typography>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog(false)}>Close</Button>
          <Button
            onClick={() => {
              setDetailsDialog(false);
              handlePurchaseClick();
            }}
            variant="contained"
            color="primary"
            disabled={!inStock || !canAfford}
            startIcon={<ShoppingCart />}
          >
            Purchase
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default EnhancedShopItemCard;