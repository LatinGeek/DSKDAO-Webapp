'use client';

import { FC } from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { People, ShoppingCart, Casino, EmojiEvents } from '@mui/icons-material';

const stats = [
  { title: 'Active Users', value: '5,227', change: '+55%', icon: People },
  { title: 'Items Sold', value: '3,461', change: '+90%', icon: ShoppingCart },
  { title: 'Games Played', value: '12,234', change: '+42%', icon: Casino },
  { title: 'Raffles Won', value: '891', change: '+23%', icon: EmojiEvents },
];

const HomePage: FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-400 mt-2">Welcome back to DSKDAO Item Shop</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(({ title, value, change, icon: Icon }) => (
          <Card key={title} className="bg-background-paper">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h6" component="div" className="font-medium">
                    {value}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    {title}
                  </Typography>
                  <Typography
                    variant="caption"
                    className={change.startsWith('+') ? 'text-green-500' : 'text-red-500'}
                  >
                    {change}
                  </Typography>
                </div>
                <div className="p-3 bg-background rounded-lg">
                  <Icon className="text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HomePage; 