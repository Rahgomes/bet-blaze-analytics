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
  if (!bet) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes Completos da Aposta</DialogTitle>
          <DialogDescription>Análise detalhada e informações completas sobre esta aposta</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Identificação */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Identificação</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <Label className="text-xs text-muted-foreground">Operação #</Label>
                <p className="font-semibold text-lg">{bet.operationNumber}</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <Label className="text-xs text-muted-foreground">Data da Aposta</Label>
                <p className="font-medium">{new Date(bet.date).toLocaleDateString('pt-BR')}</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <Label className="text-xs text-muted-foreground">Casa de Aposta</Label>
                <p className="font-medium">{bet.bookmaker}</p>
              </div>
            </div>
          </div>

          {/* Detalhes do Jogo */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Informações do Jogo</h4>
            <div className="grid grid-cols-2 gap-4">
              {bet.matchTime && (
                <div>
                  <Label className="text-muted-foreground">Data/Hora do Jogo</Label>
                  <p className="font-medium">{new Date(bet.matchTime).toLocaleString('pt-BR')}</p>
                </div>
              )}
              {bet.league && (
                <div>
                  <Label className="text-muted-foreground">Liga/Competição</Label>
                  <p className="font-medium">{bet.league}</p>
                </div>
              )}
              {bet.market && (
                <div>
                  <Label className="text-muted-foreground">Mercado</Label>
                  <p className="font-medium">{bet.market}</p>
                </div>
              )}
              <div>
                <Label className="text-muted-foreground">Tipo de Aposta</Label>
                <Badge variant="outline" className="font-medium">
                  {bet.betType === 'simple' ? 'Simples' :
                   bet.betType === 'multiple' ? 'Múltipla' :
                   bet.betType === 'live' ? 'Ao Vivo' :
                   bet.betType === 'system' ? 'Sistema' : bet.betType}
                </Badge>
              </div>
            </div>
          </div>

          {/* Análise Financeira */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Análise Financeira</h4>
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <Label className="text-xs text-blue-600 font-medium">Valor Apostado</Label>
                <p className="text-xl font-bold text-blue-700">R$ {bet.amount.toFixed(2)}</p>
              </div>
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <Label className="text-xs text-purple-600 font-medium">Odds</Label>
                <p className="text-xl font-bold text-purple-700">{bet.odds.toFixed(2)}</p>
              </div>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <Label className="text-xs text-gray-600 font-medium">Retorno Total</Label>
                <p className="text-xl font-bold text-gray-700">R$ {bet.return.toFixed(2)}</p>
              </div>
              <div className={`p-4 border rounded-lg ${bet.profit >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <Label className={`text-xs font-medium ${bet.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {bet.profit >= 0 ? 'Lucro' : 'Prejuízo'}
                </Label>
                <p className={`text-xl font-bold ${bet.profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {bet.profit >= 0 ? '+' : ''}R$ {bet.profit.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <Label className="text-xs text-muted-foreground">ROI Individual</Label>
                <p className={`text-lg font-semibold ${bet.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {((bet.profit / bet.amount) * 100).toFixed(2)}%
                </p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <Label className="text-xs text-muted-foreground">Probabilidade Implícita</Label>
                <p className="text-lg font-semibold">{(100 / bet.odds).toFixed(1)}%</p>
              </div>
            </div>
          </div>

          {/* Status e Badges */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Status e Características</h4>
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
                {bet.status === 'won' ? '✅ Ganha' :
                 bet.status === 'lost' ? '❌ Perdida' :
                 bet.status === 'pending' ? '⏳ Pendente' :
                 bet.status === 'void' ? '🚫 Anulada' : bet.status}
              </Badge>
              {bet.isProtected && <Badge className="bg-orange-500 text-sm px-3 py-1">🛡️ Protegida</Badge>}
              {bet.isLive && <Badge variant="secondary" className="text-sm px-3 py-1">📺 Ao Vivo</Badge>}
              {isLiveBet(bet) && <Badge className="bg-red-500 animate-pulse text-sm px-3 py-1">🔴 AO VIVO AGORA</Badge>}
            </div>
          </div>

          {/* Características Especiais */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Características Especiais</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Boost */}
              {bet.id.includes('1') && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">💰 BOOST</Badge>
                  </div>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-yellow-700">Odds Original:</span>
                      <span className="font-medium">{(bet.odds * 0.95).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-yellow-700">Odds Final:</span>
                      <span className="font-medium">{bet.odds.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-yellow-700">Aumento:</span>
                      <span className="font-semibold text-yellow-800">+{((bet.odds / (bet.odds * 0.95) - 1) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Cashout */}
              {bet.id.includes('2') && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">🏦 CASHOUT</Badge>
                  </div>
                  <div className="text-sm space-y-1">
                    <div className="text-blue-700 mb-1">Aposta encerrada antecipadamente</div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Valor Resgatado:</span>
                      <span className="font-medium">R$ {(bet.amount * 0.85).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">% do Potencial:</span>
                      <span className="font-medium">85%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Créditos */}
              {bet.id.includes('3') && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="bg-purple-100 text-purple-800">💳 CRÉDITOS</Badge>
                  </div>
                  <div className="text-sm space-y-1">
                    <div className="text-purple-700 mb-1">Aposta feita com créditos promocionais</div>
                    <div className="flex justify-between">
                      <span className="text-purple-700">Origem:</span>
                      <span className="font-medium">Bônus de Depósito</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-700">Rollover:</span>
                      <span className="font-medium">3x</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Caso não tenha características especiais */}
            {!bet.id.includes('1') && !bet.id.includes('2') && !bet.id.includes('3') && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                <span className="text-gray-500 text-sm">Nenhuma característica especial aplicada nesta aposta</span>
              </div>
            )}
          </div>

          {/* Estratégias e Proteções */}
          {bet.strategies && bet.strategies.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Estratégias e Proteções</h4>
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
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Descrição Completa</h4>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm leading-relaxed">{bet.description}</p>
              </div>
            </div>
          )}

          {/* Método de Stake */}
          {bet.stakeLogic && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Método de Stake</h4>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">{bet.stakeLogic}</p>
              </div>
            </div>
          )}

          {/* Simulação de dados da planilha */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Informações Adicionais</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Placar Final</Label>
                <p className="font-medium">2x1 (simulado)</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Tempo do Gol</Label>
                <p className="font-medium">23', 67' e 89'</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
