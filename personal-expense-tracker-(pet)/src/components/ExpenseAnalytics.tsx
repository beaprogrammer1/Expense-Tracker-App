import React, { useMemo } from 'react';
import { db, auth } from '../firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { Expense, EXPENSE_CATEGORIES } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { motion } from 'motion/react';

export default function ExpenseAnalytics() {
  const [expenses, setExpenses] = React.useState<Expense[]>([]);

  React.useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(collection(db, 'users', auth.currentUser.uid, 'expenses'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const expenseData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Expense[];
      setExpenses(expenseData);
    });

    return () => unsubscribe();
  }, []);

  const categoryData = useMemo(() => {
    const totals = EXPENSE_CATEGORIES.reduce((acc, cat) => {
      acc[cat] = 0;
      return acc;
    }, {} as Record<string, number>);

    expenses.forEach(exp => {
      if (totals[exp.category] !== undefined) {
        totals[exp.category] += exp.amount;
      } else {
        totals['Other'] = (totals['Other'] || 0) + exp.amount;
      }
    });

    return Object.entries(totals)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0);
  }, [expenses]);

  const COLORS = ['#4f46e5', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
      >
        <h3 className="text-lg font-bold mb-6">Spending by Category</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
      >
        <h3 className="text-lg font-bold mb-6">Expense Distribution</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData}>
              <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
