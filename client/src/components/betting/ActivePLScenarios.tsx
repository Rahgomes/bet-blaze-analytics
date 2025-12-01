import { PLScenarios } from '@/utils/exposureCalculations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ActivePLScenariosProps {
  scenarios: PLScenarios;
  historicalWinRate: number;
}

export default function ActivePLScenarios({ scenarios, historicalWinRate }: ActivePLScenariosProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cenários de Resultado</CardTitle>
        <CardDescription>Impacto potencial das apostas ativas na sua banca</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Grid com 3 cards lado a lado */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          {/* Melhor Cenário */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-sm text-green-700 mb-1 font-medium">Melhor Cenário</div>
            <div className="text-2xl font-bold text-green-600">
              +R$ {scenarios.bestCase.toFixed(2)}
            </div>
            <div className="text-xs text-green-600 mt-1">
              Se todas as apostas ganharem
            </div>
          </div>

          {/* Pior Cenário */}
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-sm text-red-700 mb-1 font-medium">Pior Cenário</div>
            <div className="text-2xl font-bold text-red-600">
              R$ {scenarios.worstCase.toFixed(2)}
            </div>
            <div className="text-xs text-red-600 mt-1">
              Se todas as apostas perderem
            </div>
          </div>

          {/* Valor Esperado */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-blue-700 font-medium mb-1">Valor Esperado</div>
                <div className={`text-2xl font-bold ${scenarios.expectedValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {scenarios.expectedValue >= 0 ? '+' : ''}R$ {scenarios.expectedValue.toFixed(2)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-blue-700">Win Rate</div>
                <div className="text-lg font-bold text-blue-600">
                  {historicalWinRate.toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="text-xs text-blue-600 mt-2">
              Baseado no histórico de {historicalWinRate.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Dica */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="text-xs text-amber-800">
            <strong>💡 Dica:</strong> O valor esperado considera sua taxa de acerto histórica.
            {scenarios.expectedValue > 0
              ? ' Suas apostas atuais têm expectativa positiva.'
              : ' Revise suas apostas para melhorar a expectativa de lucro.'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
