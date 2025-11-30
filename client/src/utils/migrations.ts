import { BankrollSettings, CustomStake, StopLossGainConfig } from '@/types/betting';

/**
 * Migrates bankroll settings from old schema to new schema with custom stakes
 * and enhanced stop loss/gain configuration
 */
export function migrateBankrollSettings(oldSettings: any): BankrollSettings {
  // Check if already migrated
  if (oldSettings.customStakes && oldSettings.stopLossGain) {
    return oldSettings as BankrollSettings;
  }

  console.log('[Migration] Starting bankroll settings migration...');

  // Migrate stop loss/gain from old single values to new structure
  const stopLossGain: StopLossGainConfig = {
    dailyLoss: 50,
    dailyLossMode: 'currency' as const,
    dailyGain: 100,
    dailyGainMode: 'currency' as const,
    weeklyLoss: oldSettings.stopLossWeekly || 100,
    weeklyLossMode: 'currency' as const,
    weeklyGain: oldSettings.stopGainWeekly || 200,
    weeklyGainMode: 'currency' as const,
    monthlyLoss: oldSettings.stopLossMonthly || 300,
    monthlyLossMode: 'currency' as const,
    monthlyGain: oldSettings.stopGainMonthly || 500,
    monthlyGainMode: 'currency' as const,
  };

  // Create default stakes matching the current Dashboard hardcoded values
  const defaultStakes: CustomStake[] = [
    {
      id: crypto.randomUUID(),
      percentage: 0.5,
      labelMode: 'auto',
      label: 'Super Odd',
      color: '#9333ea', // purple
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      percentage: 1,
      labelMode: 'auto',
      label: 'Conservador',
      color: '#3b82f6', // blue
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      percentage: 2,
      labelMode: 'auto',
      label: 'Moderado',
      color: '#22c55e', // green
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      percentage: 3,
      labelMode: 'auto',
      label: 'Agressivo',
      color: '#f97316', // orange
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      percentage: 4,
      labelMode: 'auto',
      label: 'Alto Risco',
      color: '#ef4444', // red
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      percentage: 5,
      labelMode: 'auto',
      label: 'Máximo',
      color: '#64748b', // slate
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  console.log('[Migration] Created 6 default stakes');
  console.log('[Migration] Migration completed successfully');

  return {
    ...oldSettings,
    stopLossGain,
    customStakes: defaultStakes,
    maxStakesRecommended: 6,
  };
}
