import { StopMode } from '@/types/betting';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getDisplayValue } from '@/utils/stopLossGainUtils';
import { HelpCircle } from 'lucide-react';

interface StopLossGainFieldProps {
  label: string;
  value: number;
  mode: StopMode;
  onValueChange: (value: number) => void;
  onModeChange: (mode: StopMode) => void;
  currentBankroll: number;
  type: 'loss' | 'gain';
  tooltip: string;
}

export function StopLossGainField({
  label,
  value,
  mode,
  onValueChange,
  onModeChange,
  currentBankroll,
  type,
  tooltip,
}: StopLossGainFieldProps) {
  const { oppositeDisplay } = getDisplayValue(value, mode, currentBankroll);
  const colorClass = type === 'loss' ? 'text-red-600' : 'text-green-600';

  const toggleMode = () => {
    const newMode = mode === 'currency' ? 'percentage' : 'currency';
    onModeChange(newMode);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={label} className="flex items-center gap-2">
          {label}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Label>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleMode}
          className="h-7 px-2 text-xs"
        >
          {mode === 'currency' ? 'R$' : '%'} ▼
        </Button>
      </div>
      <div className="relative">
        {mode === 'currency' && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            R$
          </span>
        )}
        <Input
          id={label}
          type="number"
          step={mode === 'currency' ? '0.01' : '0.1'}
          min="0"
          value={value}
          onChange={(e) => onValueChange(parseFloat(e.target.value) || 0)}
          className={mode === 'currency' ? 'pl-10' : ''}
        />
        {mode === 'percentage' && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            %
          </span>
        )}
      </div>
      <p className={`text-xs ${colorClass}`}>
        {oppositeDisplay}
      </p>
    </div>
  );
}
