import React from 'react';
import { auth } from '../firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { Wallet, Chrome } from 'lucide-react';
import { motion } from 'motion/react';

export default function Auth() {
  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 text-center"
      >
        <div className="inline-flex p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl mb-6">
          <Wallet className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Welcome to PET</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Your personal companion for managing finances effectively. Secure, simple, and insightful.
        </p>

        <button
          onClick={handleSignIn}
          className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-sm"
        >
          <Chrome className="w-5 h-5" />
          Continue with Google
        </button>

        <p className="mt-6 text-xs text-slate-500 dark:text-slate-500">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full">
        {[
          { title: 'Real-time Sync', desc: 'Your data is synced across all your devices instantly.' },
          { title: 'Visual Analytics', desc: 'Understand your spending patterns with beautiful charts.' },
          { title: 'Location Tagging', desc: 'Remember where you spent your money with geolocation.' }
        ].map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * (i + 1) }}
            className="p-6 rounded-xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50"
          >
            <h3 className="font-bold mb-2">{feature.title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
