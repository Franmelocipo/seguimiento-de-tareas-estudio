import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  type User as FirebaseUser,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, isDemoMode } from '../lib/firebase/config';
import { LocalAuthService } from './localStorageService';
import type { User } from '../types';

// Create local auth service instance for demo mode
const localAuth = new LocalAuthService();

export const authService = {
  // Sign in
  async signIn(email: string, password: string): Promise<User> {
    if (isDemoMode) {
      return await localAuth.signIn(email, password);
    }

    const userCredential = await signInWithEmailAndPassword(
      auth!,
      email,
      password
    );
    const user = await this.getUserData(userCredential.user.uid);
    if (!user) {
      throw new Error('Usuario no encontrado en la base de datos');
    }
    return user;
  },

  // Sign out
  async signOut(): Promise<void> {
    if (isDemoMode) {
      return await localAuth.signOut();
    }
    await firebaseSignOut(auth!);
  },

  // Create user
  async createUser(
    email: string,
    password: string,
    displayName: string,
    roleId: string
  ): Promise<User> {
    if (isDemoMode) {
      return await localAuth.createUser(email, password, displayName, roleId);
    }

    const userCredential = await createUserWithEmailAndPassword(
      auth!,
      email,
      password
    );

    const newUser: User = {
      id: userCredential.user.uid,
      email,
      displayName,
      roleId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db!, 'users', userCredential.user.uid), {
      ...newUser,
      createdAt: newUser.createdAt.toISOString(),
      updatedAt: newUser.updatedAt.toISOString(),
    });

    return newUser;
  },

  // Get user data
  async getUserData(userId: string): Promise<User | null> {
    if (isDemoMode) {
      return await localAuth.getUserData(userId);
    }

    const userDoc = await getDoc(doc(db!, 'users', userId));
    if (!userDoc.exists()) {
      return null;
    }

    const data = userDoc.data();
    return {
      id: userDoc.id,
      email: data.email,
      displayName: data.displayName,
      roleId: data.roleId,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    };
  },

  // Update user
  async updateUser(
    userId: string,
    updates: Partial<Omit<User, 'id' | 'createdAt'>>
  ): Promise<void> {
    if (isDemoMode) {
      return await localAuth.updateUser(userId, updates);
    }

    await updateDoc(doc(db!, 'users', userId), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  },

  // Auth state observer
  onAuthStateChange(callback: (user: FirebaseUser | null) => void): () => void {
    if (isDemoMode) {
      return localAuth.onAuthStateChange((user) => {
        // Transform local user to look like Firebase user
        callback(user ? { uid: user.id, email: user.email } as any : null);
      });
    }

    return onAuthStateChanged(auth!, callback);
  },

  // Get current user
  getCurrentUser(): FirebaseUser | null {
    if (isDemoMode) {
      const user = localAuth.getCurrentUser();
      return user ? { uid: user.id, email: user.email } as any : null;
    }

    return auth!.currentUser;
  },
};
