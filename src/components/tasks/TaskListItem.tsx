import { Box, Typography, Chip, IconButton } from '@mui/material';
import { CheckCircle as CheckCircleIcon, LocalActivity as TicketIcon } from '@mui/icons-material';
import BaseCard from '../common/BaseCard';

interface TaskListItemProps {
  task: {
    id: string;
    title: string;
    description: string;
    reward: number;
    completed?: boolean;
    type: 'daily' | 'weekly' | 'special';
  };
  onComplete?: (taskId: string) => void;
}

export default function TaskListItem({ task, onComplete }: TaskListItemProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'daily':
        return 'primary';
      case 'weekly':
        return 'secondary';
      case 'special':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <BaseCard
      borderIndicator
      borderIndicatorColor={task.completed ? 'success.main' : undefined}
      sx={{ opacity: task.completed ? 0.7 : 1 }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {task.title}
            </Typography>
            <Chip
              label={task.type}
              color={getTypeColor(task.type)}
              size="small"
              sx={{ textTransform: 'capitalize' }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {task.description}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TicketIcon color="primary" fontSize="small" />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {task.reward}
            </Typography>
          </Box>
          {!task.completed && onComplete && (
            <IconButton
              color="success"
              onClick={() => onComplete(task.id)}
              sx={{
                '&:hover': {
                  bgcolor: 'success.main',
                  color: 'success.contrastText',
                }
              }}
            >
              <CheckCircleIcon />
            </IconButton>
          )}
        </Box>
      </Box>
    </BaseCard>
  );
} 