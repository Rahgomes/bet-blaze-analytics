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

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  dateTime: string;
  title?: string;
  description?: string;
  balanceAfter: number;
  createdAt: string;
  updatedAt: string;
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

// Custom Stakes System
export type StakeLabelMode = 'auto' | 'predefined' | 'custom';

export const PREDEFINED_STAKE_LABELS = [
  'Conservador',
  'Moderado',
  'Agressivo',
  'Alto Risco',
  'Super Odd',
  'Máximo',
  'Value Bet',
  'Linha Segura',
  'Experimental',
  'Alta Convicção'
] as const;

export type PredefinedStakeLabel = typeof PREDEFINED_STAKE_LABELS[number];

export interface CustomStake {
  id: string;
  percentage: number;          // e.g., 1.5 for 1.5%
  labelMode: StakeLabelMode;
  label: string;               // Display label
  color: string;               // Hex color code
  createdAt: string;
  updatedAt: string;
}

// Stop Loss/Gain Configuration
export type StopMode = 'currency' | 'percentage';

export interface StopLossGainConfig {
  dailyLoss: number;
  dailyLossMode: StopMode;
  dailyGain: number;
  dailyGainMode: StopMode;
  weeklyLoss: number;
  weeklyLossMode: StopMode;
  weeklyGain: number;
  weeklyGainMode: StopMode;
  monthlyLoss: number;
  monthlyLossMode: StopMode;
  monthlyGain: number;
  monthlyGainMode: StopMode;
}

export interface BankrollSettings {
  initialBankroll: number;
  currentBankroll: number;
  targetMode: 'percentage' | 'fixed';
  targetPercentage: number;
  targetAmount: number;

  // Legacy fields (deprecated - kept for migration)
  stopLossWeekly: number;
  stopGainWeekly: number;
  stopLossMonthly: number;
  stopGainMonthly: number;

  // New: Enhanced stop loss/gain
  stopLossGain?: StopLossGainConfig;

  // New: Custom stakes system
  customStakes?: CustomStake[];
  maxStakesRecommended?: number;  // Default: 6

  leagues?: string[];
  markets?: string[];
  strategies?: string[];
  language?: 'en' | 'pt-br';
  alertsEnabled?: boolean;
  projectionMode?: 'linear' | 'compound';
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
