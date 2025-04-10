'use client';

import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

interface AuthUser {
  id: string;
  email: string | null;
  displayName: string | null;
  discordId: string | null;
  discordUsername: string | null;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: User | null) => {
        try {
          if (firebaseUser) {
            // Get additional user data from Firestore
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            const userData = userDoc.data();

            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              discordId: userData?.discordUserId || null,
              discordUsername: userData?.discordUsername || null
            });
          } else {
            setUser(null);
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
          setError(err instanceof Error ? err : new Error('Failed to fetch user data'));
          setUser(null);
        } finally {
          setLoading(false);
        }
      }, (authError) => {
        console.error('Auth state change error:', authError);
        setError(authError);
        setLoading(false);
      });

      return () => {
        try {
          unsubscribe();
        } catch (err) {
          console.error('Error unsubscribing from auth state:', err);
        }
      };
    } catch (err) {
      console.error('Error setting up auth listener:', err);
      setError(err instanceof Error ? err : new Error('Failed to initialize auth'));
      setLoading(false);
    }
  }, []);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    hasDiscordLinked: !!user?.discordId
  };
}; 