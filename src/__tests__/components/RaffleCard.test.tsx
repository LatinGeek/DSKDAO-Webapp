import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Raffle } from '@/types/entities/raffle';
import { RaffleStatus } from '@/types/enums';

// Mock useRaffles hook
const mockPurchaseEntries = jest.fn();
jest.mock('@/hooks/useRaffles', () => ({
  useRaffles: () => ({
    purchaseEntries: mockPurchaseEntries,
    loading: false,
  }),
  formatTimeRemaining: (ms: number) => (ms <= 0 ? 'Ended' : '2d 3h 10m'),
  getRaffleStatusColor: (status: string) => (status === 'active' ? 'green' : 'gray'),
  getRaffleStatusLabel: (status: string) => {
    const map: Record<string, string> = {
      active: 'Active',
      ended: 'Ended',
      draft: 'Draft',
      cancelled: 'Cancelled',
    };
    return map[status] ?? 'Unknown';
  },
}));

jest.mock('@/hooks/useEnhancedUser', () => ({
  formatPoints: (pts: number) => `${pts} pts`,
}));

// MUI mocks
jest.mock('@mui/material', () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  Typography: ({ children, variant }: any) => <span data-variant={variant}>{children}</span>,
  Button: ({ children, disabled, onClick }: any) => (
    <button disabled={disabled} onClick={onClick}>
      {children}
    </button>
  ),
  Chip: ({ label }: any) => <span data-testid="chip">{label}</span>,
  LinearProgress: ({ value }: any) => <div data-testid="progress" data-value={value} />,
  Dialog: ({ open, children }: any) => (open ? <div role="dialog">{children}</div> : null),
  DialogTitle: ({ children }: any) => <div>{children}</div>,
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogActions: ({ children }: any) => <div>{children}</div>,
  TextField: ({ label, value, onChange }: any) => (
    <input aria-label={label} value={value} onChange={onChange} />
  ),
  Box: ({ children }: any) => <div>{children}</div>,
}));

import { RaffleCard } from '@/components/raffles/RaffleCard';

const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString();
const pastDate = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString();

const baseRaffle: Raffle = {
  id: 'raffle-1',
  title: 'Epic Sword Raffle',
  description: 'Win an epic sword!',
  prizeDescription: 'Epic Sword NFT',
  prizeValue: 1000,
  ticketPrice: 50,
  maxEntries: 100,
  maxEntriesPerUser: 5,
  status: RaffleStatus.ACTIVE,
  startDate: pastDate,
  endDate: futureDate,
  totalTicketsSold: 30,
  totalParticipants: 15,
  featured: false,
  createdBy: 'admin-1',
  createdAt: pastDate,
  updatedAt: pastDate,
};

describe('RaffleCard (compact variant)', () => {
  it('renders raffle title', () => {
    render(<RaffleCard raffle={baseRaffle} />);
    expect(screen.getByText('Epic Sword Raffle')).toBeInTheDocument();
  });

  it('renders prize description', () => {
    render(<RaffleCard raffle={baseRaffle} />);
    expect(screen.getByText('Epic Sword NFT')).toBeInTheDocument();
  });

  it('renders ticket count and max', () => {
    render(<RaffleCard raffle={baseRaffle} />);
    expect(screen.getByText('30 / 100 tickets sold')).toBeInTheDocument();
  });

  it('renders status chip as Active', () => {
    render(<RaffleCard raffle={baseRaffle} />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('shows user entry count when userId provided and entries exist', () => {
    const entries = [
      {
        id: 'e1',
        raffleId: 'raffle-1',
        userId: 'user-1',
        ticketNumbers: [1, 2],
        purchasePrice: 100,
        purchasedAt: pastDate,
      },
    ];
    render(<RaffleCard raffle={baseRaffle} userId="user-1" userEntries={entries} />);
    expect(screen.getByText(/Your entries: 2/)).toBeInTheDocument();
  });
});

describe('RaffleCard (detailed variant)', () => {
  it('renders raffle title in detailed mode', () => {
    render(<RaffleCard raffle={baseRaffle} variant="detailed" userId="user-1" />);
    expect(screen.getByText('Epic Sword Raffle')).toBeInTheDocument();
  });

  it('shows Buy Entries button when user can purchase', () => {
    render(<RaffleCard raffle={baseRaffle} variant="detailed" userId="user-1" />);
    expect(screen.getByText('Buy Entries')).toBeInTheDocument();
  });

  it('shows disabled button when raffle has ended', () => {
    const endedRaffle: Raffle = {
      ...baseRaffle,
      status: RaffleStatus.ENDED,
      endDate: pastDate,
    };
    render(<RaffleCard raffle={endedRaffle} variant="detailed" userId="user-1" />);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
  });

  it('shows progress bar with correct sold percentage', () => {
    render(<RaffleCard raffle={baseRaffle} variant="detailed" userId="user-1" />);
    const bars = screen.getAllByTestId('progress');
    // soldPercentage = 30 / 100 * 100 = 30
    expect(bars[0]).toHaveAttribute('data-value', '30');
  });
});
