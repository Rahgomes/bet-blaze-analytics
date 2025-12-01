import { useState, useEffect, useCallback } from 'react';
import { Bet, BankrollSettings, Bookmaker, Transaction } from '@/types/betting';
import { ImportSession } from '@/types/import';
import { migrateBankrollSettings } from '@/utils/migrations';

const STORAGE_KEYS = {
  BETS: 'betting_bets',
  BANKROLL: 'betting_bankroll',
  BOOKMAKERS: 'betting_bookmakers',
  TRANSACTIONS: 'betting_transactions',
  IMPORT_SESSIONS: 'betting_import_sessions',
};

const DEFAULT_BANKROLL: BankrollSettings = {
  initialBankroll: 1000,
  currentBankroll: 1000,
  targetMode: 'percentage',
  targetPercentage: 20,
  targetAmount: 1200,
  stopLossWeekly: 100,
  stopGainWeekly: 200,
  stopLossMonthly: 300,
  stopGainMonthly: 500,
  leagues: ['Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1', 'Champions League'],
  markets: ['Match Winner', 'Over/Under 2.5', 'BTTS', 'Asian Handicap', 'Double Chance', 'Draw No Bet'],
  strategies: ['DC', 'DNB', 'Asian Handicap', 'Kelly Criterion', 'Martingale', 'Fixed Stake'],
  updatedAt: new Date().toISOString(),
};

const DEFAULT_BOOKMAKERS: Bookmaker[] = [
  { id: 'bet365', name: 'Bet365', color: '#00703C' },
  { id: 'seu_bet', name: 'Seu.bet', color: '#FF6B00' },
];

export function useBettingData() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [bankroll, setBankroll] = useState<BankrollSettings>(DEFAULT_BANKROLL);
  const [bookmakers, setBookmakers] = useState<Bookmaker[]>(DEFAULT_BOOKMAKERS);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [importSessions, setImportSessions] = useState<ImportSession[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const storedBets = localStorage.getItem(STORAGE_KEYS.BETS);
      const storedBankroll = localStorage.getItem(STORAGE_KEYS.BANKROLL);
      const storedBookmakers = localStorage.getItem(STORAGE_KEYS.BOOKMAKERS);
      const storedTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      const storedImportSessions = localStorage.getItem(STORAGE_KEYS.IMPORT_SESSIONS);

      if (storedBets) setBets(JSON.parse(storedBets));

      // Migrate bankroll settings if needed
      if (storedBankroll) {
        const parsed = JSON.parse(storedBankroll);
        const migrated = migrateBankrollSettings(parsed);
        setBankroll(migrated);

        // Save migrated version back if it changed
        if (JSON.stringify(parsed) !== JSON.stringify(migrated)) {
          localStorage.setItem(STORAGE_KEYS.BANKROLL, JSON.stringify(migrated));
          console.log('[useBettingData] Bankroll settings migrated successfully');
        }
      }

      if (storedBookmakers) setBookmakers(JSON.parse(storedBookmakers));
      if (storedTransactions) setTransactions(JSON.parse(storedTransactions));
      if (storedImportSessions) setImportSessions(JSON.parse(storedImportSessions));
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save bets to localStorage
  const saveBets = useCallback((newBets: Bet[]) => {
    setBets(newBets);
    localStorage.setItem(STORAGE_KEYS.BETS, JSON.stringify(newBets));
  }, []);

  // Save bankroll to localStorage
  const saveBankroll = useCallback((newBankroll: BankrollSettings) => {
    setBankroll(newBankroll);
    localStorage.setItem(STORAGE_KEYS.BANKROLL, JSON.stringify(newBankroll));
  }, []);

  // Save bookmakers to localStorage
  const saveBookmakers = useCallback((newBookmakers: Bookmaker[]) => {
    setBookmakers(newBookmakers);
    localStorage.setItem(STORAGE_KEYS.BOOKMAKERS, JSON.stringify(newBookmakers));
  }, []);

  // Add a new bet
  const addBet = useCallback((bet: Omit<Bet, 'id' | 'createdAt' | 'updatedAt' | 'operationNumber'>) => {
    const newBet: Bet = {
      ...bet,
      id: crypto.randomUUID(),
      operationNumber: bets.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveBets([...bets, newBet]);
    
    // Update bankroll
    const newBankroll = {
      ...bankroll,
      currentBankroll: bankroll.currentBankroll + newBet.profit,
      updatedAt: new Date().toISOString(),
    };
    saveBankroll(newBankroll);
  }, [bets, bankroll, saveBets, saveBankroll]);

  // Update an existing bet
  const updateBet = useCallback((id: string, updates: Partial<Bet>) => {
    const oldBet = bets.find(b => b.id === id);
    if (!oldBet) return;

    const updatedBets = bets.map(bet =>
      bet.id === id
        ? { ...bet, ...updates, updatedAt: new Date().toISOString() }
        : bet
    );
    saveBets(updatedBets);

    // Recalculate bankroll if profit changed
    if (updates.profit !== undefined && updates.profit !== oldBet.profit) {
      const profitDiff = updates.profit - oldBet.profit;
      const newBankroll = {
        ...bankroll,
        currentBankroll: bankroll.currentBankroll + profitDiff,
        updatedAt: new Date().toISOString(),
      };
      saveBankroll(newBankroll);
    }
  }, [bets, bankroll, saveBets, saveBankroll]);

  // Delete a bet
  const deleteBet = useCallback((id: string) => {
    const bet = bets.find(b => b.id === id);
    if (!bet) return;

    saveBets(bets.filter(b => b.id !== id));
    
    // Update bankroll
    const newBankroll = {
      ...bankroll,
      currentBankroll: bankroll.currentBankroll - bet.profit,
      updatedAt: new Date().toISOString(),
    };
    saveBankroll(newBankroll);
  }, [bets, bankroll, saveBets, saveBankroll]);

  // Update bankroll settings
  const updateBankrollSettings = useCallback((settings: Partial<BankrollSettings>) => {
    const newBankroll = {
      ...bankroll,
      ...settings,
      updatedAt: new Date().toISOString(),
    };
    saveBankroll(newBankroll);
  }, [bankroll, saveBankroll]);

  // Add bookmaker
  const addBookmaker = useCallback((bookmaker: Omit<Bookmaker, 'id'>) => {
    const newBookmaker: Bookmaker = {
      ...bookmaker,
      id: crypto.randomUUID(),
    };
    saveBookmakers([...bookmakers, newBookmaker]);
  }, [bookmakers, saveBookmakers]);

  // Save transactions to localStorage
  const saveTransactions = useCallback((newTransactions: Transaction[]) => {
    setTransactions(newTransactions);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(newTransactions));
  }, []);

  // Add transaction
  const addTransaction = useCallback((transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'balanceAfter'>) => {
    const newBalanceAfter = bankroll.currentBankroll + (transaction.type === 'deposit' ? transaction.amount : -transaction.amount);
    
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
      balanceAfter: newBalanceAfter,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    saveTransactions([...transactions, newTransaction]);
    
    // Update bankroll
    const newBankroll = {
      ...bankroll,
      currentBankroll: newBalanceAfter,
      updatedAt: new Date().toISOString(),
    };
    saveBankroll(newBankroll);
  }, [transactions, bankroll, saveTransactions, saveBankroll]);

  // Update transaction
  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    const updatedTransactions = transactions.map(transaction =>
      transaction.id === id
        ? { ...transaction, ...updates, updatedAt: new Date().toISOString() }
        : transaction
    );
    saveTransactions(updatedTransactions);
  }, [transactions, saveTransactions]);

  // Delete transaction
  const deleteTransaction = useCallback((id: string) => {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;

    saveTransactions(transactions.filter(t => t.id !== id));

    // Recalculate bankroll
    const amountChange = transaction.type === 'deposit' ? -transaction.amount : transaction.amount;
    const newBankroll = {
      ...bankroll,
      currentBankroll: bankroll.currentBankroll + amountChange,
      updatedAt: new Date().toISOString(),
    };
    saveBankroll(newBankroll);
  }, [transactions, bankroll, saveTransactions, saveBankroll]);

  // Save import sessions to localStorage
  const saveImportSessions = useCallback((newSessions: ImportSession[]) => {
    setImportSessions(newSessions);
    localStorage.setItem(STORAGE_KEYS.IMPORT_SESSIONS, JSON.stringify(newSessions));
  }, []);

  // Add import session
  const addImportSession = useCallback((session: ImportSession) => {
    const newSessions = [...importSessions, session];
    saveImportSessions(newSessions);
  }, [importSessions, saveImportSessions]);

  // Get all import sessions (sorted by date, most recent first)
  const getImportSessions = useCallback(() => {
    return [...importSessions].sort((a, b) =>
      new Date(b.importDate).getTime() - new Date(a.importDate).getTime()
    );
  }, [importSessions]);

  // Get import session by ID
  const getImportSessionById = useCallback((id: string): ImportSession | null => {
    return importSessions.find(s => s.id === id) || null;
  }, [importSessions]);

  // Delete import session (optional - for future use)
  const deleteImportSession = useCallback((id: string) => {
    saveImportSessions(importSessions.filter(s => s.id !== id));
  }, [importSessions, saveImportSessions]);

  return {
    bets,
    bankroll,
    bookmakers,
    transactions,
    importSessions,
    loading,
    addBet,
    updateBet,
    deleteBet,
    updateBankrollSettings,
    addBookmaker,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addImportSession,
    getImportSessions,
    getImportSessionById,
    deleteImportSession,
  };
}
