'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { doc, onSnapshot, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface UserData {
  balance: number;
  discordLinked: boolean;
  discordUserId: string;
  address: string;
  createdAt?: string;
  updatedAt?: string;
}

interface UserContextType {
  userData: UserData | null;
  loading: boolean;
  error: Error | null;
  refreshUserData: () => Promise<void>;
  updateUserData: (data: Partial<UserData>) => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  userData: null,
  loading: true,
  error: null,
  refreshUserData: async () => {},
  updateUserData: async () => {}
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [userDocId, setUserDocId] = useState<string | null>(null);

  const findOrCreateUserDocument = async (discordId: string) => {
    try {
      // Query for existing user with matching discordUserId
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('discordUserId', '==', discordId));
      const querySnapshot = await getDocs(q);

      let docId: string;

      if (!querySnapshot.empty) {
        // Use existing document
        docId = querySnapshot.docs[0].id;
        const data = querySnapshot.docs[0].data() as UserData;
        
        // Update if needed
        if (!data.discordLinked) {
          await setDoc(doc(db, 'users', docId), {
            ...data,
            discordLinked: true,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        }
      } else {
        // Create new document with generated ID
        const newDocRef = doc(collection(db, 'users'));
        docId = newDocRef.id;
        
        const timestamp = new Date().toISOString();
        await setDoc(newDocRef, {
          balance: 0,
          discordLinked: true,
          discordUserId: discordId,
          address: '',
          createdAt: timestamp,
          updatedAt: timestamp
        });
      }

      return docId;
    } catch (error) {
      console.error('Error in findOrCreateUserDocument:', error);
      throw error;
    }
  };

  const updateUserData = async (data: Partial<UserData>) => {
    if (!userDocId) return;

    try {
      await setDoc(doc(db, 'users', userDocId), {
        ...data,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
    }
  };

  const fetchUserData = async () => {
    if (status === 'loading') {
      return () => {};
    }

    if (!session?.user?.id) {
      setUserData(null);
      setLoading(false);
      return () => {};
    }

    try {
      const docId = await findOrCreateUserDocument(session.user.id);
      setUserDocId(docId);

      // Set up real-time listener on the document
      const unsubscribe = onSnapshot(
        doc(db, 'users', docId),
        (doc) => {
          if (doc.exists()) {
            setUserData(doc.data() as UserData);
          } else {
            setUserData(null);
          }
          setLoading(false);
        },
        (error) => {
          console.error('Error fetching user data:', error);
          setError(error instanceof Error ? error : new Error('Failed to fetch user data'));
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error in fetchUserData:', error);
      setError(error instanceof Error ? error : new Error('Failed to fetch user data'));
      setLoading(false);
      return () => {};
    }
  };

  useEffect(() => {
    const setupListener = async () => {
      const unsubscribe = await fetchUserData();
      return () => unsubscribe();
    };

    setupListener();
  }, [session?.user?.id, status]);

  const refreshUserData = async () => {
    setLoading(true);
    await fetchUserData();
  };

  return (
    <UserContext.Provider value={{ 
      userData, 
      loading, 
      error, 
      refreshUserData,
      updateUserData 
    }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext); 