'use client';

import { Box, Grid, Typography } from '@mui/material';
import ItemCard from '@/components/shop/ItemCard';
import ShopFilters from '@/components/shop/ShopFilters';
import { useMemo, useState } from 'react';

// Helper function to generate placeholder images
const getPlaceholderImage = (name: string, color: string = '0075FF') => {
  // Using UI Avatars to generate placeholder images
  // Format: square images with item name as text, using our theme's primary color
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${color}&color=fff&size=200&bold=true&format=svg`;
};

const items = [
  {
    id: '1',
    name: 'Premium Membership',
    description: 'Access exclusive content and features',
    price: 500,
    image: getPlaceholderImage('Premium', '6366f1'),
    currency: 'POINTS',
    stock: 999,
  },
  {
    id: '2',
    name: 'Rare Avatar',
    description: 'Limited edition profile picture',
    price: 1000,
    image: getPlaceholderImage('Avatar', '06b6d4'),
    currency: 'POINTS',
    stock: 50,
  },
  {
    id: '3',
    name: 'Custom Role',
    description: 'Create your own Discord role',
    price: 2000,
    image: getPlaceholderImage('Role', 'f59e0b'),
    currency: 'POINTS',
    stock: 10,
  },
  {
    id: '4',
    name: 'Server Boost',
    description: '1 month of server boosting',
    price: 3000,
    image: getPlaceholderImage('Boost', '10b981'),
    currency: 'POINTS',
    stock: 100,
  },
];

export default function ShopPage() {
  const maxPrice = Math.max(...items.map(item => item.price));
  const [filters, setFilters] = useState({
    search: '',
    priceRange: [0, maxPrice] as [number, number],
    sortBy: 'default',
  });

  const filteredItems = useMemo(() => {
    return items
      .filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                            item.description.toLowerCase().includes(filters.search.toLowerCase());
        const matchesPrice = item.price >= filters.priceRange[0] && item.price <= filters.priceRange[1];
        return matchesSearch && matchesPrice;
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case 'price-asc':
            return a.price - b.price;
          case 'price-desc':
            return b.price - a.price;
          case 'stock-asc':
            return a.stock - b.stock;
          case 'stock-desc':
            return b.stock - a.stock;
          default:
            return 0;
        }
      });
  }, [filters]);

  return (
    <Box sx={{ py: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Item Shop
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Browse and purchase items using your points
        </Typography>
      </Box>

      <ShopFilters
        onFiltersChange={setFilters}
        maxPrice={maxPrice}
      />

      {filteredItems.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No items found matching your criteria
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredItems.map((item) => (
            <Grid key={item.id} item xs={12} sm={6} md={4} lg={3}>
              <ItemCard item={item} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
} 