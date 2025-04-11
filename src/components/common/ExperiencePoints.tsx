import { Box, Typography, SxProps, Theme } from '@mui/material';
import { EmojiEvents as XPIcon } from '@mui/icons-material';

interface ExperiencePointsProps {
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

function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export default function ExperiencePoints({ amount, size = 'medium', sx }: ExperiencePointsProps) {
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
      <XPIcon 
        sx={{ 
          fontSize: iconSize,
          color: '#FFA726'  // Orange color matching the gradient
        }} 
      />
      <Typography
        variant="h6"
        sx={{
          fontSize,
          fontWeight: 600,
          background: 'linear-gradient(45deg, #FFA726, #FB8C00)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1
        }}
      >
        {formatNumber(amount)}
      </Typography>
    </Box>
  );
} 