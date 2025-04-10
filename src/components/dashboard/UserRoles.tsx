import { Box, Card, CardContent, Typography, CircularProgress, Chip, Stack } from '@mui/material';
import { useDiscordRole } from '@/hooks/useDiscordRole';
import { useAuth } from '@/hooks/useAuth';

function getRoleColor(color: number): string {
  return color === 0 ? '#99AAB5' : `#${color.toString(16).padStart(6, '0')}`;
}

export default function UserRoles() {
  const { roles, loading, error } = useDiscordRole();
  const { user } = useAuth();

  if (!user?.discordId) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Discord Roles
          </Typography>
          <Typography color="text.secondary">
            Please connect your Discord account to view your roles
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={100}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Discord Roles
          </Typography>
          <Typography color="error">
            {error}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Discord Roles
        </Typography>
        {roles.length > 0 ? (
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            {roles.map((role) => (
              <Chip
                key={role.id}
                label={role.name}
                sx={{
                  backgroundColor: getRoleColor(role.color),
                  color: role.color === 0 ? 'text.primary' : '#FFFFFF',
                  fontWeight: 500,
                }}
              />
            ))}
          </Stack>
        ) : (
          <Typography color="text.secondary">
            No roles found in DSKDAO server
          </Typography>
        )}
      </CardContent>
    </Card>
  );
} 