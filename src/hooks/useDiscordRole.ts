import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { getGuildRoles, getUserGuildMember } from '@/services/discordService';

interface Role {
  id: string;
  name: string;
  color: number;
}

export function useDiscordRole() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRoles() {
      if (!user?.discordId || !user?.discordAccessToken) {
        setLoading(false);
        return;
      }

      try {
        // Fetch both guild roles and user's member data
        const [guildRoles, memberData] = await Promise.all([
          getGuildRoles(),
          getUserGuildMember(user.discordAccessToken)
        ]);

        // Map member roles to full role objects
        const userRoles = guildRoles
          .filter(role => memberData.roles.includes(role.id))
          .sort((a, b) => b.position - a.position); // Sort by position (highest first)

        setRoles(userRoles);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch Discord roles');
        setRoles([]);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchRoles();
    } else {
      setRoles([]);
      setLoading(false);
    }
  }, [user?.discordId, user?.discordAccessToken]);

  const hasRole = (roleId: string) => roles.some(role => role.id === roleId);
  const getRoleName = (roleId: string) => roles.find(role => role.id === roleId)?.name;

  return {
    roles,
    loading,
    error,
    hasRole,
    getRoleName,
  };
} 