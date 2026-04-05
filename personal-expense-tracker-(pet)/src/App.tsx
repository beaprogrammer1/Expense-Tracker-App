import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import Layout from './components/Layout';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Layout>
      {user ? <Dashboard /> : <Auth />}
    </Layout>
  );
}
