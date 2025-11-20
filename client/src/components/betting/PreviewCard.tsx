import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
}: PreviewCardProps) => (
  <Card className="sticky top-20">
    <CardHeader>
      <CardTitle>Preview da Aposta</CardTitle>
      <CardDescription>Acompanhe os cálculos em tempo real</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Valor Total Apostado:</span>
          <span className="font-bold">R$ {calculations.totalAmount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Odd Final:</span>
          <span className="font-bold">{calculations.finalOdds}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Retorno Potencial:</span>
          <span className="font-bold text-green-600">
            R$ {calculations.potentialReturn}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Lucro Potencial:</span>
          <span className="font-bold text-blue-600">
            R$ {calculations.potentialProfit}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">ROI:</span>
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

        {validations.oddsAlert && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">⚠️ {validations.oddsAlert}</p>
          </div>
        )}
        {validations.amountAlert && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-800">🚨 {validations.amountAlert}</p>
          </div>
        )}
        {validations.roiWarning && (
          <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-xs text-orange-800">⚡ {validations.roiWarning}</p>
          </div>
        )}

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">💡 {validations.stakeSuggestion}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);
