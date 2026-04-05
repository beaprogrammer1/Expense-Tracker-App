import React, { useState } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { EXPENSE_CATEGORIES, ExpenseCategory } from '../types';
import { Plus, MapPin, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function ExpenseForm() {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [timestamp, setTimestamp] = useState(new Date().toISOString().slice(0, 16));
  const [location, setLocation] = useState<{ latitude: number; longitude: number; address?: string } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGetLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setIsLocating(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setIsLocating(false);
          alert('Could not get your location. Please check your permissions.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
      setIsLocating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    setIsSubmitting(true);
    try {
      const expenseData = {
        uid: auth.currentUser.uid,
        title,
        amount: parseFloat(amount),
        category,
        timestamp: new Date(timestamp).toISOString(),
        location: location || null,
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'users', auth.currentUser.uid, 'expenses'), expenseData);

      // Reset form
      setTitle('');
      setAmount('');
      setCategory('Food');
      setTimestamp(new Date().toISOString().slice(0, 16));
      setLocation(null);
    } catch (error) {
      console.error('Error adding expense:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-6"
    >
      <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
        <Plus className="w-5 h-5 text-indigo-600" />
        Record New Expense
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Weekly Groceries"
            className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            >
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date & Time</label>
          <input
            type="datetime-local"
            required
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleGetLocation}
            disabled={isLocating}
            className="flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors disabled:opacity-50"
          >
            {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
            {location ? 'Location Tagged' : 'Tag Location'}
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Expense
          </button>
        </div>
      </form>
    </motion.div>
  );
}
