import { Bet, Transaction } from '@/types/betting';

/**
 * Calculate linear projection for a given number of months
 * Formula: monthlyRate * numberOfMonths
 *
 * @param monthlyPercentage - Monthly growth percentage (e.g., 5 for 5%)
 * @param months - Number of months to project
 * @param currentBankroll - Current bankroll amount
 * @returns Object with percentage, projected bankroll, and estimated profit
 */
export function calculateLinearProjection(
  monthlyPercentage: number,
  months: number,
  currentBankroll: number
): { percentage: number; bankroll: number; profit: number } {
  const totalPercentage = monthlyPercentage * months;
  const profit = (currentBankroll * totalPercentage) / 100;
  const projectedBankroll = currentBankroll + profit;

  return {
    percentage: totalPercentage,
    bankroll: projectedBankroll,
    profit: profit
  };
}

/**
 * Calculate compound projection for a given number of months
 * Formula: (1 + rate)^months - 1
 *
 * @param monthlyPercentage - Monthly growth percentage (e.g., 5 for 5%)
 * @param months - Number of months to project
 * @param currentBankroll - Current bankroll amount
 * @returns Object with percentage, projected bankroll, and estimated profit
 */
export function calculateCompoundProjection(
  monthlyPercentage: number,
  months: number,
  currentBankroll: number
): { percentage: number; bankroll: number; profit: number } {
  const rate = monthlyPercentage / 100;
  const totalPercentage = (Math.pow(1 + rate, months) - 1) * 100;
  const profit = (currentBankroll * totalPercentage) / 100;
  const projectedBankroll = currentBankroll + profit;

  return {
    percentage: totalPercentage,
    bankroll: projectedBankroll,
    profit: profit
  };
}

/**
 * Calculate pure betting ROI (Return on Investment)
 * ROI = Total Profit / Total Stake
 *
 * @param bets - Array of bets
 * @returns Object with ROI metrics
 */
export function calculateBettingROI(bets: Bet[]): {
  roi: number;
  roiPercentage: number;
  totalStake: number;
  totalProfit: number;
} {
  const totalStake = bets.reduce((sum, bet) => sum + bet.amount, 0);
  const totalProfit = bets.reduce((sum, bet) => sum + bet.profit, 0);
  const roi = totalProfit;
  const roiPercentage = totalStake > 0 ? (totalProfit / totalStake) * 100 : 0;

  return { roi, roiPercentage, totalStake, totalProfit };
}

/**
 * Calculate total bankroll growth including deposits and withdrawals
 *
 * @param initialBankroll - Initial bankroll amount
 * @param currentBankroll - Current bankroll amount
 * @param totalDeposits - Total deposits made
 * @param totalWithdrawals - Total withdrawals made
 * @returns Object with growth metrics
 */
export function calculateTotalGrowth(
  initialBankroll: number,
  currentBankroll: number,
  totalDeposits: number,
  totalWithdrawals: number
): {
  growth: number;
  growthPercentage: number;
  effectiveInitial: number;
} {
  // Effective initial = initial + deposits - withdrawals
  const effectiveInitial = initialBankroll + totalDeposits - totalWithdrawals;
  const growth = currentBankroll - effectiveInitial;
  const growthPercentage = effectiveInitial > 0
    ? (growth / effectiveInitial) * 100
    : 0;

  return {
    growth,
    growthPercentage,
    effectiveInitial
  };
}

/**
 * Filter bets and transactions by current month
 *
 * @param bets - Array of bets
 * @param transactions - Array of transactions
 * @returns Object with current month data
 */
export function getCurrentMonthData(
  bets: Bet[],
  transactions: Transaction[]
): {
  monthBets: Bet[];
  monthDeposits: Transaction[];
  monthWithdrawals: Transaction[];
} {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const monthBets = bets.filter(bet => new Date(bet.date) >= startOfMonth);
  const monthDeposits = transactions.filter(
    t => t.type === 'deposit' && new Date(t.dateTime) >= startOfMonth
  );
  const monthWithdrawals = transactions.filter(
    t => t.type === 'withdrawal' && new Date(t.dateTime) >= startOfMonth
  );

  return { monthBets, monthDeposits, monthWithdrawals };
}

/**
 * Calculate current month progress vs monthly goal
 *
 * @param bets - Array of bets
 * @param transactions - Array of transactions
 * @param monthlyTargetPercentage - Monthly target percentage
 * @param bankrollAtMonthStart - Bankroll value at start of month
 * @returns Object with monthly progress metrics
 */
export function calculateMonthlyProgress(
  bets: Bet[],
  transactions: Transaction[],
  monthlyTargetPercentage: number,
  bankrollAtMonthStart: number
): {
  currentProgress: number;
  currentProgressPercentage: number;
  targetAmount: number;
  isOnTrack: boolean;
  daysInMonth: number;
  daysElapsed: number;
  expectedProgressPercentage: number;
} {
  const { monthBets } = getCurrentMonthData(bets, transactions);

  // Calculate actual progress this month
  const monthProfit = monthBets.reduce((sum, bet) => sum + bet.profit, 0);
  const currentProgressPercentage = bankrollAtMonthStart > 0
    ? (monthProfit / bankrollAtMonthStart) * 100
    : 0;

  // Calculate expected progress based on days elapsed
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const daysInMonth = endOfMonth.getDate();
  const daysElapsed = now.getDate();

  // Expected progress is proportional to days elapsed
  const expectedProgressPercentage = (monthlyTargetPercentage * daysElapsed) / daysInMonth;
  const isOnTrack = currentProgressPercentage >= expectedProgressPercentage;

  const targetAmount = (bankrollAtMonthStart * monthlyTargetPercentage) / 100;

  return {
    currentProgress: monthProfit,
    currentProgressPercentage,
    targetAmount,
    isOnTrack,
    daysInMonth,
    daysElapsed,
    expectedProgressPercentage
  };
}

/**
 * Get bankroll value at start of current month
 * Works backwards from current bankroll by subtracting month's transactions
 *
 * @param currentBankroll - Current bankroll amount
 * @param bets - Array of bets
 * @param transactions - Array of transactions
 * @returns Estimated bankroll at month start
 */
export function getBankrollAtMonthStart(
  currentBankroll: number,
  bets: Bet[],
  transactions: Transaction[]
): number {
  const { monthBets, monthDeposits, monthWithdrawals } = getCurrentMonthData(bets, transactions);

  // Work backwards from current bankroll
  const monthBetProfit = monthBets.reduce((sum, bet) => sum + bet.profit, 0);
  const monthDepositsTotal = monthDeposits.reduce((sum, t) => sum + t.amount, 0);
  const monthWithdrawalsTotal = monthWithdrawals.reduce((sum, t) => sum + t.amount, 0);

  return currentBankroll - monthBetProfit - monthDepositsTotal + monthWithdrawalsTotal;
}
