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
  league?: string;
  market?: string;
  strategies?: string[];
  matchTime?: string;
  sourceType?: 'manual' | 'tip' | 'import';
  sourceTipId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tipster {
  id: string;
  name: string;
  bio?: string;
  rating?: number;
  totalTips?: number;
  successRate?: number;
  createdAt: string;
}

export interface Tip {
  id: string;
  tipsterId: string;
  title: string;
  description: string;
  match: string;
  market: string;
  suggestedStake?: number;
  suggestedOdds: number;
  betType: BetType;
  confidence: 'low' | 'medium' | 'high';
  status: 'pending' | 'converted' | 'archived';
  date: string;
  notes?: string;
  convertedBetId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  name: string;
  competition?: string;
  notes?: string;
  isWatched: boolean;
  createdAt: string;
}

export interface GlossaryEntry {
  id: string;
  term: string;
  definition: string;
  category: string;
  language: 'en' | 'pt-br';
}

export interface UserSettings {
  language: 'en' | 'pt-br';
  alertsEnabled: boolean;
  exposureThreshold: number;
}

export interface BankrollSettings {
  initialBankroll: number;
  currentBankroll: number;
  targetMode: 'percentage' | 'fixed';
  targetPercentage: number;
  targetAmount: number;
  stopLossWeekly: number;
  stopGainWeekly: number;
  stopLossMonthly: number;
  stopGainMonthly: number;
  leagues?: string[];
  markets?: string[];
  strategies?: string[];
  language?: 'en' | 'pt-br';
  alertsEnabled?: boolean;
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
