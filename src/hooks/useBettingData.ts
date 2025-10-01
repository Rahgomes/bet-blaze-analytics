import { useState, useEffect, useCallback } from 'react';
import { Bet, BankrollSettings, Bookmaker } from '@/types/betting';

const STORAGE_KEYS = {
  BETS: 'betting_bets',
  BANKROLL: 'betting_bankroll',
  BOOKMAKERS: 'betting_bookmakers',
};

const DEFAULT_BANKROLL: BankrollSettings = {
  initialBankroll: 1000,
  currentBankroll: 1000,
  targetPercentage: 20,
  targetAmount: 1200,
  stopLossWeekly: 100,
  stopGainWeekly: 200,
  stopLossMonthly: 300,
  stopGainMonthly: 500,
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
  const [loading, setLoading] = useState(true);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const storedBets = localStorage.getItem(STORAGE_KEYS.BETS);
      const storedBankroll = localStorage.getItem(STORAGE_KEYS.BANKROLL);
      const storedBookmakers = localStorage.getItem(STORAGE_KEYS.BOOKMAKERS);

      if (storedBets) setBets(JSON.parse(storedBets));
      if (storedBankroll) setBankroll(JSON.parse(storedBankroll));
      if (storedBookmakers) setBookmakers(JSON.parse(storedBookmakers));
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

  return {
    bets,
    bankroll,
    bookmakers,
    loading,
    addBet,
    updateBet,
    deleteBet,
    updateBankrollSettings,
    addBookmaker,
  };
}
