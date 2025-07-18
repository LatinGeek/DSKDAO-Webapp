import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Item } from '@/types/item';
import { getPlaceholderImage } from '@/utils/images';

export const useItems = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const itemsRef = collection(db, 'items');
        const itemsQuery = query(
          itemsRef,
          where('active', '==', true)
        );
        
        const querySnapshot = await getDocs(itemsQuery);
        const fetchedItems = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            image: data.image?.trim() ? data.image : getPlaceholderImage(data.name)
          };
        }) as Item[];

        setItems(fetchedItems);
        setError(null);
      } catch (err) {
        setError('Failed to fetch items');
        console.error('Error fetching items:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  return { items, loading, error };
}; 