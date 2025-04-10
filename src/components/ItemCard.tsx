import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
  CardActions
} from '@mui/material';
import { Item } from '@/types/item';
import { formatPrice } from '@/utils/format';
import { generatePlaceholderImage } from '@/utils/images';

interface ItemCardProps {
  item: Item;
  onPurchase: () => void;
}

export default function ItemCard({ item, onPurchase }: ItemCardProps) {
  const isOutOfStock = item.amount === 0;
  const imageUrl = item.image && item.image.trim() !== '' 
    ? item.image 
    : generatePlaceholderImage(item.name);

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          transform: 'translateY(-4px)',
          transition: 'transform 0.2s ease-in-out',
        }
      }}
    >
      <CardMedia
        component="img"
        height="200"
        image={imageUrl}
        alt={item.name}
        sx={{ 
          objectFit: 'contain',
          bgcolor: 'background.paper',
          p: item.image ? 0 : 2 // Add padding for placeholder images
        }}
      />
      
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Typography gutterBottom variant="h6" component="h2" sx={{ mb: 0 }}>
            {item.name}
          </Typography>
          <Chip
            label={isOutOfStock ? 'Out of Stock' : `${item.amount} left`}
            color={isOutOfStock ? 'error' : 'primary'}
            size="small"
          />
        </Box>

        <Typography variant="body2" color="text.secondary" paragraph>
          {item.description}
        </Typography>

        <Typography variant="h6" color="primary">
          {formatPrice(item.price)}
        </Typography>
      </CardContent>

      <CardActions>
        <Button
          fullWidth
          variant="contained"
          onClick={onPurchase}
          disabled={isOutOfStock}
        >
          {isOutOfStock ? 'Out of Stock' : 'Purchase'}
        </Button>
      </CardActions>
    </Card>
  );
} 