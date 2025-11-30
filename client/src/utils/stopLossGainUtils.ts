import { StopMode } from '@/types/betting';

/**
 * Converts a currency amount to percentage of bankroll
 */
export function convertToPercentage(
  amountInCurrency: number,
  bankroll: number
): number {
  if (bankroll === 0) return 0;
  return (amountInCurrency / bankroll) * 100;
}

/**
 * Converts a percentage to currency amount based on bankroll
 */
export function convertToCurrency(
  percentage: number,
  bankroll: number
): number {
  return (percentage / 100) * bankroll;
}

/**
 * Gets display value and opposite value for a stop loss/gain field
 */
export function getDisplayValue(
  value: number,
  mode: StopMode,
  bankroll: number
): {
  display: string;
  oppositeValue: number;
  oppositeDisplay: string;
} {
  if (mode === 'currency') {
    const percentage = convertToPercentage(value, bankroll);
    return {
      display: `R$ ${value.toFixed(2)}`,
      oppositeValue: percentage,
      oppositeDisplay: `≈ ${percentage.toFixed(1)}% da banca`,
    };
  } else {
    const currency = convertToCurrency(value, bankroll);
    return {
      display: `${value.toFixed(1)}%`,
      oppositeValue: currency,
      oppositeDisplay: `≈ R$ ${currency.toFixed(2)}`,
    };
  }
}

/**
 * Converts a stop value from one mode to another
 */
export function convertStopValue(
  currentValue: number,
  fromMode: StopMode,
  toMode: StopMode,
  bankroll: number
): number {
  if (fromMode === toMode) return currentValue;

  if (fromMode === 'currency' && toMode === 'percentage') {
    return convertToPercentage(currentValue, bankroll);
  } else {
    return convertToCurrency(currentValue, bankroll);
  }
}
