'use client';

import { createContext, useContext, useState, useEffect } from 'react';
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
    console.group('🔍 Finding or Creating User Document');
    console.log('Discord ID:', discordId);
    
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
        console.log('📄 Found existing user document:', { docId, data });
        
        // Update if needed
        if (!data.discordLinked) {
          console.log('🔄 Updating discord linked status');
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
        const newUserData = {
          balance: 0,
          discordLinked: true,
          discordUserId: discordId,
          address: '',
          createdAt: timestamp,
          updatedAt: timestamp
        };
        
        console.log('📝 Creating new user document:', { docId, data: newUserData });
        await setDoc(newDocRef, newUserData);
      }

      console.groupEnd();
      return docId;
    } catch (error) {
      console.error('❌ Error in findOrCreateUserDocument:', error);
      console.groupEnd();
      throw error;
    }
  };

  const updateUserData = async (data: Partial<UserData>) => {
    console.group('📝 Updating User Data');
    console.log('User Doc ID:', userDocId);
    console.log('Update Data:', data);

    if (!userDocId) {
      console.warn('⚠️ No user document ID available');
      console.groupEnd();
      return;
    }

    try {
      const updateData = {
        ...data,
        updatedAt: new Date().toISOString()
      };
      console.log('🔄 Applying update:', updateData);
      
      await setDoc(doc(db, 'users', userDocId), updateData, { merge: true });
      console.log('✅ Update successful');
    } catch (error) {
      console.error('❌ Error updating user data:', error);
      throw error;
    } finally {
      console.groupEnd();
    }
  };

  const fetchUserData = async () => {
    console.group('📥 Fetching User Data');
    console.log('Session Status:', status);
    console.log('Session User ID:', session?.user?.id);

    if (status === 'loading') {
      console.log('⏳ Session still loading');
      console.groupEnd();
      return () => {};
    }

    if (!session?.user?.id) {
      console.log('ℹ️ No user session');
      setUserData(null);
      setLoading(false);
      console.groupEnd();
      return () => {};
    }

    try {
      const docId = await findOrCreateUserDocument(session.user.id);
      console.log('📄 Document ID:', docId);
      setUserDocId(docId);

      // Set up real-time listener on the document
      const unsubscribe = onSnapshot(
        doc(db, 'users', docId),
        (doc) => {
          if (doc.exists()) {
            const data = doc.data() as UserData;
            console.log('📥 Received user data update:', data);
            setUserData(data);
          } else {
            console.warn('⚠️ Document does not exist');
            setUserData(null);
          }
          setLoading(false);
        },
        (error) => {
          console.error('❌ Error in snapshot listener:', error);
          setError(error instanceof Error ? error : new Error('Failed to fetch user data'));
          setLoading(false);
        }
      );

      console.log('👂 Snapshot listener set up');
      console.groupEnd();
      return unsubscribe;
    } catch (error) {
      console.error('❌ Error in fetchUserData:', error);
      setError(error instanceof Error ? error : new Error('Failed to fetch user data'));
      setLoading(false);
      console.groupEnd();
      return () => {};
    }
  };

  useEffect(() => {
    console.group('🔄 User Data Effect');
    console.log('Session User ID:', session?.user?.id);
    console.log('Session Status:', status);

    const setupListener = async () => {
      const unsubscribe = await fetchUserData();
      return () => {
        console.log('🔇 Unsubscribing from user data updates');
        unsubscribe();
      };
    };

    setupListener();
    console.groupEnd();
  }, [session?.user?.id, status]); // fetchUserData is defined inside component and creates complex dependencies

  const refreshUserData = async () => {
    console.group('🔄 Refreshing User Data');
    setLoading(true);
    await fetchUserData();
    console.groupEnd();
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