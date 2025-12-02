import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComparisonMetricCardProps {
  title: string;
  currentValue: number;
  previousValue: number;
  format: 'currency' | 'percentage' | 'number';
  icon?: ReactNode;
  invertColors?: boolean;
}

export function ComparisonMetricCard({
  title,
  currentValue,
  previousValue,
  format,
  icon,
  invertColors = false,
}: ComparisonMetricCardProps) {
  const formatValue = (value: number): string => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'number':
        return new Intl.NumberFormat('pt-BR').format(value);
    }
  };

  const calculateDifference = (): { value: number; percentage: number } => {
    const difference = currentValue - previousValue;
    const percentage = previousValue !== 0
      ? ((currentValue - previousValue) / Math.abs(previousValue)) * 100
      : 0;

    return { value: difference, percentage };
  };

  const diff = calculateDifference();
  const isPositive = diff.value > 0;
  const isNegative = diff.value < 0;
  const isNeutral = diff.value === 0;

  // Determinar cores com base em invertColors
  const shouldBeGreen = invertColors ? isNegative : isPositive;
  const shouldBeRed = invertColors ? isPositive : isNegative;

  const getBadgeVariant = (): 'default' | 'secondary' | 'destructive' => {
    if (isNeutral) return 'secondary';
    if (shouldBeGreen) return 'default';
    if (shouldBeRed) return 'destructive';
    return 'secondary';
  };

  const getTrendIcon = () => {
    if (isNeutral) return <Minus className="h-3 w-3" />;
    if (isPositive) return <ArrowUp className="h-3 w-3" />;
    return <ArrowDown className="h-3 w-3" />;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {/* Valor atual em destaque */}
          <div className="text-2xl font-bold">{formatValue(currentValue)}</div>

          {/* Badge com diferença percentual */}
          <div className="flex items-center gap-2">
            <Badge
              variant={getBadgeVariant()}
              className="flex items-center gap-1"
            >
              {getTrendIcon()}
              <span>
                {!isNeutral && (isPositive ? '+' : '')}
                {diff.percentage.toFixed(1)}%
              </span>
            </Badge>

            {/* Texto comparativo */}
            <span className="text-xs text-muted-foreground">
              vs período anterior
            </span>
          </div>

          {/* Valor anterior */}
          <div className="text-xs text-muted-foreground">
            Período anterior: {formatValue(previousValue)}
          </div>

          {/* Diferença absoluta */}
          {!isNeutral && (
            <div className={cn(
              "text-xs font-medium",
              shouldBeGreen && "text-green-600",
              shouldBeRed && "text-red-600"
            )}>
              {isPositive ? '+' : ''}{formatValue(diff.value)} em relação ao período anterior
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
