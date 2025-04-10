import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { getUserGuildRoles } from '@/services/discordService';

export function useDiscordRole() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<string[]>(user?.roles || []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRoles() {
      if (!user?.discordId || !user?.discordAccessToken) {
        setLoading(false);
        return;
      }

      try {
        const userRoles = await getUserGuildRoles(user.discordAccessToken);
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

  const hasRole = (roleId: string) => roles.includes(roleId);

  return {
    roles,
    loading,
    error,
    hasRole,
  };
} 