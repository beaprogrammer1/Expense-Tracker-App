import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import Layout from './Layout';
import Auth from './Auth';
import ExpenseForm from './ExpenseForm';
import ExpenseList from './ExpenseList';
import ExpenseAnalytics from './ExpenseAnalytics';
import { LayoutDashboard, PlusCircle, History, PieChart as PieChartIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

type Tab = 'dashboard' | 'add' | 'history' | 'analytics';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'add', label: 'Add Expense', icon: PlusCircle },
    { id: 'history', label: 'History', icon: History },
    { id: 'analytics', label: 'Analytics', icon: PieChartIcon },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex gap-2 sm:gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-medium",
                activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <ExpenseForm />
              </div>
              <div className="lg:col-span-2 space-y-8">
                <ExpenseAnalytics />
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
                  <ExpenseList />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'add' && (
            <div className="max-w-2xl mx-auto">
              <ExpenseForm />
            </div>
          )}

          {activeTab === 'history' && (
            <div className="max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold mb-6">Expense History</h3>
              <ExpenseList />
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-8">
              <h3 className="text-2xl font-bold mb-6">Spending Insights</h3>
              <ExpenseAnalytics />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
