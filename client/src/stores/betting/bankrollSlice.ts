import { StateCreator } from 'zustand';
import { BankrollSettings } from '@/types/betting';

export interface BankrollSlice {
  bankroll: BankrollSettings;

  // Actions
  updateBankrollSettings: (updates: Partial<BankrollSettings>) => void;
  setBankroll: (bankroll: BankrollSettings) => void;
}

export const createBankrollSlice: StateCreator<
  BankrollSlice,
  [],
  [],
  BankrollSlice
> = (set, get) => ({
  bankroll: {
    initialBankroll: 0,
    currentBankroll: 0,
    targetMode: 'percentage',
    targetPercentage: 10,
    targetAmount: 0,
    stopLossWeekly: 0,
    stopGainWeekly: 0,
    stopLossMonthly: 0,
    stopGainMonthly: 0,
    customStakes: [],
    maxStakesRecommended: 6,
    leagues: [],
    markets: [],
    strategies: [],
    language: 'pt-br',
    alertsEnabled: true,
    projectionMode: 'linear',
    updatedAt: new Date().toISOString(),
  },

  updateBankrollSettings: (updates) => {
    const updated = {
      ...get().bankroll,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    set({ bankroll: updated });
    localStorage.setItem('betting_bankroll', JSON.stringify(updated));
  },

  setBankroll: (bankroll) => {
    const merged: BankrollSettings = {
      customStakes: [],
      maxStakesRecommended: 6,
      leagues: [],
      markets: [],
      strategies: [],
      language: 'pt-br' as const,
      alertsEnabled: true,
      projectionMode: 'linear' as const,
      ...bankroll,
    };
    set({ bankroll: merged });
    localStorage.setItem('betting_bankroll', JSON.stringify(merged));
  },
});
