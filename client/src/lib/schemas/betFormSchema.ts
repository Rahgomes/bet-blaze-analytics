import { z } from 'zod';

export const betLegSchema = z.object({
  amount: z.string().min(1, 'Valor é obrigatório'),
  odds: z.string().min(1, 'Odd é obrigatória'),

  homeTeam: z.string().min(1, 'Time mandante é obrigatório'),
  awayTeam: z.string().min(1, 'Time visitante é obrigatório'),
  sport: z.string().min(1, 'Esporte é obrigatório'),
  market: z.string().min(1, 'Mercado é obrigatório'),
  league: z.string(),
  matchTime: z.string(),
  isLive: z.boolean(),
  strategy: z.string(),

  hasBoost: z.boolean(),
  originalOdds: z.string(),
  boostPercentage: z.string(),
  usedCredits: z.boolean(),
  creditsAmount: z.string(),
  hasCashout: z.boolean(),
  cashoutValue: z.string(),
  cashoutTime: z.string(),
  hasEarlyPayout: z.boolean(),
  isRiskFree: z.boolean(),
  riskFreeAmount: z.string(),
  protectionTypes: z.array(z.string()),

  status: z.enum(['pending', 'won', 'lost', 'void']),
  finalScore: z.string(),
  resultTime: z.string(),
}).refine((data) => {
  if (data.hasBoost) {
    return data.originalOdds.length > 0 && data.boostPercentage.length > 0;
  }
  return true;
}, {
  message: 'Odds original e percentual de boost são obrigatórios quando boost está ativo',
  path: ['originalOdds'],
}).refine((data) => {
  if (data.usedCredits) {
    return data.creditsAmount.length > 0;
  }
  return true;
}, {
  message: 'Valor dos créditos é obrigatório quando créditos foram utilizados',
  path: ['creditsAmount'],
}).refine((data) => {
  if (data.hasCashout) {
    return data.cashoutValue.length > 0 && data.cashoutTime.length > 0;
  }
  return true;
}, {
  message: 'Valor e horário do cashout são obrigatórios',
  path: ['cashoutValue'],
}).refine((data) => {
  if (data.isRiskFree) {
    return data.riskFreeAmount.length > 0;
  }
  return true;
}, {
  message: 'Valor da aposta sem risco é obrigatório',
  path: ['riskFreeAmount'],
});

export const betFormSchema = z.object({
  bookmaker: z.string().min(1, 'Casa de apostas é obrigatória'),
  date: z.string().min(1, 'Data é obrigatória'),
  betType: z.enum(['simple', 'multiple']),
  multipleQuantity: z.string(),
  operationNumber: z.string(),
  description: z.string().min(1, 'Descrição é obrigatória'),
  stakeLogic: z.string(),
  tags: z.array(z.string()).max(5, 'Máximo de 5 tags permitidas'),
  legs: z.array(betLegSchema).min(1, 'Pelo menos uma leg é obrigatória'),
});

export type BetFormData = z.infer<typeof betFormSchema>;
export type BetLegData = z.infer<typeof betLegSchema>;
