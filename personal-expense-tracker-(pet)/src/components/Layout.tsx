import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { UserProfile } from '../types';
import { Sun, Moon, LogOut, Wallet } from 'lucide-react';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const docRef = doc(db, 'users', user.uid);
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfile;
          setProfile(data);
          setTheme(data.theme || 'light');
        } else {
          // Create profile if it doesn't exist
          const newProfile: UserProfile = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            theme: 'light',
            createdAt: new Date().toISOString(),
          };
          setDoc(docRef, newProfile);
        }
      });
      return () => unsubscribe();
    } else {
      setProfile(null);
    }
  }, [user]);

  const toggleTheme = async () => {
    if (user && profile) {
      const newTheme = theme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
      await setDoc(doc(db, 'users', user.uid), { ...profile, theme: newTheme });
    } else {
      setTheme(prev => prev === 'light' ? 'dark' : 'light');
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-pulse flex flex-col items-center">
          <Wallet className="w-12 h-12 text-indigo-600 mb-4" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">Loading PET...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen transition-colors duration-300", theme === 'dark' ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900')}>
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight hidden sm:block">Personal Expense Tracker</h1>
            <h1 className="text-xl font-bold tracking-tight sm:hidden">PET</h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            {user && (
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium leading-none">{profile?.displayName || user.email}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{user.email}</p>
                </div>
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-xs">
                    {user.email?.[0].toUpperCase()}
                  </div>
                )}
                <button
                  onClick={() => auth.signOut()}
                  className="p-2 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
                  aria-label="Sign out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="mt-auto py-8 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-slate-500 dark:text-slate-400">
          <p>© 2026 Personal Expense Tracker. Built for Cardiff Metropolitan University.</p>
        </div>
      </footer>
    </div>
  );
}
