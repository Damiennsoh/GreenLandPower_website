'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword,
  updateProfile,
  type User as FirebaseUser
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { User, UserRole } from './types';

export interface AuthUser extends User {
  firebaseUser: FirebaseUser;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Check if component is mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // Listen to auth state changes
  useEffect(() => {
    if (!mounted) return;
    
    if (!auth || !db) {
      console.warn('Firebase not initialized');
      setLoading(false);
      return;
    }
    
    const unsubscribe = onAuthStateChanged(auth!, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db!, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            setUser({
              ...userData,
              firebaseUser,
            });
          } else {
            // Create user document if it doesn't exist
            const newUser: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email!,
              name: firebaseUser.displayName || firebaseUser.email!.split('@')[0],
              role: 'user',
              isActive: true,
            };
            
            await setDoc(doc(db!, 'users', firebaseUser.uid), newUser);
            setUser({
              ...newUser,
              firebaseUser,
            });
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
          setError('Failed to load user data');
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [mounted]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!auth) {
        throw new Error('Firebase not initialized');
      }
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!auth || !db) {
        throw new Error('Firebase not initialized');
      }
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name
      await updateProfile(userCredential.user, { displayName: name });
      
      // Create user document - all new users are regular users
      // SuperAdmin must be assigned manually in Firebase Console
      const newUser: User = {
        uid: userCredential.user.uid,
        email,
        name,
        role: 'user',
        isActive: true,
      };
      
      await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
      
      return userCredential.user;
    } catch (err: any) {
      setError(err.message || 'Signup failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      if (!auth) {
        throw new Error('Firebase not initialized');
      }
      await signOut(auth);
    } catch (err: any) {
      setError(err.message || 'Logout failed');
      throw err;
    }
  }, []);

  const updateUserProfile = useCallback(async (updates: { name?: string; profileImage?: string }) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      setLoading(true);
      setError(null);
      
      if (!auth || !db) {
        throw new Error('Firebase not initialized');
      }
      
      // Update Firebase Auth profile
      if (updates.name) {
        await updateProfile(user.firebaseUser, { displayName: updates.name });
      }
      
      // Update Firestore document
      await updateDoc(doc(db, 'users', user.uid), {
        ...updates,
        updatedAt: new Date(),
      });
      
      return true;
    } catch (err: any) {
      setError(err.message || 'Profile update failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateUserPassword = useCallback(async (newPassword: string) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      setLoading(true);
      setError(null);
      
      if (!auth) {
        throw new Error('Firebase not initialized');
      }
      
      await updatePassword(user.firebaseUser, newPassword);
      
      return true;
    } catch (err: any) {
      setError(err.message || 'Password update failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const isAdmin = user?.role === 'admin' || user?.role === 'superAdmin';
  const isSuperAdmin = user?.role === 'superAdmin';
  const isAuthenticated = user !== null;

  return {
    user,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    isSuperAdmin,
    mounted,
    login,
    logout,
    signup,
    updateUserProfile,
    updateUserPassword,
    setError,
  };
};
