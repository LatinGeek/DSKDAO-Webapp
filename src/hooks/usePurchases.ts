import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Purchase, Item } from '@/types/item';
import { generatePlaceholderImage } from '@/utils/images';

interface PurchaseWithItem extends Purchase {
  item?: Item;
}

export const usePurchases = (userId: string | undefined) => {
  const [purchases, setPurchases] = useState<PurchaseWithItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPurchases = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const purchasesRef = collection(db, 'purchases');
        const purchasesQuery = query(
          purchasesRef,
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(purchasesQuery);
        const purchasesPromises = querySnapshot.docs.map(async (purchaseDoc) => {
          const purchaseData = purchaseDoc.data() as Purchase;
          const itemDoc = await getDoc(doc(db, 'items', purchaseData.itemId));
          
          let itemData: Item | undefined;
          
          if (itemDoc.exists()) {
            const data = itemDoc.data() as Item;
            itemData = {
              ...data,
              id: itemDoc.id,
              image: data.image?.trim() ? data.image : generatePlaceholderImage(data.name)
            };
          }

          return {
            ...purchaseData,
            id: purchaseDoc.id,
            item: itemData
          };
        });

        const purchasesWithItems = await Promise.all(purchasesPromises);
        setPurchases(purchasesWithItems);
        setError(null);
      } catch (err) {
        setError('Failed to fetch purchases');
        console.error('Error fetching purchases:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, [userId]);

  return { purchases, loading, error };
}; 