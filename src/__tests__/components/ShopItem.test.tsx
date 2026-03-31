import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Item } from '@/types/item';
import { ItemCategory, ItemType } from '@/types/enums';

jest.mock('@/hooks/useEnhancedUser', () => ({
  formatPoints: (pts: number) => `${pts} pts`,
}));

// MUI mocks
jest.mock('@mui/material', () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardMedia: ({ image, alt }: any) => <img src={image} alt={alt} />,
  Typography: ({ children, variant }: any) => <span data-variant={variant}>{children}</span>,
  Button: ({ children, disabled, onClick }: any) => (
    <button disabled={disabled} onClick={onClick}>
      {children}
    </button>
  ),
  Chip: ({ label }: any) => <span data-testid="chip">{label}</span>,
  Badge: ({ children, badgeContent }: any) => (
    <div>
      {children}
      <span data-testid="badge">{badgeContent}</span>
    </div>
  ),
  Dialog: ({ open, children }: any) => (open ? <div role="dialog">{children}</div> : null),
  DialogTitle: ({ children }: any) => <div>{children}</div>,
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogActions: ({ children }: any) => <div>{children}</div>,
  TextField: ({ label, value, onChange }: any) => (
    <input aria-label={label} value={value} onChange={onChange} />
  ),
  Box: ({ children }: any) => <div>{children}</div>,
  IconButton: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
  Tooltip: ({ children }: any) => <>{children}</>,
}));

jest.mock('@mui/icons-material', () => ({
  ShoppingCart: () => <span>cart</span>,
  Info: () => <span>info</span>,
  Star: () => <span>star</span>,
  Inventory: () => <span>inventory</span>,
}));

import { EnhancedShopItemCard } from '@/components/shop/EnhancedShopItemCard';

const baseItem: Item = {
  id: 'item-1',
  name: 'Dragon Egg',
  description: 'A rare dragon egg',
  image: 'https://example.com/dragon.png',
  price: 200,
  amount: 10,
  active: true,
  type: ItemType.DIGITAL,
  category: ItemCategory.COLLECTIBLE,
  featured: false,
  sortOrder: 1,
  tags: [],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('EnhancedShopItemCard', () => {
  const mockPurchase = jest.fn();

  beforeEach(() => {
    mockPurchase.mockReset();
  });

  it('renders item name', () => {
    render(<EnhancedShopItemCard item={baseItem} onPurchase={mockPurchase} userBalance={500} />);
    expect(screen.getByText('Dragon Egg')).toBeInTheDocument();
  });

  it('renders item description', () => {
    render(<EnhancedShopItemCard item={baseItem} onPurchase={mockPurchase} userBalance={500} />);
    expect(screen.getByText('A rare dragon egg')).toBeInTheDocument();
  });

  it('renders item price', () => {
    render(<EnhancedShopItemCard item={baseItem} onPurchase={mockPurchase} userBalance={500} />);
    expect(screen.getByText('200 pts')).toBeInTheDocument();
  });

  it('renders item image with alt text', () => {
    render(<EnhancedShopItemCard item={baseItem} onPurchase={mockPurchase} userBalance={500} />);
    const img = screen.getByAltText('Dragon Egg');
    expect(img).toHaveAttribute('src', 'https://example.com/dragon.png');
  });

  it('buy button is enabled when user can afford item and item is in stock', () => {
    render(<EnhancedShopItemCard item={baseItem} onPurchase={mockPurchase} userBalance={500} />);
    const buyButton = screen.getByRole('button', { name: /buy/i });
    expect(buyButton).not.toBeDisabled();
  });

  it('shows insufficient balance message when user cannot afford item', () => {
    render(<EnhancedShopItemCard item={baseItem} onPurchase={mockPurchase} userBalance={50} />);
    expect(screen.getByText('Insufficient balance')).toBeInTheDocument();
  });

  it('buy button is disabled when user cannot afford item', () => {
    render(<EnhancedShopItemCard item={baseItem} onPurchase={mockPurchase} userBalance={50} />);
    const buyButton = screen.getByRole('button', { name: /buy/i });
    expect(buyButton).toBeDisabled();
  });

  it('shows Out of Stock label when amount is 0', () => {
    const outOfStockItem = { ...baseItem, amount: 0 };
    render(<EnhancedShopItemCard item={outOfStockItem} onPurchase={mockPurchase} userBalance={500} />);
    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
  });

  it('buy button is disabled when out of stock', () => {
    const outOfStockItem = { ...baseItem, amount: 0 };
    render(<EnhancedShopItemCard item={outOfStockItem} onPurchase={mockPurchase} userBalance={500} />);
    const buyButton = screen.getByRole('button', { name: /out of stock/i });
    expect(buyButton).toBeDisabled();
  });

  it('calls onPurchase directly for single-stock items', async () => {
    const singleItem = { ...baseItem, amount: 1 };
    mockPurchase.mockResolvedValue(undefined);
    render(<EnhancedShopItemCard item={singleItem} onPurchase={mockPurchase} userBalance={500} />);
    fireEvent.click(screen.getByRole('button', { name: /buy/i }));
    await waitFor(() => {
      expect(mockPurchase).toHaveBeenCalledWith('item-1', 1);
    });
  });

  it('shows purchase dialog for multi-stock items', () => {
    render(<EnhancedShopItemCard item={baseItem} onPurchase={mockPurchase} userBalance={500} />);
    fireEvent.click(screen.getByRole('button', { name: /buy/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('buy button is disabled when loading', () => {
    render(<EnhancedShopItemCard item={baseItem} onPurchase={mockPurchase} userBalance={500} loading={true} />);
    const buyButton = screen.getByRole('button', { name: /buy/i });
    expect(buyButton).toBeDisabled();
  });
});
