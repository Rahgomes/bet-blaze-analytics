import { Bet } from '@/types/betting';

export type TimePeriod = 'today' | 'week' | 'month' | 'year' | 'all';

export const filterBetsByPeriod = (bets: Bet[], period: TimePeriod): Bet[] => {
  if (period === 'all') return bets;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  let cutoffDate: Date;
  switch (period) {
    case 'today':
      cutoffDate = startOfToday;
      break;
    case 'week':
      cutoffDate = startOfWeek;
      break;
    case 'month':
      cutoffDate = startOfMonth;
      break;
    case 'year':
      cutoffDate = startOfYear;
      break;
    default:
      return bets;
  }

  return bets.filter(bet => new Date(bet.date) >= cutoffDate);
};

export const calculateStats = (bets: Bet[]) => {
  const totalProfit = bets.reduce((sum, bet) => sum + bet.profit, 0);
  const totalStake = bets.reduce((sum, bet) => sum + bet.amount, 0);
  const roi = totalStake > 0 ? (totalProfit / totalStake) * 100 : 0;
  const wonBets = bets.filter(b => b.status === 'won').length;
  const winRate = bets.length > 0 ? (wonBets / bets.length) * 100 : 0;

  return { totalProfit, totalStake, roi, wonBets, winRate };
};
