'use client';

import { FC } from 'react';
import {
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Typography,
  SelectChangeEvent,
  InputAdornment,
} from '@mui/material';
import { Search, FilterList } from '@mui/icons-material';

interface ShopFiltersProps {
  search: string;
  type: string;
  priceRange: [number, number];
  maxPrice: number;
  onSearchChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onPriceRangeChange: (value: [number, number]) => void;
}

const ShopFilters: FC<ShopFiltersProps> = ({
  search,
  type,
  priceRange,
  maxPrice,
  onSearchChange,
  onTypeChange,
  onPriceRangeChange,
}) => {
  return (
    <Paper className="card-background p-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Search Filter */}
        <div className="md:col-span-5">
          <TextField
            fullWidth
            placeholder="Search items..."
            variant="outlined"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="input-primary"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search className="text-gray-300" />
                </InputAdornment>
              ),
              className: 'bg-background-light rounded-lg text-white',
            }}
          />
        </div>

        {/* Type Filter */}
        <div className="md:col-span-3">
          <FormControl fullWidth variant="outlined" className="input-primary">
            <InputLabel className="text-gray-300">
              <div className="flex items-center gap-2">
                <FilterList />
                Item Type
              </div>
            </InputLabel>
            <Select
              value={type}
              label="Item Type"
              onChange={(e: SelectChangeEvent) => onTypeChange(e.target.value)}
              className="bg-background-light rounded-lg text-white"
            >
              <MenuItem value="all">All Items</MenuItem>
              <MenuItem value="digital">Digital</MenuItem>
              <MenuItem value="physical">Physical</MenuItem>
            </Select>
          </FormControl>
        </div>

        {/* Price Range Filter */}
        <div className="md:col-span-4">
          <Paper className="card-gradient p-4">
            <Typography className="text-gray-300 flex items-center gap-2 mb-4">
              <FilterList fontSize="small" />
              Price Range
            </Typography>
            <Slider
              value={priceRange}
              onChange={(_, value) => onPriceRangeChange(value as [number, number])}
              valueLabelDisplay="auto"
              max={maxPrice}
              className="text-primary-main"
              valueLabelFormat={(value) => `${value} tickets`}
            />
            <div className="flex justify-between mt-2">
              <Typography variant="body2" className="text-gray-300">
                {priceRange[0]} tickets
              </Typography>
              <Typography variant="body2" className="text-gray-300">
                {priceRange[1]} tickets
              </Typography>
            </div>
          </Paper>
        </div>
      </div>
    </Paper>
  );
};

export default ShopFilters; 