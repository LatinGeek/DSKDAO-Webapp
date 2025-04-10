'use client';

import {
  Box,
  TextField,
  Slider,
  Typography,
  InputAdornment,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useState } from 'react';

interface ShopFiltersProps {
  onFiltersChange: (filters: {
    search: string;
    priceRange: [number, number];
    sortBy: string;
  }) => void;
  maxPrice: number;
}

export default function ShopFilters({ onFiltersChange, maxPrice }: ShopFiltersProps) {
  const [search, setSearch] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPrice]);
  const [sortBy, setSortBy] = useState('default');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearch = event.target.value;
    setSearch(newSearch);
    onFiltersChange({ search: newSearch, priceRange, sortBy });
  };

  const handlePriceRangeChange = (_event: Event, newValue: number | number[]) => {
    const newRange = newValue as [number, number];
    setPriceRange(newRange);
    onFiltersChange({ search, priceRange: newRange, sortBy });
  };

  const handleSortChange = (event: any) => {
    const newSort = event.target.value;
    setSortBy(newSort);
    onFiltersChange({ search, priceRange, sortBy: newSort });
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          <TextField
            fullWidth
            placeholder="Search items..."
            value={search}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ minWidth: 200 }}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select value={sortBy} label="Sort By" onChange={handleSortChange}>
                <MenuItem value="default">Default</MenuItem>
                <MenuItem value="price-asc">Price: Low to High</MenuItem>
                <MenuItem value="price-desc">Price: High to Low</MenuItem>
                <MenuItem value="stock-asc">Stock: Low to High</MenuItem>
                <MenuItem value="stock-desc">Stock: High to Low</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ minWidth: 200 }}>
            <Typography gutterBottom color="text.secondary">
              Price Range (Points)
            </Typography>
            <Slider
              value={priceRange}
              onChange={handlePriceRangeChange}
              valueLabelDisplay="auto"
              min={0}
              max={maxPrice}
              sx={{ mt: 1 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {priceRange[0]} Points
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {priceRange[1]} Points
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
} 