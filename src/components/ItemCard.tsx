import { FC } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  styled,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { Item } from '@/types/item';
import TicketPrice from '@/components/common/TicketPrice';

interface ItemCardProps {
  item: Item;
  onAddToCart: (itemId: string) => void;
  disabled?: boolean;
}

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'scale(1.02)',
  },
}));

const ItemCard: FC<ItemCardProps> = ({ item, onAddToCart, disabled }) => {
  const { id, name, description, image, price, amount } = item;

  return (
    <StyledCard>
      <CardMedia
        component="img"
        height="200"
        image={image}
        alt={name}
        sx={{ objectFit: 'contain', p: 2, bgcolor: 'background.default' }}
      />
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography gutterBottom variant="h6" component="h2" noWrap>
          {name}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            mb: 2,
          }}
        >
          {description}
        </Typography>
        <Box
          sx={{
            mt: 'auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <TicketPrice amount={price} />
          <Button
            variant="contained"
            startIcon={<ShoppingCartIcon />}
            onClick={() => onAddToCart(id)}
            disabled={disabled || amount === 0}
            size="small"
          >
            {amount === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default ItemCard; 