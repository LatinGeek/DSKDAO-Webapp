import { LocalActivity as TicketIcon } from '@mui/icons-material';
import TicketPrice from '@/components/common/TicketPrice';
import StatBaseCard from './StatBaseCard';

interface BalanceCardProps {
  balance: number;
  change?: string;
}

export default function BalanceCard({ balance, change }: BalanceCardProps) {
  return (
    <StatBaseCard
      title="Current Balance"
      icon={<TicketIcon sx={{ color: '#fff' }} />}
      change={change}
      progressValue={-1}
    >
      <TicketPrice amount={balance} size="large" />
    </StatBaseCard>
  );
} 