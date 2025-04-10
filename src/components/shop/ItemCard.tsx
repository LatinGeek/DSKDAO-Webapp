'use client';

import { FC } from 'react';
import { Card, CardContent, CardMedia, Typography, Button, Chip } from '@mui/material';
import { LocalOffer, Inventory, ShoppingCart } from '@mui/icons-material';

interface ItemCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  type: 'digital' | 'physical';
  stock: number;
  onPurchase: (id: string) => void;
}

const ItemCard: FC<ItemCardProps> = ({
  id,
  name,
  description,
  price,
  image,
  type,
  stock,
  onPurchase,
}) => {
  return (
    <Card className="card-background hover:shadow-xl transition-all duration-300">
      <div className="relative">
        <CardMedia
          component="img"
          height="200"
          image={image}
          alt={name}
          className="h-48 object-cover"
        />
        <Chip
          label={type}
          color={type === 'digital' ? 'primary' : 'secondary'}
          size="small"
          className="absolute top-3 right-3 capitalize bg-background-paper/80 backdrop-blur-sm"
        />
      </div>
      <CardContent className="space-y-4">
        <div>
          <Typography variant="h6" className="font-semibold mb-1 text-white">
            {name}
          </Typography>
          <Typography
            variant="body2"
            className="text-gray-300 line-clamp-2"
            style={{ minHeight: '40px' }}
          >
            {description}
          </Typography>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-background-light">
              <LocalOffer className="text-primary-main" />
            </div>
            <div>
              <Typography variant="h6" className="font-bold text-white">
                {price}
              </Typography>
              <Typography variant="caption" className="text-gray-300">
                tickets
              </Typography>
            </div>
          </div>
          <div className="flex items-center gap-1 text-gray-300">
            <Inventory fontSize="small" />
            <Typography variant="body2">{stock} left</Typography>
          </div>
        </div>

        <Button
          variant="contained"
          fullWidth
          className="button-primary"
          onClick={() => onPurchase(id)}
          disabled={stock === 0}
          startIcon={<ShoppingCart />}
        >
          {stock === 0 ? 'Out of Stock' : 'Purchase Now'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ItemCard; 