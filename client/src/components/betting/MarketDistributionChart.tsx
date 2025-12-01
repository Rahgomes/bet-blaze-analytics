import { MarketDistribution } from '@/utils/exposureCalculations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChart3 } from 'lucide-react';

interface MarketDistributionChartProps {
  distribution: MarketDistribution[];
}

export default function MarketDistributionChart({ distribution }: MarketDistributionChartProps) {
  if (distribution.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Distribuição por Mercado
          </CardTitle>
          <CardDescription>
            Nenhuma aposta ativa no momento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            Sem dados para exibir
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Distribuição por Mercado
        </CardTitle>
        <CardDescription>
          Como seu stake está distribuído entre mercados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {distribution.map((market, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{market.market}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {market.betCount} aposta{market.betCount > 1 ? 's' : ''}
                  </span>
                  <span className="text-sm font-semibold">
                    {market.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={market.percentage} className="h-2 flex-1" />
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  R$ {market.totalStake.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Insights */}
        {distribution.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-xs text-blue-800">
              <strong>📊 Insight:</strong>
              {distribution[0].percentage > 50
                ? ` ${distribution[0].percentage.toFixed(0)}% do seu stake está concentrado em ${distribution[0].market}. Considere diversificar.`
                : ` Sua distribuição está equilibrada entre ${distribution.length} mercados diferentes.`}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
