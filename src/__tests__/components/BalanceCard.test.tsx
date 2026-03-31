import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock heavy dependencies
jest.mock('@mui/material', () => ({
  Box: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Typography: ({ children, variant, color, sx, ...rest }: any) => <span {...rest}>{children}</span>,
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@mui/icons-material', () => ({
  LocalActivity: () => <span data-testid="ticket-icon" />,
}));

jest.mock('@/components/common/TicketPrice', () => ({
  __esModule: true,
  default: ({ amount, size }: { amount: number; size?: string }) => (
    <span data-testid="ticket-price" data-amount={amount} data-size={size}>
      {amount} tickets
    </span>
  ),
}));

jest.mock('@/components/dashboard/StatBaseCard', () => ({
  __esModule: true,
  default: ({ title, children, change }: { title: string; children: React.ReactNode; change?: string }) => (
    <div data-testid="stat-base-card">
      <span data-testid="card-title">{title}</span>
      {change && <span data-testid="card-change">{change}</span>}
      <div data-testid="card-content">{children}</div>
    </div>
  ),
}));

jest.mock('@/components/common/BaseCard', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import BalanceCard from '@/components/dashboard/BalanceCard';

describe('BalanceCard', () => {
  it('renders with a positive balance', () => {
    render(<BalanceCard balance={500} />);
    expect(screen.getByTestId('card-title')).toHaveTextContent('Current Balance');
    const price = screen.getByTestId('ticket-price');
    expect(price).toHaveAttribute('data-amount', '500');
    expect(price).toHaveAttribute('data-size', 'large');
  });

  it('renders with zero balance', () => {
    render(<BalanceCard balance={0} />);
    const price = screen.getByTestId('ticket-price');
    expect(price).toHaveAttribute('data-amount', '0');
  });

  it('renders without a change value by default', () => {
    render(<BalanceCard balance={100} />);
    expect(screen.queryByTestId('card-change')).not.toBeInTheDocument();
  });

  it('renders a positive change indicator', () => {
    render(<BalanceCard balance={100} change="+50" />);
    expect(screen.getByTestId('card-change')).toHaveTextContent('+50');
  });

  it('renders a negative change indicator', () => {
    render(<BalanceCard balance={50} change="-10" />);
    expect(screen.getByTestId('card-change')).toHaveTextContent('-10');
  });

  it('renders the stat base card wrapper', () => {
    render(<BalanceCard balance={100} />);
    expect(screen.getByTestId('stat-base-card')).toBeInTheDocument();
  });
});
