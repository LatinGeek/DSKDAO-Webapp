import { db } from '@/lib/firebase';
import { doc, runTransaction } from 'firebase/firestore';

interface PurchaseItem {
  id: string;
  name: string;
  price: number;
}

export async function purchaseItem(userId: string, item: PurchaseItem) {
  if (!userId) throw new Error('User not authenticated');

  const userRef = doc(db, 'users', userId);

  try {
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('User document not found');
      }

      const userData = userDoc.data();
      const currentBalance = userData.balance || 0;

      if (currentBalance < item.price) {
        throw new Error('Insufficient balance');
      }

      // Update user's balance
      transaction.update(userRef, {
        balance: currentBalance - item.price,
      });

      // Add purchase to user's history
      const purchaseRef = doc(db, 'users', userId, 'purchases', Date.now().toString());
      transaction.set(purchaseRef, {
        itemId: item.id,
        itemName: item.name,
        price: item.price,
        purchaseDate: new Date(),
      });
    });

    return { success: true };
  } catch (error: any) {
    console.error('Purchase failed:', error);
    throw new Error(error.message || 'Purchase failed');
  }
} 