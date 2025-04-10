'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useUser } from '@/contexts/UserContext';

interface AuthUser {
  id: string;
  email: string | null;
  displayName: string | null;
  discordId: string | null;
  discordUsername: string | null;
  balance: number;
}

export const useAuth = () => {
  const { data: session } = useSession();
  const { userData, loading: userLoading } = useUser();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!session?.user || userLoading) {
      setUser(null);
      setLoading(false);
      return;
    }

    // Combine session and userData
    if (userData && session.user.id) {
      setUser({
        id: session.user.id,
        email: session.user.email ?? null,
        displayName: session.user.name ?? null,
        discordId: userData.discordUserId,
        discordUsername: session.user.name ?? null,
        balance: userData.balance
      });
    }

    setLoading(false);
  }, [session, userData, userLoading]);

  return {
    user,
    loading: loading || userLoading,
    error,
    isAuthenticated: !!user,
    hasDiscordLinked: !!userData?.discordLinked
  };
}; 