import { StateCreator } from 'zustand';
import { Transaction } from '@/types/betting';

export interface TransactionsSlice {
  transactions: Transaction[];

  // Actions
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'balanceAfter'>, currentBankroll: number) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  setTransactions: (transactions: Transaction[]) => void;
}

export const createTransactionsSlice: StateCreator<
  TransactionsSlice,
  [],
  [],
  TransactionsSlice
> = (set, get) => ({
  transactions: [],

  addTransaction: (transactionData, currentBankroll) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: crypto.randomUUID(),
      balanceAfter: currentBankroll,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set(state => ({
      transactions: [...state.transactions, newTransaction]
    }));

    const updated = get().transactions;
    sessionStorage.setItem('betting_transactions', JSON.stringify(updated));
  },

  updateTransaction: (id, updates) => {
    set(state => ({
      transactions: state.transactions.map(t =>
        t.id === id
          ? { ...t, ...updates, updatedAt: new Date().toISOString() }
          : t
      )
    }));

    const updated = get().transactions;
    sessionStorage.setItem('betting_transactions', JSON.stringify(updated));
  },

  deleteTransaction: (id) => {
    set(state => ({
      transactions: state.transactions.filter(t => t.id !== id)
    }));

    const updated = get().transactions;
    sessionStorage.setItem('betting_transactions', JSON.stringify(updated));
  },

  setTransactions: (transactions) => set({ transactions }),
});
