import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { BetFormData } from '@/lib/schemas/betFormSchema';

interface BetConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: BetFormData;
  calculations: {
    totalAmount: string;
    finalOdds: string;
    potentialReturn: string;
    potentialProfit: string;
    roi: string;
  };
  aggregatedBadges: string[];
  onConfirm: () => void;
}

export const BetConfirmationModal: React.FC<BetConfirmationModalProps> = ({
  open,
  onOpenChange,
  formData,
  calculations,
  aggregatedBadges,
  onConfirm,
}) => {
  const getBadgeVariant = (badge: string) => {
    if (badge.includes('BOOST')) return 'secondary';
    if (badge === 'CRÉDITOS') return 'outline';
    if (badge === 'CASHOUT') return 'outline';
    if (badge === 'AO VIVO') return 'destructive';
    if (badge === 'PAGAMENTO ANTECIPADO') return 'default';
    if (badge === 'SEM RISCO') return 'default';
    return 'default';
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'won': return 'default';
      case 'lost': return 'destructive';
      case 'void': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'won': return 'Ganha';
      case 'lost': return 'Perdida';
      case 'void': return 'Anulada';
      default: return status;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Confirmar Adição de Aposta</DialogTitle>
          <DialogDescription>
            Revise todos os detalhes antes de adicionar a aposta ao sistema
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-4">Informações Básicas</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Casa de Apostas</p>
                  <p className="font-semibold">{formData.bookmaker}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data</p>
                  <p className="font-semibold">
                    {new Date(formData.date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipo</p>
                  <p className="font-semibold">
                    {formData.betType === 'simple' ? 'Simples' : 'Múltipla'}
                  </p>
                </div>
                {formData.operationNumber && (
                  <div>
                    <p className="text-sm text-muted-foreground">Número da Operação</p>
                    <p className="font-semibold">{formData.operationNumber}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-4">Resumo Financeiro</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Valor Total Apostado:</span>
                  <span className="text-xl font-bold">R$ {calculations.totalAmount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Odd Final:</span>
                  <span className="text-xl font-bold">{calculations.finalOdds}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Retorno Potencial:</span>
                  <span className="text-xl font-bold text-green-600">
                    R$ {calculations.potentialReturn}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Lucro Potencial:</span>
                  <span className="text-xl font-bold text-blue-600">
                    R$ {calculations.potentialProfit}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">ROI:</span>
                  <span className="text-xl font-bold text-purple-600">
                    {calculations.roi}%
                  </span>
                </div>
              </div>

              {aggregatedBadges.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Características:</p>
                  <div className="flex flex-wrap gap-2">
                    {aggregatedBadges.map((badge, idx) => (
                      <Badge
                        key={idx}
                        variant={getBadgeVariant(badge) as any}
                        className={badge === 'AO VIVO' ? 'animate-pulse' : ''}
                      >
                        {badge}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-4">
                Detalhes {formData.betType === 'simple' ? 'da Aposta' : 'das Legs'}
              </h3>
              <div className="space-y-4">
                {formData.legs.map((leg, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-base">
                          {formData.betType === 'multiple' && `Leg ${index + 1}: `}
                          {leg.homeTeam} vs {leg.awayTeam}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {leg.sport} • {leg.market}
                          {leg.league && ` • ${leg.league}`}
                        </p>
                      </div>
                      <Badge variant={getStatusBadgeVariant(leg.status) as any}>
                        {getStatusLabel(leg.status)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Valor</p>
                        <p className="font-semibold">R$ {parseFloat(leg.amount || '0').toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Odd</p>
                        <p className="font-semibold">{parseFloat(leg.odds || '1').toFixed(2)}</p>
                      </div>
                      {leg.strategy && (
                        <div>
                          <p className="text-muted-foreground">Estratégia</p>
                          <p className="font-semibold">{leg.strategy}</p>
                        </div>
                      )}
                      {leg.isLive && (
                        <div>
                          <Badge variant="destructive" className="animate-pulse">
                            AO VIVO
                          </Badge>
                        </div>
                      )}
                    </div>

                    {(leg.hasBoost || leg.usedCredits || leg.hasCashout || leg.isRiskFree) && (
                      <div className="pt-2 border-t space-y-2">
                        {leg.hasBoost && (
                          <p className="text-xs text-muted-foreground">
                            Boost: {leg.originalOdds} → {leg.odds} (+{leg.boostPercentage}%)
                          </p>
                        )}
                        {leg.usedCredits && (
                          <p className="text-xs text-muted-foreground">
                            Créditos utilizados: R$ {leg.creditsAmount}
                          </p>
                        )}
                        {leg.hasCashout && (
                          <p className="text-xs text-muted-foreground">
                            Cashout disponível: R$ {leg.cashoutValue}
                          </p>
                        )}
                        {leg.isRiskFree && (
                          <p className="text-xs text-muted-foreground">
                            Valor protegido: R$ {leg.riskFreeAmount}
                          </p>
                        )}
                      </div>
                    )}

                    {leg.protectionTypes.length > 0 && (
                      <div className="pt-2">
                        <p className="text-xs text-muted-foreground mb-1">Proteções:</p>
                        <div className="flex flex-wrap gap-1">
                          {leg.protectionTypes.map((protection, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {protection}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {(formData.description || formData.stakeLogic || formData.tags.length > 0) && (
            <Card>
              <CardContent className="pt-6 space-y-4">
                {formData.description && (
                  <div>
                    <h4 className="font-semibold mb-2">Descrição</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {formData.description}
                    </p>
                  </div>
                )}

                {formData.stakeLogic && (
                  <div>
                    <h4 className="font-semibold mb-2">Lógica do Stake</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {formData.stakeLogic}
                    </p>
                  </div>
                )}

                {formData.tags.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, idx) => (
                        <Badge key={idx} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            Confirmar e Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
