import { Box, Typography, CircularProgress, Tooltip, IconButton } from '@mui/material';
import { useDiscordRole } from '@/hooks/useDiscordRole';
import { useAuth } from '@/hooks/useAuth';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CodeIcon from '@mui/icons-material/Code';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonIcon from '@mui/icons-material/Person';
import StarIcon from '@mui/icons-material/Star';
import HelpIcon from '@mui/icons-material/Help';
import TagIcon from '@mui/icons-material/Tag';
import StatBaseCard from './StatBaseCard';

function getRoleIcon(roleName: string) {
  const name = roleName.toLowerCase();
  if (name.includes('admin')) {
    return <AdminPanelSettingsIcon sx={{ fontSize: '1.2rem' }} />
  }
  if (name.includes('developer') && name.includes('lead')) {
    return <CodeIcon sx={{ fontSize: '1.2rem' }} />
  }
  if (name.includes('developer') || name.includes('dev')) {
    return <GroupsIcon sx={{ fontSize: '1.2rem' }} />
  }
  if (name.includes('team') && name.includes('member')) {
    return <PersonIcon sx={{ fontSize: '1.2rem' }} />
  }
  if (name.includes('og')) {
    return <StarIcon sx={{ fontSize: '1.2rem' }} />
  }
  return <HelpIcon sx={{ fontSize: '1.2rem' }} />
}

function getRoleColor(color: number): string {
  // Use a consistent blue for most roles, and special colors for specific ones
  if (color === 0) return '#3498db'; // Default blue for most roles
  if (color === parseInt('992D22', 16)) return '#992D22'; // Keep original red for OG
  return '#3498db'; // Default to blue for consistency
}

export default function UserRoles() {
  const { roles, loading, error } = useDiscordRole();
  const { user } = useAuth();

  if (!user?.discordId) {
    return (
      <StatBaseCard
        title="Discord Roles"
        icon={<TagIcon sx={{ color: '#fff' }} />}
        progressValue={-1}
      >
        <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
          Please connect your Discord account to view your roles
        </Typography>
      </StatBaseCard>
    );
  }

  if (loading) {
    return (
      <StatBaseCard
        title="Discord Roles"
        icon={<TagIcon sx={{ color: '#fff' }} />}
        progressValue={-1}
      >
        <Box display="flex" justifyContent="center" py={1}>
          <CircularProgress size={24} />
        </Box>
      </StatBaseCard>
    );
  }

  if (error) {
    return (
      <StatBaseCard
        title="Discord Roles"
        icon={<TagIcon sx={{ color: '#fff' }} />}
        progressValue={-1}
      >
        <Typography color="error" sx={{ fontSize: '0.875rem' }}>
          {error}
        </Typography>
      </StatBaseCard>
    );
  }


  return (
    <StatBaseCard
      title="Discord Roles"
      icon={<TagIcon sx={{ color: '#fff' }} />}
      progressValue={-1}
    >
      {roles.length > 0 ? (
        <Box 
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, 36px)',
            gap: '8px',
            justifyContent: 'start'
          }}
        >
          {roles.map((role) => (
            <Tooltip 
              key={role.id} 
              title={role.name} 
              arrow 
              placement="top"
              enterDelay={300}
            >
              <IconButton
                size="small"
                sx={{
                  backgroundColor: getRoleColor(role.color),
                  width: '36px',
                  height: '36px',
                  padding: 0,
                  '&:hover': {
                    backgroundColor: getRoleColor(role.color),
                    opacity: 0.9,
                    transform: 'translateY(-2px)',
                  },
                  transition: 'transform 0.2s ease-in-out',
                  '& svg': {
                    color: '#FFFFFF',
                  }
                }}
              >
                {getRoleIcon(role.name)}
              </IconButton>
            </Tooltip>
          ))}
        </Box>
      ) : (
        <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
          No roles found in DSKDAO server
        </Typography>
      )}
    </StatBaseCard>
  );
} 