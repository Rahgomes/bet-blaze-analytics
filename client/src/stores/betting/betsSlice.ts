import { StateCreator } from 'zustand';
import { Bet } from '@/types/betting';

export interface BetsSlice {
  bets: Bet[];
  loading: boolean;

  // Actions
  addBet: (bet: Omit<Bet, 'id' | 'createdAt' | 'updatedAt' | 'operationNumber'>) => Bet;
  updateBet: (id: string, updates: Partial<Bet>) => void;
  deleteBet: (id: string) => void;
  setBets: (bets: Bet[]) => void;
  setLoading: (loading: boolean) => void;
}

export const createBetsSlice: StateCreator<
  BetsSlice,
  [],
  [],
  BetsSlice
> = (set, get) => ({
  bets: [],
  loading: true,

  addBet: (betData) => {
    const bets = get().bets;
    const maxOp = bets.length > 0
      ? Math.max(...bets.map(b => b.operationNumber))
      : 0;

    const newBet: Bet = {
      ...betData,
      id: crypto.randomUUID(),
      operationNumber: maxOp + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set({ bets: [...bets, newBet] });
    sessionStorage.setItem('betting_bets', JSON.stringify([...bets, newBet]));
    return newBet;
  },

  updateBet: (id, updates) => {
    set(state => ({
      bets: state.bets.map(bet =>
        bet.id === id
          ? { ...bet, ...updates, updatedAt: new Date().toISOString() }
          : bet
      )
    }));

    const updatedBets = get().bets;
    sessionStorage.setItem('betting_bets', JSON.stringify(updatedBets));
  },

  deleteBet: (id) => {
    set(state => ({
      bets: state.bets.filter(bet => bet.id !== id)
    }));

    const updatedBets = get().bets;
    sessionStorage.setItem('betting_bets', JSON.stringify(updatedBets));
  },

  setBets: (bets) => set({ bets }),
  setLoading: (loading) => set({ loading }),
});
