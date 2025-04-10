import { db } from '@/lib/firebase';
import { Item, Purchase, PurchaseRequest } from '@/types/item';
import { 
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  runTransaction,
  serverTimestamp,
  query,
  where,
  orderBy,
  getDocs
} from 'firebase/firestore';

export class PurchaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PurchaseError';
  }
}

export const purchaseItem = async (request: PurchaseRequest): Promise<Purchase> => {
  const { itemId, quantity, userId } = request;

  try {
    const purchase = await runTransaction(db, async (transaction) => {
      // Get the item document
      const itemRef = doc(db, 'items', itemId);
      const itemDoc = await transaction.get(itemRef);

      if (!itemDoc.exists()) {
        throw new PurchaseError('Item not found');
      }

      const item = itemDoc.data() as Item;

      // Validate item availability
      if (!item.active) {
        throw new PurchaseError('Item is not available for purchase');
      }

      if (item.amount < quantity) {
        throw new PurchaseError('Insufficient stock');
      }

      // Calculate total price
      const totalPrice = item.price * quantity;

      // Create purchase record
      const purchaseId = doc(collection(db, 'purchases')).id;
      const purchase: Purchase = {
        id: purchaseId,
        itemId,
        userId,
        quantity,
        totalPrice,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Update item stock
      const newAmount = item.amount - quantity;
      transaction.update(itemRef, { 
        amount: newAmount,
        updatedAt: serverTimestamp()
      });

      // Save purchase record
      const purchaseRef = doc(db, 'purchases', purchaseId);
      transaction.set(purchaseRef, purchase);

      return purchase;
    });

    return purchase;
  } catch (error) {
    if (error instanceof PurchaseError) {
      throw error;
    }
    throw new PurchaseError('Failed to process purchase');
  }
};

export const completePurchase = async (purchaseId: string): Promise<Purchase> => {
  const purchaseRef = doc(db, 'purchases', purchaseId);
  
  try {
    await updateDoc(purchaseRef, {
      status: 'completed',
      updatedAt: serverTimestamp()
    });

    const updatedPurchase = await getDoc(purchaseRef);
    if (!updatedPurchase.exists()) {
      throw new PurchaseError('Purchase not found');
    }

    return updatedPurchase.data() as Purchase;
  } catch (error) {
    throw new PurchaseError('Failed to complete purchase');
  }
};

export const getPurchaseHistory = async (userId: string): Promise<Purchase[]> => {
  try {
    const purchasesRef = collection(db, 'purchases');
    const purchasesQuery = query(
      purchasesRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(purchasesQuery);
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    }) as Purchase);
  } catch (error) {
    throw new PurchaseError('Failed to fetch purchase history');
  }
}; 