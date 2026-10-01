import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase.ts';
import { setAuthTokenProvider, fetchApi } from '../lib/api.ts';
import { UserProfile, UserPreferences } from '../types/index.ts';

interface AuthContextType {
  user: UserProfile | null;
  preferences: UserPreferences | null;
  isLoading: boolean;
  isDemoMode: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithDemo: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  setPreferences: React.Dispatch<React.SetStateAction<UserPreferences | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const fetchCurrentUser = async () => {
    try {
      const data = await fetchApi<{ user: UserProfile; preferences: UserPreferences }>('/api/user/me');
      setUser(data.user);
      setPreferences(data.preferences);
    } catch (err) {
      console.error('Error fetching current user:', err);
    }
  };

  useEffect(() => {
    // Check if demo session was stored locally
    const savedDemo = localStorage.getItem('masrof_demo_mode') === 'true';
    if (savedDemo) {
      setIsDemoMode(true);
      setAuthTokenProvider(async () => 'demo-session-token', true);
      fetchCurrentUser().finally(() => setIsLoading(false));
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        setIsDemoMode(false);
        setAuthTokenProvider(() => fbUser.getIdToken(), false);
        await fetchCurrentUser();
      } else {
        setUser(null);
        setPreferences(null);
        setAuthTokenProvider(async () => null, false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      localStorage.removeItem('masrof_demo_mode');
      setIsDemoMode(false);
      const res = await signInWithPopup(auth, googleAuthProvider);
      setAuthTokenProvider(() => res.user.getIdToken(), false);
      await fetchCurrentUser();
    } catch (error) {
      console.error('Sign in failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithDemo = async () => {
    setIsLoading(true);
    try {
      localStorage.setItem('masrof_demo_mode', 'true');
      setIsDemoMode(true);
      setAuthTokenProvider(async () => 'demo-session-token', true);

      // Seed demo data
      await fetchApi('/api/demo/seed', { method: 'POST' });
      await fetchCurrentUser();
    } catch (error) {
      console.error('Demo sign in failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      localStorage.removeItem('masrof_demo_mode');
      setIsDemoMode(false);
      await firebaseSignOut(auth);
      setUser(null);
      setPreferences(null);
      setAuthTokenProvider(async () => null, false);
    } catch (error) {
      console.error('Sign out failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        preferences,
        isLoading,
        isDemoMode,
        signInWithGoogle,
        signInWithDemo,
        signOut,
        refreshUserData: fetchCurrentUser,
        setPreferences,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
