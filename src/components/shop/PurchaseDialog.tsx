'use client';

import { FC } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
} from '@mui/material';
import { ShoppingCart, LocalOffer } from '@mui/icons-material';

interface PurchaseDialogProps {
  open: boolean;
  item: {
    name: string;
    price: number;
    type: 'digital' | 'physical';
  } | null;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

const PurchaseDialog: FC<PurchaseDialogProps> = ({
  open,
  item,
  loading = false,
  onConfirm,
  onClose,
}) => {
  if (!item) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className="bg-background-paper border-b border-gray-800">
        <div className="flex items-center space-x-2">
          <ShoppingCart />
          <span>Confirm Purchase</span>
        </div>
      </DialogTitle>
      <DialogContent className="bg-background-paper mt-4">
        <div className="space-y-4">
          <Typography variant="h6">{item.name}</Typography>
          <div className="flex items-center space-x-2">
            <LocalOffer className="text-secondary" />
            <Typography>
              <span className="font-medium">{item.price}</span>{' '}
              <span className="text-gray-400">tickets</span>
            </Typography>
          </div>
          <Typography color="textSecondary">
            {item.type === 'digital'
              ? 'This item will be delivered to your wallet immediately after purchase.'
              : 'You will need to provide shipping information after purchase.'}
          </Typography>
        </div>
      </DialogContent>
      <DialogActions className="bg-background-paper border-t border-gray-800 p-4">
        <Button
          onClick={onClose}
          variant="outlined"
          disabled={loading}
          className="border-gray-700"
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          className="bg-secondary hover:bg-secondary-hover"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : undefined}
        >
          {loading ? 'Processing...' : 'Confirm Purchase'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PurchaseDialog; 