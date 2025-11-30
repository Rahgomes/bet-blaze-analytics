import { CustomStake } from '@/types/betting';

/**
 * Generates an automatic label based on percentage ranges
 */
export function generateAutoLabel(percentage: number): string {
  if (percentage <= 0.5) return 'Super Conservador';
  if (percentage <= 1) return 'Conservador';
  if (percentage <= 1.5) return 'Moderado Baixo';
  if (percentage <= 2) return 'Moderado';
  if (percentage <= 2.5) return 'Moderado Alto';
  if (percentage <= 3) return 'Agressivo';
  if (percentage <= 3.5) return 'Agressivo Alto';
  if (percentage <= 4) return 'Alto Risco';
  if (percentage <= 4.5) return 'Alto Risco Máximo';
  if (percentage <= 5) return 'Máximo';
  return 'Crítico';
}

/**
 * Generates an automatic color based on percentage ranges
 */
export function generateAutoColor(percentage: number): string {
  if (percentage <= 0.5) return '#9333ea'; // purple
  if (percentage <= 1) return '#3b82f6';   // blue
  if (percentage <= 2) return '#22c55e';   // green
  if (percentage <= 3) return '#f97316';   // orange
  if (percentage <= 4) return '#ef4444';   // red
  if (percentage <= 5) return '#64748b';   // slate
  return '#991b1b';                        // dark red (critical)
}

/**
 * Sorts stakes by percentage in ascending order
 */
export function sortStakesByPercentage(stakes: CustomStake[]): CustomStake[] {
  return [...stakes].sort((a, b) => a.percentage - b.percentage);
}

/**
 * Validates a stake percentage value
 */
export function validateStakePercentage(
  percentage: number,
  existingStakes: CustomStake[],
  editingStakeId?: string
): { valid: boolean; error?: string } {
  if (percentage <= 0) {
    return { valid: false, error: 'Percentual deve ser maior que 0' };
  }

  if (percentage > 10) {
    return { valid: false, error: 'Percentual não pode exceder 10%' };
  }

  // Check for duplicates
  const duplicate = existingStakes.find(
    s => s.percentage === percentage && s.id !== editingStakeId
  );

  if (duplicate) {
    return {
      valid: false,
      error: `Já existe um stake com ${percentage}% (${duplicate.label})`
    };
  }

  return { valid: true };
}

/**
 * Calculates the stake amount in currency based on percentage and bankroll
 */
export function calculateStakeAmount(
  percentage: number,
  bankroll: number
): number {
  return (percentage / 100) * bankroll;
}
