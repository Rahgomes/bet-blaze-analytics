import { ExposureMetrics } from '@/utils/exposureCalculations';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ExposureSummaryGridProps {
  metrics: ExposureMetrics;
  currentBankroll: number;
}

export default function ExposureSummaryGrid({ metrics, currentBankroll }: ExposureSummaryGridProps) {
  const exposurePercentage = currentBankroll > 0
    ? (metrics.totalActiveStake / currentBankroll) * 100
    : 0;

  const roiPercentage = metrics.totalActiveStake > 0
    ? (metrics.potentialProfit / metrics.totalActiveStake) * 100
    : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Stake Total em Risco */}
      <Card className="col-span-full md:col-span-2 lg:col-span-1">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              R$ {metrics.totalActiveStake.toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Stake Total em Risco
            </div>
            <Progress value={exposurePercentage} className="mt-3" />
            <div className="text-xs text-muted-foreground mt-1">
              {exposurePercentage.toFixed(1)}% da banca
            </div>
            {exposurePercentage > 30 && (
              <div className="text-xs text-red-600 mt-1 font-medium">
                ⚠️ Exposição alta
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lucro Potencial */}
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="text-2xl font-bold text-green-600">
            {metrics.potentialProfit >= 0 ? '+' : ''}R$ {metrics.potentialProfit.toFixed(2)}
          </div>
          <div className="text-sm text-muted-foreground">Lucro Potencial</div>
          <div className="text-xs text-green-600 mt-1">
            +{roiPercentage.toFixed(1)}% ROI
          </div>
        </CardContent>
      </Card>

      {/* Jogos ao Vivo */}
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="flex items-center justify-center gap-2">
            {metrics.liveGamesCount > 0 && (
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
            <div className="text-2xl font-bold text-orange-600">
              {metrics.liveGamesCount}
            </div>
          </div>
          <div className="text-sm text-muted-foreground">Jogos ao Vivo</div>
          {metrics.liveGamesCount > 0 && (
            <div className="text-xs text-orange-600 mt-1">
              🔴 Em andamento
            </div>
          )}
        </CardContent>
      </Card>

      {/* Jogos Pendentes */}
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {metrics.pendingGamesTodayCount}
          </div>
          <div className="text-sm text-muted-foreground">Pendentes Hoje</div>
          {metrics.gamesInNextHour > 0 && (
            <div className="text-xs text-yellow-600 mt-1 font-medium">
              ⏰ {metrics.gamesInNextHour} na próxima hora
            </div>
          )}
        </CardContent>
      </Card>

      {/* Times com Apostas */}
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="text-2xl font-bold text-gray-700">
            {metrics.teamsWithBets}
          </div>
          <div className="text-sm text-muted-foreground">Times com Apostas</div>
          {metrics.teamConcentration[0] && (
            <div className="text-xs text-muted-foreground mt-1 truncate">
              Maior: {metrics.teamConcentration[0].team}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Máxima Exposição */}
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="text-2xl font-bold text-indigo-600">
            R$ {metrics.maxSingleGameExposure.toFixed(2)}
          </div>
          <div className="text-sm text-muted-foreground">Máx. por Jogo</div>
          <div className="text-xs text-muted-foreground mt-1">
            {currentBankroll > 0 ? ((metrics.maxSingleGameExposure / currentBankroll) * 100).toFixed(1) : 0}% da banca
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
