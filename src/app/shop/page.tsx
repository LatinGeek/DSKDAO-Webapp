'use client';

import { FC, useState } from 'react';
import { Typography, Card, CardContent } from '@mui/material';
import { ShoppingCart, LocalOffer, Inventory, TrendingUp } from '@mui/icons-material';
import ItemCard from '@/components/shop/ItemCard';
import ShopFilters from '@/components/shop/ShopFilters';
import PurchaseDialog from '@/components/shop/PurchaseDialog';

// Mock data - Replace with actual API calls later
const mockItems = [
  {
    id: '1',
    name: 'Exclusive NFT',
    description: 'Limited edition digital artwork with unique properties',
    price: 500,
    image: 'https://via.placeholder.com/300x200?text=NFT',
    type: 'digital',
    stock: 10,
  },
  {
    id: '2',
    name: 'Custom T-Shirt',
    description: 'High-quality cotton t-shirt with DSKDAO logo',
    price: 300,
    image: 'https://via.placeholder.com/300x200?text=T-Shirt',
    type: 'physical',
    stock: 50,
  },
  {
    id: '3',
    name: 'Governance Token',
    description: 'Token granting voting rights in DSKDAO',
    price: 1000,
    image: 'https://via.placeholder.com/300x200?text=Token',
    type: 'digital',
    stock: 100,
  },
  {
    id: '4',
    name: 'Premium Hoodie',
    description: 'Comfortable hoodie with embroidered design',
    price: 450,
    image: 'https://via.placeholder.com/300x200?text=Hoodie',
    type: 'physical',
    stock: 25,
  },
] as const;

const stats = [
  {
    title: "Today's Sales",
    value: '$12,500',
    change: '+55%',
    icon: <LocalOffer className="text-primary-main" />,
    bgClass: 'from-primary-main/20 to-transparent',
  },
  {
    title: 'Total Items',
    value: '486',
    change: '+8%',
    icon: <Inventory className="text-info-main" />,
    bgClass: 'from-info-main/20 to-transparent',
  },
  {
    title: 'Active Users',
    value: '1,247',
    change: '+14%',
    icon: <ShoppingCart className="text-success-main" />,
    bgClass: 'from-success-main/20 to-transparent',
  },
  {
    title: 'Conversion Rate',
    value: '24.8%',
    change: '+11%',
    icon: <TrendingUp className="text-warning-main" />,
    bgClass: 'from-warning-main/20 to-transparent',
  },
];

const ShopPage: FC = () => {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const maxPrice = Math.max(...mockItems.map(item => item.price));
  const [selectedItem, setSelectedItem] = useState<typeof mockItems[number] | null>(null);
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  const filteredItems = mockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                         item.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = type === 'all' || item.type === type;
    const matchesPrice = item.price >= priceRange[0] && item.price <= priceRange[1];
    return matchesSearch && matchesType && matchesPrice;
  });

  const handlePurchase = (id: string) => {
    const item = mockItems.find(item => item.id === id);
    if (item) setSelectedItem(item);
  };

  const handlePurchaseConfirm = async () => {
    if (!selectedItem) return;
    setPurchaseLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log(`Purchase confirmed for item ${selectedItem.id}`);
    } catch (error) {
      console.error('Purchase failed:', error);
    } finally {
      setPurchaseLoading(false);
      setSelectedItem(null);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-background">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <Typography variant="h4" className="font-bold mb-2 text-white">
            Item Shop
          </Typography>
          <Typography className="text-gray-300">
            Purchase exclusive items using your tickets
          </Typography>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="card-stats-item">
            <CardContent className="relative z-10">
              <Typography className="text-gray-300" gutterBottom>
                {stat.title}
              </Typography>
              <div className="flex items-center justify-between">
                <Typography variant="h4" component="div" className="font-bold text-white">
                  {stat.value}
                </Typography>
                <div className="p-2 rounded-lg bg-background-light">
                  {stat.icon}
                </div>
              </div>
              <Typography
                variant="body2"
                className={`mt-2 ${
                  stat.change.startsWith('+') ? 'text-success-main' : 'text-error-main'
                }`}
              >
                {stat.change} since last month
              </Typography>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-8">
        <ShopFilters
          search={search}
          type={type}
          priceRange={priceRange}
          maxPrice={maxPrice}
          onSearchChange={setSearch}
          onTypeChange={setType}
          onPriceRangeChange={setPriceRange}
        />
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map(item => (
          <ItemCard
            key={item.id}
            {...item}
            onPurchase={handlePurchase}
          />
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <Typography variant="h6" className="text-gray-300">
            No items found matching your criteria
          </Typography>
        </div>
      )}

      <PurchaseDialog
        open={!!selectedItem}
        item={selectedItem}
        loading={purchaseLoading}
        onConfirm={handlePurchaseConfirm}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
};

export default ShopPage; 