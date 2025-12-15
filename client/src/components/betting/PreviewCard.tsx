import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/useTranslation';

interface PreviewCardProps {
  calculations: {
    totalAmount: string;
    finalOdds: string;
    potentialReturn: string;
    potentialProfit: string;
    roi: string;
  };
  aggregatedBadges: string[];
  validations: {
    oddsAlert: string | null;
    amountAlert: string | null;
    stakeSuggestion: string;
    roiWarning: string | null;
  };
}

export const PreviewCard = ({
  calculations,
  aggregatedBadges,
  validations
}: PreviewCardProps) => {
  const { t } = useTranslation();

  return (
  <Card className="sticky top-20">
    <CardHeader>
      <CardTitle>{t('addBet.preview.title')}</CardTitle>
      <CardDescription>{t('addBet.preview.subtitle')}</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">{t('addBet.preview.totalStaked')}</span>
          <span className="font-bold">R$ {calculations.totalAmount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">{t('addBet.preview.finalOdds')}</span>
          <span className="font-bold">{calculations.finalOdds}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">{t('addBet.preview.potentialReturn')}</span>
          <span className="font-bold text-green-600">
            R$ {calculations.potentialReturn}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">{t('addBet.preview.potentialProfit')}</span>
          <span className="font-bold text-blue-600">
            R$ {calculations.potentialProfit}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">{t('addBet.preview.roi')}</span>
          <span className="font-bold text-purple-600">
            {calculations.roi}%
          </span>
        </div>

        {aggregatedBadges.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-4 pt-3 border-t">
            {aggregatedBadges.map((badge, idx) => {
              if (badge.includes('BOOST')) return <Badge key={idx} variant="secondary">{badge}</Badge>;
              if (badge === 'CRÉDITOS') return <Badge key={idx} variant="outline">{badge}</Badge>;
              if (badge === 'CASHOUT') return <Badge key={idx} variant="outline">{badge}</Badge>;
              if (badge === 'AO VIVO') return <Badge key={idx} variant="destructive" className="animate-pulse">{badge}</Badge>;
              if (badge === 'PAGAMENTO ANTECIPADO') return <Badge key={idx} className="bg-orange-500">{badge}</Badge>;
              if (badge === 'SEM RISCO') return <Badge key={idx} className="bg-green-600">{badge}</Badge>;
              return <Badge key={idx}>{badge}</Badge>;
            })}
          </div>
        )}

        {/* Alertas de Gestão de Risco */}
        <div className="mt-4 space-y-2">
          {validations.amountAlert && (
            <div className={`p-3 rounded-lg border ${
              validations.amountAlert.includes('CRÍTICO') 
                ? 'bg-red-50 border-red-300' 
                : validations.amountAlert.includes('Alto Risco')
                ? 'bg-red-50 border-red-200'
                : validations.amountAlert.includes('Agressivo')
                ? 'bg-orange-50 border-orange-200'
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <p className={`text-xs font-medium ${
                validations.amountAlert.includes('CRÍTICO') 
                  ? 'text-red-900' 
                  : validations.amountAlert.includes('Alto Risco')
                  ? 'text-red-800'
                  : validations.amountAlert.includes('Agressivo')
                  ? 'text-orange-800'
                  : 'text-yellow-800'
              }`}>
                {validations.amountAlert}
              </p>
            </div>
          )}

          {validations.oddsAlert && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs font-medium text-yellow-800">{validations.oddsAlert}</p>
            </div>
          )}

          {validations.roiWarning && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-xs font-medium text-orange-800">{validations.roiWarning}</p>
            </div>
          )}

          {/* Sempre mostrar a sugestão de stake */}
          <div className={`p-3 rounded-lg border ${
            validations.stakeSuggestion.includes('🚨')
              ? 'bg-red-50 border-red-200'
              : validations.stakeSuggestion.includes('⚠️')
              ? 'bg-orange-50 border-orange-200'
              : validations.stakeSuggestion.includes('⚡')
              ? 'bg-yellow-50 border-yellow-200'
              : validations.stakeSuggestion.includes('⚖️')
              ? 'bg-blue-50 border-blue-200'
              : validations.stakeSuggestion.includes('✅')
              ? 'bg-green-50 border-green-200'
              : 'bg-gray-50 border-gray-200'
          }`}>
            <p className={`text-xs font-medium ${
              validations.stakeSuggestion.includes('🚨')
                ? 'text-red-800'
                : validations.stakeSuggestion.includes('⚠️')
                ? 'text-orange-800'
                : validations.stakeSuggestion.includes('⚡')
                ? 'text-yellow-800'
                : validations.stakeSuggestion.includes('⚖️')
                ? 'text-blue-800'
                : validations.stakeSuggestion.includes('✅')
                ? 'text-green-800'
                : 'text-gray-800'
            }`}>
              {validations.stakeSuggestion}
            </p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
  );
};
