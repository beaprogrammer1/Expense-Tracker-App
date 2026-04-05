import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { Expense, EXPENSE_CATEGORIES, ExpenseCategory } from '../types';
import { Trash2, Filter, Calendar, MapPin, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

export default function ExpenseList() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filterCategory, setFilterCategory] = useState<ExpenseCategory | 'All'>('All');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'users', auth.currentUser.uid, 'expenses'),
      orderBy(sortBy === 'date' ? 'timestamp' : 'amount', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const expenseData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Expense[];
      setExpenses(expenseData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [sortBy]);

  const handleDelete = async (id: string) => {
    if (!auth.currentUser) return;
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'expenses', id));
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };

  const filteredExpenses = expenses.filter(exp =>
    filterCategory === 'All' ? true : exp.category === filterCategory
  );

  const totalAmount = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-slate-100 dark:bg-slate-900 animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as any)}
              className="bg-transparent text-sm font-medium outline-none"
            >
              <option value="All">All Categories</option>
              {EXPENSE_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-sm font-medium outline-none"
            >
              <option value="date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
            </select>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">Total Filtered</p>
          <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">${totalAmount.toFixed(2)}</p>
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredExpenses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-slate-500"
            >
              No expenses found matching your filters.
            </motion.div>
          ) : (
            filteredExpenses.map((expense) => (
              <motion.div
                key={expense.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                    <Tag className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold truncate">{expense.title}</h4>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(expense.timestamp), 'MMM d, yyyy HH:mm')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {expense.category}
                      </span>
                      {expense.location && (
                        <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                          <MapPin className="w-3 h-3" />
                          Location Tagged
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-black text-slate-900 dark:text-white">${expense.amount.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(expense.id)}
                    className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    aria-label="Delete expense"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
