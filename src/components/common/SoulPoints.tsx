import { Box, Typography, SxProps, Theme } from '@mui/material';
import { Stars as SoulPointsIcon } from '@mui/icons-material';

interface SoulPointsProps {
  amount: number;
  size?: 'small' | 'medium' | 'large';
  sx?: SxProps<Theme>;
}

const sizeMap = {
  small: {
    fontSize: '1rem',
    iconSize: 16
  },
  medium: {
    fontSize: '1.25rem',
    iconSize: 20
  },
  large: {
    fontSize: '1.5rem',
    iconSize: 24
  }
};

export default function SoulPoints({ amount, size = 'medium', sx }: SoulPointsProps) {
  const { fontSize, iconSize } = sizeMap[size];

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        ...sx
      }}
    >
      <SoulPointsIcon 
        sx={{ 
          fontSize: iconSize,
          color: 'primary.main'
        }} 
      />
      <Typography
        variant="h6"
        sx={{
          fontSize,
          fontWeight: 600,
          color: 'primary.main',
          lineHeight: 1
        }}
      >
        {amount}
      </Typography>
    </Box>
  );
} 