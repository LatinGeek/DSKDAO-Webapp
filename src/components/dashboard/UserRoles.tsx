import { Box, Card, CardContent, Typography, CircularProgress } from '@mui/material';
import { useDiscordRole } from '@/hooks/useDiscordRole';
import { useAuth } from '@/hooks/useAuth';

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
          <Box>
            {roles.map((role) => (
              <Typography key={role} color="text.secondary">
                {role}
              </Typography>
            ))}
          </Box>
        ) : (
          <Typography color="text.secondary">
            No roles found in DSKDAO server
          </Typography>
        )}
      </CardContent>
    </Card>
  );
} 