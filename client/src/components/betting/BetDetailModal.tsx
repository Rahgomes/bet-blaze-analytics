import { Bet } from '@/types/betting';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/useTranslation';

interface BetDetailModalProps {
  bet: Bet | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Função auxiliar para verificar se é live agora
const isLiveBet = (bet: Bet): boolean => {
  if (!bet.matchTime || bet.status !== 'pending') return false;
  const now = new Date();
  const matchTime = new Date(bet.matchTime);
  const timeSinceStart = now.getTime() - matchTime.getTime();
  return timeSinceStart > 0 && timeSinceStart < (2 * 60 * 60 * 1000);
};

export default function BetDetailModal({ bet, open, onOpenChange }: BetDetailModalProps) {
  const { t, tm } = useTranslation();

  if (!bet) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('bets.completeDetails')}</DialogTitle>
          <DialogDescription>{t('bets.detailedAnalysis')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Identificação */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{t('bets.identification')}</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <Label className="text-xs text-muted-foreground">{t('bets.operationHash')}</Label>
                <p className="font-semibold text-lg">{bet.operationNumber}</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <Label className="text-xs text-muted-foreground">{t('bets.betDate')}</Label>
                <p className="font-medium">{new Date(bet.date).toLocaleDateString('pt-BR')}</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <Label className="text-xs text-muted-foreground">{t('bets.bookmakerHouse')}</Label>
                <p className="font-medium">{bet.bookmaker}</p>
              </div>
            </div>
          </div>

          {/* Detalhes do Jogo */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{t('bets.gameInfo')}</h4>
            <div className="grid grid-cols-2 gap-4">
              {bet.matchTime && (
                <div>
                  <Label className="text-muted-foreground">{t('bets.gameDateTime')}</Label>
                  <p className="font-medium">{new Date(bet.matchTime).toLocaleString('pt-BR')}</p>
                </div>
              )}
              {bet.league && (
                <div>
                  <Label className="text-muted-foreground">{t('bets.leagueCompetition')}</Label>
                  <p className="font-medium">{bet.league}</p>
                </div>
              )}
              {bet.market && (
                <div>
                  <Label className="text-muted-foreground">{t('bets.market')}</Label>
                  <p className="font-medium">{tm(bet.market)}</p>
                </div>
              )}
              <div>
                <Label className="text-muted-foreground">{t('bets.betType')}</Label>
                <Badge variant="outline" className="font-medium">
                  {bet.betType === 'simple' ? t('addBet.simple') :
                   bet.betType === 'multiple' ? t('addBet.multiple') :
                   bet.betType === 'live' ? t('addBet.live') :
                   bet.betType === 'system' ? t('addBet.system') : bet.betType}
                </Badge>
              </div>
            </div>
          </div>

          {/* Análise Financeira */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{t('bets.financialAnalysis')}</h4>
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <Label className="text-xs text-blue-600 font-medium">{t('bets.betAmount')}</Label>
                <p className="text-xl font-bold text-blue-700">R$ {bet.amount.toFixed(2)}</p>
              </div>
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <Label className="text-xs text-purple-600 font-medium">{t('addBet.odds')}</Label>
                <p className="text-xl font-bold text-purple-700">{bet.odds.toFixed(2)}</p>
              </div>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <Label className="text-xs text-gray-600 font-medium">{t('bets.totalReturn')}</Label>
                <p className="text-xl font-bold text-gray-700">R$ {bet.return.toFixed(2)}</p>
              </div>
              <div className={`p-4 border rounded-lg ${bet.profit >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <Label className={`text-xs font-medium ${bet.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {bet.profit >= 0 ? t('dashboard.profit') : t('bets.loss')}
                </Label>
                <p className={`text-xl font-bold ${bet.profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {bet.profit >= 0 ? '+' : ''}R$ {bet.profit.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <Label className="text-xs text-muted-foreground">{t('bets.individualROI')}</Label>
                <p className={`text-lg font-semibold ${bet.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {((bet.profit / bet.amount) * 100).toFixed(2)}%
                </p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <Label className="text-xs text-muted-foreground">{t('bets.impliedProbability')}</Label>
                <p className="text-lg font-semibold">{(100 / bet.odds).toFixed(1)}%</p>
              </div>
            </div>
          </div>

          {/* Status e Badges */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{t('bets.statusAndCharacteristics')}</h4>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className={
                  bet.status === 'won'
                    ? 'bg-[hsl(var(--profit)/0.1)] text-[hsl(var(--profit))] border-[hsl(var(--profit)/0.3)] text-sm px-3 py-1'
                    : bet.status === 'lost'
                      ? 'bg-[hsl(var(--loss)/0.1)] text-[hsl(var(--loss))] border-[hsl(var(--loss)/0.3)] text-sm px-3 py-1'
                      : 'text-sm px-3 py-1'
                }
              >
                {bet.status === 'won' ? `✅ ${t('bets.won')}` :
                 bet.status === 'lost' ? `❌ ${t('bets.lost')}` :
                 bet.status === 'pending' ? `⏳ ${t('bets.pending')}` :
                 bet.status === 'void' ? `🚫 ${t('bets.void')}` : bet.status}
              </Badge>
              {bet.isProtected && <Badge className="bg-orange-500 text-sm px-3 py-1">🛡️ {t('bets.protected')}</Badge>}
              {bet.isLive && <Badge variant="secondary" className="text-sm px-3 py-1">📺 {t('addBet.live')}</Badge>}
              {isLiveBet(bet) && <Badge className="bg-red-500 animate-pulse text-sm px-3 py-1">🔴 {t('bets.liveNowBadge')}</Badge>}
            </div>
          </div>

          {/* Características Especiais */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{t('bets.specialCharacteristics')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Boost */}
              {bet.id.includes('1') && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">💰 {t('bets.boost')}</Badge>
                  </div>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-yellow-700">{t('bets.originalOdds')}:</span>
                      <span className="font-medium">{(bet.odds * 0.95).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-yellow-700">{t('bets.finalOdds')}:</span>
                      <span className="font-medium">{bet.odds.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-yellow-700">{t('bets.increase')}:</span>
                      <span className="font-semibold text-yellow-800">+{((bet.odds / (bet.odds * 0.95) - 1) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Cashout */}
              {bet.id.includes('2') && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">🏦 {t('bets.cashout')}</Badge>
                  </div>
                  <div className="text-sm space-y-1">
                    <div className="text-blue-700 mb-1">{t('bets.closedEarly')}</div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">{t('bets.rescuedValue')}:</span>
                      <span className="font-medium">R$ {(bet.amount * 0.85).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">{t('bets.potentialPercent')}:</span>
                      <span className="font-medium">85%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Créditos */}
              {bet.id.includes('3') && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="bg-purple-100 text-purple-800">💳 {t('bets.creditsUppercase')}</Badge>
                  </div>
                  <div className="text-sm space-y-1">
                    <div className="text-purple-700 mb-1">{t('bets.betWithPromotionalCredits')}</div>
                    <div className="flex justify-between">
                      <span className="text-purple-700">{t('bets.origin')}:</span>
                      <span className="font-medium">{t('bets.depositBonus')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-700">{t('bets.rollover')}:</span>
                      <span className="font-medium">3x</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Caso não tenha características especiais */}
            {!bet.id.includes('1') && !bet.id.includes('2') && !bet.id.includes('3') && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                <span className="text-gray-500 text-sm">{t('bets.noSpecialCharacteristics')}</span>
              </div>
            )}
          </div>

          {/* Estratégias e Proteções */}
          {bet.strategies && bet.strategies.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{t('bets.strategiesAndProtections')}</h4>
              <div className="flex flex-wrap gap-2">
                {bet.strategies.map((s, i) => (
                  <Badge key={i} variant="secondary" className="text-sm px-3 py-1">{s}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Descrição Detalhada */}
          {bet.description && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{t('bets.completeDescription')}</h4>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm leading-relaxed">{bet.description}</p>
              </div>
            </div>
          )}

          {/* Método de Stake */}
          {bet.stakeLogic && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{t('bets.stakeMethod')}</h4>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">{bet.stakeLogic}</p>
              </div>
            </div>
          )}

          {/* Simulação de dados da planilha */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{t('bets.additionalInfo')}</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">{t('bets.finalScore')}</Label>
                <p className="font-medium">2x1 (simulado)</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t('bets.goalTime')}</Label>
                <p className="font-medium">23', 67' e 89'</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
