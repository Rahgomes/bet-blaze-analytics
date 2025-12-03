import { BettingStore } from './index';
import { Bet } from '@/types/betting';
import { isToday, isThisWeek, isThisMonth } from 'date-fns';

// Helper para calcular estatísticas
export const calculateStats = (bets: Bet[]) => {
  const totalProfit = bets.reduce((sum, bet) => sum + bet.profit, 0);
  const totalStake = bets.reduce((sum, bet) => sum + bet.amount, 0);
  const roi = totalStake > 0 ? (totalProfit / totalStake) * 100 : 0;
  const wonBets = bets.filter(b => b.status === 'won').length;
  const winRate = bets.length > 0 ? (wonBets / bets.length) * 100 : 0;

  return { totalProfit, totalStake, roi, winRate, totalBets: bets.length };
};

// Selectors diretos (para usar com useBettingStore)
export const selectTodayBets = (state: BettingStore) =>
  state.bets.filter(bet => isToday(new Date(bet.date)));

export const selectWeekBets = (state: BettingStore) =>
  state.bets.filter(bet => isThisWeek(new Date(bet.date), { weekStartsOn: 0 }));

export const selectMonthBets = (state: BettingStore) =>
  state.bets.filter(bet => isThisMonth(new Date(bet.date)));

export const selectTodayStats = (state: BettingStore) =>
  calculateStats(selectTodayBets(state));

export const selectWeekStats = (state: BettingStore) =>
  calculateStats(selectWeekBets(state));

export const selectMonthStats = (state: BettingStore) =>
  calculateStats(selectMonthBets(state));
