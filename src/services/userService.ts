import { db } from '@/lib/firebase';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  runTransaction, 
  collection, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';

export class InsufficientBalanceError extends Error {
  constructor() {
    super('Insufficient balance to complete the purchase');
    this.name = 'InsufficientBalanceError';
  }
}

export class UserNotFoundError extends Error {
  constructor(discordUserId: string) {
    super(`User not found with Discord ID: ${discordUserId}`);
    this.name = 'UserNotFoundError';
  }
}

const getUserDocByDiscordId = async (discordUserId: string) => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('discordUserId', '==', discordUserId));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    throw new UserNotFoundError(discordUserId);
  }

  // Get the first matching document
  return querySnapshot.docs[0];
};

export const getUserBalance = async (discordUserId: string): Promise<number> => {
  try {
    const userDoc = await getUserDocByDiscordId(discordUserId);
    return userDoc.data().balance || 0;
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      throw error;
    }
    throw new Error('Failed to fetch user balance');
  }
};

export const updateUserBalance = async (
  discordUserId: string, 
  itemPrice: number
): Promise<number> => {
  try {
    const userDoc = await getUserDocByDiscordId(discordUserId);
    const userRef = doc(db, 'users', userDoc.id);

    const newBalance = await runTransaction(db, async (transaction) => {
      const freshUserDoc = await transaction.get(userRef);
      const userData = freshUserDoc.data();

      if (!userData) {
        throw new UserNotFoundError(discordUserId);
      }

      const currentBalance = userData.balance || 0;

      if (currentBalance < itemPrice) {
        throw new InsufficientBalanceError();
      }

      const updatedBalance = currentBalance - itemPrice;
      
      transaction.update(userRef, {
        balance: updatedBalance,
        updatedAt: new Date().toISOString()
      });

      return updatedBalance;
    });

    return newBalance;
  } catch (error) {
    if (error instanceof InsufficientBalanceError || error instanceof UserNotFoundError) {
      throw error;
    }
    throw new Error('Failed to update user balance');
  }
}; 