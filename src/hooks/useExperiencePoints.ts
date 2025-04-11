import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { collection, doc, query, getDocs, setDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ExperiencePoints {
  total: number;
  daily: number;
  loading: boolean;
  error: string | null;
}

function getOneMonthAgo(): string {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  return date.toISOString();
}

function calculateExperiencePoints(createdAt: string): { total: number; daily: number } {
  const accountCreationDate = new Date(createdAt);
  const now = new Date();
  
  // Calculate days since account creation
  const daysSinceCreation = Math.floor((now.getTime() - accountCreationDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Base XP calculation:
  // - 100 XP per day since creation
  // - Bonus multiplier based on months (1.1x per month, capped at 2x)
  const monthsSinceCreation = daysSinceCreation / 30;
  const bonusMultiplier = Math.min(1 + (monthsSinceCreation * 0.1), 2);
  
  const baseXP = daysSinceCreation * 100;
  const total = Math.floor(baseXP * bonusMultiplier);
  
  // Daily XP is a fixed rate plus small random variation
  const daily = Math.floor(100 + (Math.random() * 20));
  
  return { total, daily };
}

export function useExperiencePoints(): ExperiencePoints {
  const { userData, loading: userLoading } = useUser();
  const [experiencePoints, setExperiencePoints] = useState<ExperiencePoints>({
    total: 0,
    daily: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    let isSubscribed = true;

    const initializeUserCreatedAt = async () => {
      if (!userData || userLoading) return;

      try {
        if (!userData.createdAt) {
          // Set createdAt to 1 month ago
          const oneMonthAgo = getOneMonthAgo();
          
          // Get user document reference
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('discordUserId', '==', userData.discordUserId));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            await setDoc(doc(db, 'users', userDoc.id), {
              ...userData,
              createdAt: oneMonthAgo,
              updatedAt: new Date().toISOString()
            }, { merge: true });

            // Calculate XP with the new createdAt date
            if (isSubscribed) {
              const { total, daily } = calculateExperiencePoints(oneMonthAgo);
              setExperiencePoints({
                total,
                daily,
                loading: false,
                error: null
              });
            }
          }
        } else {
          // Use existing createdAt date
          if (isSubscribed) {
            const { total, daily } = calculateExperiencePoints(userData.createdAt);
            setExperiencePoints({
              total,
              daily,
              loading: false,
              error: null
            });
          }
        }
      } catch (error) {
        if (isSubscribed) {
          setExperiencePoints({
            total: 0,
            daily: 0,
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to calculate experience points'
          });
        }
      }
    };

    initializeUserCreatedAt();

    return () => {
      isSubscribed = false;
    };
  }, [userData, userLoading]);

  return experiencePoints;
} 