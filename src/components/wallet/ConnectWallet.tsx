import { Box, Button, Typography } from '@mui/material';
import { AccountBalanceWallet as WalletIcon } from '@mui/icons-material';
import { useAccount, useDisconnect } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';

interface ConnectWalletProps {
  onClose?: () => void;
}

export default function ConnectWallet({ onClose }: ConnectWalletProps) {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();

  const handleDisconnect = () => {
    disconnect();
    if (onClose) onClose();
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <Box sx={{ p: 2 }}>
      {!isConnected ? (
        <Button
          fullWidth
          variant="contained"
          startIcon={<WalletIcon />}
          onClick={openConnectModal}
          sx={{
            bgcolor: 'background.paper',
            color: 'primary.main',
            border: '1px solid',
            borderColor: 'primary.main',
            '&:hover': {
              bgcolor: 'primary.main',
              color: 'white',
            },
          }}
        >
          Connect Wallet
        </Button>
      ) : (
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Connected Wallet
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              fontFamily: 'monospace',
              mb: 2,
              wordBreak: 'break-all'
            }}
          >
            {address && formatAddress(address)}
          </Typography>
          <Button
            fullWidth
            variant="outlined"
            color="error"
            onClick={handleDisconnect}
            size="small"
          >
            Disconnect
          </Button>
        </Box>
      )}
    </Box>
  );
} 