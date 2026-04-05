export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  theme: 'light' | 'dark';
  createdAt: string;
}

export interface Expense {
  id: string;
  uid: string;
  title: string;
  amount: number;
  category: string;
  timestamp: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  createdAt: string;
}

export type ExpenseCategory = 'Food' | 'Transport' | 'Shopping' | 'Entertainment' | 'Health' | 'Utilities' | 'Other';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Transport',
  'Shopping',
  'Entertainment',
  'Health',
  'Utilities',
  'Other'
];
