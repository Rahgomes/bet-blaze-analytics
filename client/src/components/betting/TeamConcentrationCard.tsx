import { TeamExposure } from '@/utils/exposureCalculations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle } from 'lucide-react';

interface TeamConcentrationCardProps {
  teamExposure: TeamExposure[];
}

export default function TeamConcentrationCard({ teamExposure }: TeamConcentrationCardProps) {
  if (teamExposure.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-gray-400" />
            Risco de Concentração por Time
          </CardTitle>
          <CardDescription>
            Nenhum time com apostas ativas no momento
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

  const maxStake = teamExposure[0]?.totalStake || 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          Risco de Concentração por Time
        </CardTitle>
        <CardDescription>
          Times com maior exposição de stake - monitorar para evitar over-exposure
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {teamExposure.slice(0, 5).map((team, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{team.team}</span>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={
                        team.riskLevel === 'high'
                          ? 'border-red-500 text-red-700 bg-red-50'
                          : team.riskLevel === 'medium'
                          ? 'border-yellow-500 text-yellow-700 bg-yellow-50'
                          : 'border-green-500 text-green-700 bg-green-50'
                      }
                    >
                      {team.riskLevel === 'high' ? '🔴 Alto' :
                       team.riskLevel === 'medium' ? '🟡 Médio' :
                       '🟢 Baixo'}
                    </Badge>
                    <span className="text-sm font-semibold">
                      R$ {team.totalStake.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <span>{team.betCount} apostas</span>
                  <span>•</span>
                  <span>{team.gameCount} jogos</span>
                </div>
                <Progress
                  value={(team.totalStake / maxStake) * 100}
                  className="h-2"
                />
              </div>
            </div>
          ))}
        </div>

        {teamExposure.length > 5 && (
          <div className="mt-4 text-center text-xs text-muted-foreground">
            + {teamExposure.length - 5} outros times
          </div>
        )}
      </CardContent>
    </Card>
  );
}
