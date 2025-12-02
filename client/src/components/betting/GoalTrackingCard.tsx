import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, Calendar } from 'lucide-react';
import { Bet } from '@/types/betting';
import { differenceInDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface GoalTrackingCardProps {
  currentValue: number;
  targetValue: number;
  targetDate: Date;
  currentBets: Bet[];
  startValue?: number;
}

export function GoalTrackingCard({
  currentValue,
  targetValue,
  targetDate,
  currentBets,
  startValue = 0,
}: GoalTrackingCardProps) {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Cálculos de progresso
  const progressValue = currentValue - startValue;
  const targetProgress = targetValue - startValue;
  const progressPercentage = targetProgress > 0
    ? (progressValue / targetProgress) * 100
    : 0;
  const remaining = targetValue - currentValue;
  const daysRemaining = differenceInDays(targetDate, new Date());
  const isExpired = daysRemaining < 0;

  // Cálculos de projeção baseados em histórico
  const totalProfit = currentBets.reduce((sum, bet) => sum + bet.profit, 0);
  const daysElapsed = currentBets.length > 0
    ? differenceInDays(
        new Date(),
        new Date(Math.min(...currentBets.map(b => new Date(b.date).getTime())))
      )
    : 1;

  const dailyAverage = daysElapsed > 0 ? totalProfit / daysElapsed : 0;
  const projectedValue = currentValue + (dailyAverage * Math.max(daysRemaining, 0));
  const dailyAverageNeeded = daysRemaining > 0 ? remaining / daysRemaining : 0;

  // Status da meta
  const isOnTrack = projectedValue >= targetValue;
  const isComplete = currentValue >= targetValue;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Acompanhamento de Meta
          </CardTitle>
          {isComplete ? (
            <Badge variant="default" className="bg-green-600">
              Meta Alcançada!
            </Badge>
          ) : isExpired ? (
            <Badge variant="destructive">Meta Expirada</Badge>
          ) : isOnTrack ? (
            <Badge variant="default">
              <TrendingUp className="mr-1 h-3 w-3" />
              No Caminho Certo
            </Badge>
          ) : (
            <Badge variant="secondary">
              <TrendingDown className="mr-1 h-3 w-3" />
              Abaixo do Esperado
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Barra de Progresso */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-semibold">
              {Math.min(progressPercentage, 100).toFixed(1)}%
            </span>
          </div>
          <Progress
            value={Math.min(progressPercentage, 100)}
            className="h-3"
          />
        </div>

        {/* Grid de Métricas */}
        <div className="grid grid-cols-3 gap-4">
          {/* Valor Atual */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Atual</p>
            <p className="text-lg font-bold">{formatCurrency(currentValue)}</p>
          </div>

          {/* Meta */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Meta</p>
            <p className="text-lg font-bold">{formatCurrency(targetValue)}</p>
          </div>

          {/* Faltam */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Faltam</p>
            <p className={cn(
              "text-lg font-bold",
              isComplete ? "text-green-600" : "text-foreground"
            )}>
              {formatCurrency(Math.max(remaining, 0))}
            </p>
          </div>
        </div>

        {/* Box de Projeção */}
        {!isComplete && !isExpired && (
          <div className={cn(
            "rounded-lg border p-3 space-y-2",
            isOnTrack
              ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900"
              : "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-900"
          )}>
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">
                  {daysRemaining} {daysRemaining === 1 ? 'dia restante' : 'dias restantes'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Prazo: {format(targetDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>

            {/* Projeção */}
            <div className="space-y-1 border-t pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Média diária atual:</span>
                <span className={cn(
                  "font-semibold",
                  dailyAverage > 0 ? "text-green-600" : "text-red-600"
                )}>
                  {formatCurrency(dailyAverage)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Média diária necessária:</span>
                <span className="font-semibold">
                  {formatCurrency(dailyAverageNeeded)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Projeção final:</span>
                <span className={cn(
                  "font-semibold",
                  isOnTrack ? "text-green-600" : "text-yellow-600"
                )}>
                  {formatCurrency(projectedValue)}
                </span>
              </div>
            </div>

            {/* Insight */}
            <div className={cn(
              "text-xs font-medium pt-2 border-t",
              isOnTrack ? "text-green-700 dark:text-green-400" : "text-yellow-700 dark:text-yellow-400"
            )}>
              {isOnTrack ? (
                <>✓ Mantendo o ritmo atual, você deve atingir sua meta!</>
              ) : dailyAverage > 0 ? (
                <>⚠ Você precisa aumentar sua média diária em {formatCurrency(dailyAverageNeeded - dailyAverage)} para atingir a meta.</>
              ) : (
                <>⚠ Comece a apostar para progredir em direção à sua meta!</>
              )}
            </div>
          </div>
        )}

        {/* Mensagem de Meta Completa */}
        {isComplete && (
          <div className="rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 p-3">
            <p className="text-sm font-medium text-green-700 dark:text-green-400">
              🎉 Parabéns! Você atingiu sua meta{' '}
              {daysRemaining > 0
                ? `com ${daysRemaining} ${daysRemaining === 1 ? 'dia' : 'dias'} de antecedência!`
                : '!'}
            </p>
          </div>
        )}

        {/* Mensagem de Meta Expirada */}
        {isExpired && !isComplete && (
          <div className="rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 p-3">
            <p className="text-sm font-medium text-red-700 dark:text-red-400">
              O prazo para esta meta expirou. Faltaram {formatCurrency(remaining)} para atingi-la.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
