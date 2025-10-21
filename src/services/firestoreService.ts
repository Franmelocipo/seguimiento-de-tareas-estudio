import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  type QueryConstraint,
  type DocumentData,
  type WhereFilterOp,
} from 'firebase/firestore';
import { db } from '../lib/firebase/config';

// Helper to convert Firestore timestamps to Date objects
export const convertTimestamps = (data: DocumentData): any => {
  const converted: any = { ...data };
  for (const key in converted) {
    if (converted[key] instanceof Timestamp) {
      converted[key] = converted[key].toDate();
    } else if (converted[key] && typeof converted[key] === 'object') {
      converted[key] = convertTimestamps(converted[key]);
    }
  }
  return converted;
};

// Helper to convert Date objects to ISO strings for Firestore
export const prepareDateForFirestore = (data: any): any => {
  const prepared: any = {};
  for (const key in data) {
    if (data[key] instanceof Date) {
      prepared[key] = data[key].toISOString();
    } else if (data[key] && typeof data[key] === 'object' && !Array.isArray(data[key])) {
      prepared[key] = prepareDateForFirestore(data[key]);
    } else {
      prepared[key] = data[key];
    }
  }
  return prepared;
};

export class FirestoreService<T extends { id: string }> {
  private collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
    if (!db) {
      throw new Error('Firebase no está configurado. Usa el modo demo o configura las credenciales.');
    }
  }

  // Create
  async create(data: Omit<T, 'id'>): Promise<T> {
    const preparedData = prepareDateForFirestore(data);
    const docRef = await addDoc(collection(db!, this.collectionName), preparedData);
    return { id: docRef.id, ...data } as T;
  }

  // Read one
  async getById(id: string): Promise<T | null> {
    const docRef = doc(db!, this.collectionName, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = convertTimestamps(docSnap.data());
    return { id: docSnap.id, ...data } as T;
  }

  // Read all
  async getAll(constraints: QueryConstraint[] = []): Promise<T[]> {
    const q = query(collection(db!, this.collectionName), ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = convertTimestamps(doc.data());
      return { id: doc.id, ...data } as T;
    });
  }

  // Read with filter
  async getWhere(
    field: string,
    operator: WhereFilterOp,
    value: any
  ): Promise<T[]> {
    const q = query(
      collection(db!, this.collectionName),
      where(field, operator, value)
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = convertTimestamps(doc.data());
      return { id: doc.id, ...data } as T;
    });
  }

  // Update
  async update(id: string, data: Partial<Omit<T, 'id'>>): Promise<void> {
    const docRef = doc(db!, this.collectionName, id);
    const preparedData = prepareDateForFirestore(data);
    await updateDoc(docRef, preparedData);
  }

  // Delete
  async delete(id: string): Promise<void> {
    const docRef = doc(db!, this.collectionName, id);
    await deleteDoc(docRef);
  }

  // Custom query
  async query(constraints: QueryConstraint[]): Promise<T[]> {
    return this.getAll(constraints);
  }
}
