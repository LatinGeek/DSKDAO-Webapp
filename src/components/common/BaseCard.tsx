import { Card, CardProps, styled } from '@mui/material';
import { alpha } from '@mui/material/styles';

interface BaseCardProps extends CardProps {
  gradient?: boolean;
  noPadding?: boolean;
  borderIndicator?: boolean;
  borderIndicatorColor?: string;
  hoverEffect?: boolean;
}

const StyledCard = styled(Card, {
  shouldForwardProp: (prop) => 
    !['gradient', 'noPadding', 'borderIndicator', 'borderIndicatorColor', 'hoverEffect'].includes(prop as string),
})<BaseCardProps>(({ theme, gradient, noPadding, borderIndicator, borderIndicatorColor, hoverEffect }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius * 2,
  position: 'relative',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  padding: noPadding ? 0 : theme.spacing(3),
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  
  ...(gradient && {
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: 0,
      borderRadius: 'inherit',
      padding: '1px',
      background: `linear-gradient(127.09deg, ${alpha(theme.palette.primary.main, 0.15)} 19.41%, ${alpha(theme.palette.secondary.main, 0.15)} 76.65%)`,
      WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
      WebkitMaskComposite: 'destination-out',
      maskComposite: 'exclude',
    }
  }),

  ...(borderIndicator && {
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: '4px',
      backgroundColor: borderIndicatorColor || theme.palette.primary.main,
      borderTopLeftRadius: theme.shape.borderRadius * 2,
      borderBottomLeftRadius: theme.shape.borderRadius * 2,
    }
  }),

  ...(hoverEffect && {
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: theme.shadows[4],
    }
  }),

  '& .MuiCardContent-root': {
    padding: 0,
    '&:last-child': {
      paddingBottom: 0,
    },
  },
}));

export default function BaseCard({ children, ...props }: BaseCardProps) {
  return (
    <StyledCard elevation={0} {...props}>
      {children}
    </StyledCard>
  );
} 