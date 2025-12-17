import { useTranslation } from '@/hooks/useTranslation';
import { PLScenarios } from '@/utils/exposureCalculations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ActivePLScenariosProps {
  scenarios: PLScenarios;
  historicalWinRate: number;
}

export default function ActivePLScenarios({ scenarios, historicalWinRate }: ActivePLScenariosProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('watchlist.components.plScenarios.title')}</CardTitle>
        <CardDescription>{t('watchlist.components.plScenarios.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Grid com 3 cards lado a lado */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          {/* Melhor Cenário */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-sm text-green-700 mb-1 font-medium">{t('watchlist.components.plScenarios.bestCase')}</div>
            <div className="text-2xl font-bold text-green-600">
              +R$ {scenarios.bestCase.toFixed(2)}
            </div>
            <div className="text-xs text-green-600 mt-1">
              {t('watchlist.components.plScenarios.bestCaseDesc')}
            </div>
          </div>

          {/* Pior Cenário */}
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-sm text-red-700 mb-1 font-medium">{t('watchlist.components.plScenarios.worstCase')}</div>
            <div className="text-2xl font-bold text-red-600">
              R$ {scenarios.worstCase.toFixed(2)}
            </div>
            <div className="text-xs text-red-600 mt-1">
              {t('watchlist.components.plScenarios.worstCaseDesc')}
            </div>
          </div>

          {/* Valor Esperado */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-blue-700 font-medium mb-1">{t('watchlist.components.plScenarios.expectedValue')}</div>
                <div className={`text-2xl font-bold ${scenarios.expectedValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {scenarios.expectedValue >= 0 ? '+' : ''}R$ {scenarios.expectedValue.toFixed(2)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-blue-700">{t('watchlist.components.plScenarios.winRate')}</div>
                <div className="text-lg font-bold text-blue-600">
                  {historicalWinRate.toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="text-xs text-blue-600 mt-2">
              {t('watchlist.components.plScenarios.basedOnHistory', { rate: historicalWinRate.toFixed(1) })}
            </div>
          </div>
        </div>

        {/* Dica */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="text-xs text-amber-800">
            <strong>{t('watchlist.components.plScenarios.tipLabel')}</strong>
            {t('watchlist.components.plScenarios.tipMessage')}
            {scenarios.expectedValue > 0
              ? t('watchlist.components.plScenarios.tipPositive')
              : t('watchlist.components.plScenarios.tipNegative')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
