export interface Bookmaker {
  id: string;
  name: string;
  color?: string;
}

export type BetType = 'simple' | 'multiple' | 'live' | 'system';
export type BetStatus = 'pending' | 'won' | 'lost' | 'void';

export interface Bet {
  id: string;
  operationNumber: number;
  bookmaker: string;
  date: string;
  betType: BetType;
  amount: number;
  odds: number;
  return: number;
  profit: number;
  status: BetStatus;
  description: string;
  stakeLogic?: string;
  isProtected?: boolean;
  isLive?: boolean;
  teams?: string[];
  competition?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BankrollSettings {
  initialBankroll: number;
  currentBankroll: number;
  targetPercentage: number;
  targetAmount: number;
  stopLossWeekly: number;
  stopGainWeekly: number;
  stopLossMonthly: number;
  stopGainMonthly: number;
  updatedAt: string;
}

export interface DailyStats {
  date: string;
  bets: number;
  totalStake: number;
  totalReturn: number;
  profit: number;
  profitPercentage: number;
}

export interface BookmakerStats {
  bookmaker: string;
  totalBets: number;
  totalStake: number;
  totalReturn: number;
  profit: number;
  roi: number;
  winRate: number;
}
