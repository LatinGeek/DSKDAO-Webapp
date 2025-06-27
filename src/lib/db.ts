import { 
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  runTransaction,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  QueryConstraint,
  DocumentSnapshot,
  QuerySnapshot,
  WriteBatch,
  writeBatch,
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { db } from './firebase';

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  ITEMS: 'items',
  PURCHASES: 'purchases',
  TRANSACTIONS: 'transactions',
  RAFFLES: 'raffles',
  RAFFLE_ENTRIES: 'raffle_entries',
  GAMES: 'games',
  GAME_SESSIONS: 'game_sessions',
  LOOTBOX_CONTENTS: 'lootbox_contents',
  LOOTBOX_OPENINGS: 'lootbox_openings',
  USER_STATS: 'user_stats',
  SYSTEM_STATS: 'system_stats',
  ACTIVITY_LOGS: 'activity_logs',
  NOTIFICATIONS: 'notifications'
} as const;

// Generic database operations
export class DatabaseService {
  
  // Create a new document
  static async create<T extends DocumentData>(
    collectionName: string,
    data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<T> {
    try {
      const docRef = doc(collection(db, collectionName));
      const timestamp = new Date().toISOString();
      
      const documentData = {
        ...data,
        id: docRef.id,
        createdAt: timestamp,
        updatedAt: timestamp
      } as unknown as T;

      await setDoc(docRef, documentData);
      return documentData;
    } catch (error) {
      console.error(`Error creating document in ${collectionName}:`, error);
      throw new Error(`Failed to create document in ${collectionName}`);
    }
  }

  // Create with custom ID
  static async createWithId<T extends DocumentData>(
    collectionName: string,
    id: string,
    data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<T> {
    try {
      const docRef = doc(db, collectionName, id);
      const timestamp = new Date().toISOString();
      
      const documentData = {
        ...data,
        id,
        createdAt: timestamp,
        updatedAt: timestamp
      } as unknown as T;

      await setDoc(docRef, documentData);
      return documentData;
    } catch (error) {
      console.error(`Error creating document with ID ${id} in ${collectionName}:`, error);
      throw new Error(`Failed to create document with ID ${id} in ${collectionName}`);
    }
  }

  // Get a single document by ID
  static async getById<T>(collectionName: string, id: string): Promise<T | null> {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      }
      return null;
    } catch (error) {
      console.error(`Error getting document ${id} from ${collectionName}:`, error);
      throw new Error(`Failed to get document ${id} from ${collectionName}`);
    }
  }

  // Get multiple documents with filters
  static async getMany<T>(
    collectionName: string,
    filters?: QueryConstraint[],
    limitCount?: number
  ): Promise<T[]> {
    try {
      const collectionRef = collection(db, collectionName);
      const constraints = filters || [];
      
      if (limitCount) {
        constraints.push(limit(limitCount));
      }

      const q = query(collectionRef, ...constraints);
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map((doc: DocumentSnapshot) => ({
        id: doc.id,
        ...doc.data()
      }) as T);
    } catch (error) {
      console.error(`Error getting documents from ${collectionName}:`, error);
      throw new Error(`Failed to get documents from ${collectionName}`);
    }
  }

  // Update a document
  static async update<T>(
    collectionName: string,
    id: string,
    data: Partial<Omit<T, 'id' | 'createdAt'>>
  ): Promise<void> {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error updating document ${id} in ${collectionName}:`, error);
      throw new Error(`Failed to update document ${id} in ${collectionName}`);
    }
  }

  // Delete a document
  static async delete(collectionName: string, id: string): Promise<void> {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting document ${id} from ${collectionName}:`, error);
      throw new Error(`Failed to delete document ${id} from ${collectionName}`);
    }
  }

  // Batch operations
  static createBatch(): WriteBatch {
    return writeBatch(db);
  }

  static async commitBatch(batch: WriteBatch): Promise<void> {
    try {
      await batch.commit();
    } catch (error) {
      console.error('Error committing batch:', error);
      throw new Error('Failed to commit batch operation');
    }
  }

  // Transactions
  static async runTransaction<T>(
    updateFunction: (transaction: any) => Promise<T>
  ): Promise<T> {
    try {
      return await runTransaction(db, updateFunction);
    } catch (error) {
      console.error('Error running transaction:', error);
      throw new Error('Failed to run transaction');
    }
  }

  // Paginated queries
  static async getPaginated<T>(
    collectionName: string,
    pageSize: number,
    lastDocId?: string,
    filters?: QueryConstraint[]
  ): Promise<{
    items: T[];
    hasMore: boolean;
    lastDocId?: string;
  }> {
    try {
      const collectionRef = collection(db, collectionName);
      const constraints = filters || [];
      constraints.push(limit(pageSize + 1)); // Get one extra to check if there are more

      if (lastDocId) {
        const lastDocRef = doc(db, collectionName, lastDocId);
        const lastDocSnap = await getDoc(lastDocRef);
        if (lastDocSnap.exists()) {
          constraints.push(startAfter(lastDocSnap));
        }
      }

      const q = query(collectionRef, ...constraints);
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs;

      const hasMore = docs.length > pageSize;
      const items = docs.slice(0, pageSize).map((doc: DocumentSnapshot) => ({
        id: doc.id,
        ...doc.data()
      }) as T);

      return {
        items,
        hasMore,
        lastDocId: items.length > 0 ? items[items.length - 1].id : undefined
      };
    } catch (error) {
      console.error(`Error getting paginated documents from ${collectionName}:`, error);
      throw new Error(`Failed to get paginated documents from ${collectionName}`);
    }
  }

  // Helper methods for common query constraints
  static where(field: string, operator: any, value: any) {
    return where(field, operator, value);
  }

  static orderBy(field: string, direction: 'asc' | 'desc' = 'asc') {
    return orderBy(field, direction);
  }

  static limit(count: number) {
    return limit(count);
  }

  // Server timestamp helper
  static serverTimestamp() {
    return serverTimestamp();
  }

  // Array operations helpers
  static arrayUnion(...elements: any[]) {
    return arrayUnion(...elements);
  }

  static arrayRemove(...elements: any[]) {
    return arrayRemove(...elements);
  }

  // Increment helper
  static increment(n: number) {
    return increment(n);
  }
}

// Specific collection helpers
export class UserDB {
  static async getByDiscordId(discordUserId: string): Promise<any | null> {
    const users = await DatabaseService.getMany(
      COLLECTIONS.USERS,
      [DatabaseService.where('discordUserId', '==', discordUserId)]
    );
    return users[0] || null;
  }

  static async updateBalance(userId: string, redeemablePoints: number, soulBoundPoints: number) {
    return DatabaseService.update(COLLECTIONS.USERS, userId, {
      redeemablePoints,
      soulBoundPoints,
      lastActivityAt: new Date().toISOString()
    });
  }
}

export class ItemDB {
  static async getActiveItems() {
    return DatabaseService.getMany(
      COLLECTIONS.ITEMS,
      [
        DatabaseService.where('active', '==', true),
        DatabaseService.orderBy('sortOrder', 'asc')
      ]
    );
  }

  static async getFeaturedItems() {
    return DatabaseService.getMany(
      COLLECTIONS.ITEMS,
      [
        DatabaseService.where('active', '==', true),
        DatabaseService.where('featured', '==', true),
        DatabaseService.orderBy('sortOrder', 'asc')
      ]
    );
  }
}

export class TransactionDB {
  static async getUserTransactions(userId: string, limitCount = 50) {
    return DatabaseService.getMany(
      COLLECTIONS.TRANSACTIONS,
      [
        DatabaseService.where('userId', '==', userId),
        DatabaseService.orderBy('createdAt', 'desc'),
        DatabaseService.limit(limitCount)
      ]
    );
  }

  static async createTransaction(transactionData: any) {
    return DatabaseService.create(COLLECTIONS.TRANSACTIONS, transactionData);
  }
}

export class RaffleDB {
  static async getActiveRaffles() {
    return DatabaseService.getMany(
      COLLECTIONS.RAFFLES,
      [
        DatabaseService.where('status', '==', 'active'),
        DatabaseService.orderBy('endDate', 'asc')
      ]
    );
  }

  static async getUserRaffleEntries(userId: string, raffleId: string) {
    return DatabaseService.getMany(
      COLLECTIONS.RAFFLE_ENTRIES,
      [
        DatabaseService.where('userId', '==', userId),
        DatabaseService.where('raffleId', '==', raffleId)
      ]
    );
  }
}

export { db };