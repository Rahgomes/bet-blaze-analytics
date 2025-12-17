import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, Calendar } from 'lucide-react';
import { Bet } from '@/types/betting';
import { differenceInDays, format } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';

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
  const { t, language } = useTranslation();

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat(language === 'pt-br' ? 'pt-BR' : 'en-US', {
      style: 'currency',
      currency: language === 'pt-br' ? 'BRL' : 'USD',
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
            {t('analytics.goalTracking.title')}
          </CardTitle>
          {isComplete ? (
            <Badge variant="default" className="bg-green-600">
              {t('analytics.goalTracking.goalAchieved')}
            </Badge>
          ) : isExpired ? (
            <Badge variant="destructive">{t('analytics.goalTracking.goalExpired')}</Badge>
          ) : isOnTrack ? (
            <Badge variant="default">
              <TrendingUp className="mr-1 h-3 w-3" />
              {t('analytics.goalTracking.onTrack')}
            </Badge>
          ) : (
            <Badge variant="secondary">
              <TrendingDown className="mr-1 h-3 w-3" />
              {t('analytics.goalTracking.belowExpected')}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Barra de Progresso */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t('analytics.goalTracking.progress')}</span>
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
            <p className="text-xs text-muted-foreground">{t('analytics.goalTracking.current')}</p>
            <p className="text-lg font-bold">{formatCurrency(currentValue)}</p>
          </div>

          {/* Meta */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{t('analytics.goalTracking.target')}</p>
            <p className="text-lg font-bold">{formatCurrency(targetValue)}</p>
          </div>

          {/* Faltam */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{t('analytics.goalTracking.remaining')}</p>
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
                  {daysRemaining} {daysRemaining === 1
                    ? t('analytics.goalTracking.dayRemaining')
                    : t('analytics.goalTracking.daysRemaining')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('analytics.goalTracking.deadline')}: {format(targetDate,
                    language === 'pt-br' ? "dd 'de' MMMM 'de' yyyy" : "MMMM dd, yyyy",
                    { locale: language === 'pt-br' ? ptBR : enUS }
                  )}
                </p>
              </div>
            </div>

            {/* Projeção */}
            <div className="space-y-1 border-t pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{t('analytics.goalTracking.currentDailyAverage')}</span>
                <span className={cn(
                  "font-semibold",
                  dailyAverage > 0 ? "text-green-600" : "text-red-600"
                )}>
                  {formatCurrency(dailyAverage)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{t('analytics.goalTracking.requiredDailyAverage')}</span>
                <span className="font-semibold">
                  {formatCurrency(dailyAverageNeeded)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{t('analytics.goalTracking.finalProjection')}</span>
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
                <>✓ {t('analytics.goalTracking.onTrackMessage')}</>
              ) : dailyAverage > 0 ? (
                <>⚠ {t('analytics.goalTracking.needsImprovementMessage', {
                  amount: formatCurrency(dailyAverageNeeded - dailyAverage)
                })}</>
              ) : (
                <>⚠ {t('analytics.goalTracking.startBettingMessage')}</>
              )}
            </div>
          </div>
        )}

        {/* Mensagem de Meta Completa */}
        {isComplete && (
          <div className="rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 p-3">
            <p className="text-sm font-medium text-green-700 dark:text-green-400">
              🎉 {t('analytics.goalTracking.congratulationsMessage')}{' '}
              {daysRemaining > 0
                ? t('analytics.goalTracking.earlyCompletion', {
                    days: daysRemaining,
                    unit: daysRemaining === 1
                      ? t('analytics.goalTracking.dayRemaining').replace(' restante', '')
                      : t('analytics.goalTracking.daysRemaining').replace(' restantes', '')
                  })
                : '!'}
            </p>
          </div>
        )}

        {/* Mensagem de Meta Expirada */}
        {isExpired && !isComplete && (
          <div className="rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 p-3">
            <p className="text-sm font-medium text-red-700 dark:text-red-400">
              {t('analytics.goalTracking.expiredMessage', {
                amount: formatCurrency(remaining)
              })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
