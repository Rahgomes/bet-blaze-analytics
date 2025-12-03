import { useBettingStore } from '@/stores/betting';
import { selectTodayBets, selectTodayStats, selectWeekBets, selectWeekStats, selectMonthBets, selectMonthStats } from '@/stores/betting/selectors';
import { StatCard } from '@/components/betting/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Wallet, Target, Activity, AlertTriangle, Calendar, DollarSign, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { calculateStats } from '@/utils/dateFilters';

export default function Dashboard() {
  // Usar Zustand store ao invés de useBettingData
  const bets = useBettingStore(state => state.bets);
  const bankroll = useBettingStore(state => state.bankroll);
  const loading = useBettingStore(state => state.loading);

  // Usar selectors para dados computados
  const todayBets = useBettingStore(selectTodayBets);
  const todayStats = useBettingStore(selectTodayStats);
  const currentWeekBets = useBettingStore(selectWeekBets);
  const currentWeekStats = useBettingStore(selectWeekStats);
  const currentMonthBets = useBettingStore(selectMonthBets);
  const currentMonthStats = useBettingStore(selectMonthStats);

  const [, setLocation] = useLocation();
  const today = new Date();

  // Valores de entrada baseados nas stakes customizadas
  const stakeValues = useMemo(() => {
    if (!bankroll.customStakes || bankroll.customStakes.length === 0) {
      return [];
    }

    const sortedStakes = [...bankroll.customStakes].sort((a, b) => a.percentage - b.percentage);

    return sortedStakes.map(stake => ({
      id: stake.id,
      percentage: stake.percentage,
      amount: (stake.percentage / 100) * bankroll.currentBankroll,
      label: stake.label,
      color: stake.color,
    }));
  }, [bankroll.currentBankroll, bankroll.customStakes]);

  // Performance por casa de apostas (mês atual)
  const bookmakerPerformance = useMemo(() => {
    const bookmakerStats = new Map();
    
    currentMonthBets.forEach(bet => {
      const current = bookmakerStats.get(bet.bookmaker) || { 
        totalStaked: 0, 
        totalProfit: 0, 
        totalReturned: 0,
        betsCount: 0 
      };
      
      const returned = bet.status === 'won' ? bet.return || (bet.amount + bet.profit) : 
                      bet.status === 'void' ? bet.amount : 0;
      
      bookmakerStats.set(bet.bookmaker, {
        totalStaked: current.totalStaked + bet.amount,
        totalProfit: current.totalProfit + bet.profit,
        totalReturned: current.totalReturned + returned,
        betsCount: current.betsCount + 1
      });
    });

    const result = Array.from(bookmakerStats.entries()).map(([name, stats]) => ({
      name,
      ...stats
    })).sort((a, b) => b.totalStaked - a.totalStaked);

    // Mock data se não houver apostas reais
    if (result.length === 0) {
      return [
        {
          name: 'BET365',
          totalStaked: 215.59,
          totalReturned: 223.94,
          totalProfit: 8.35,
          betsCount: 15
        },
        {
          name: 'SEU.BET',
          totalStaked: 7.92,
          totalReturned: 5.94,
          totalProfit: -1.98,
          betsCount: 3
        }
      ];
    }

    return result.slice(0, 3);
  }, [currentMonthBets]);

  // Últimos 5 meses para comparação
  const last5MonthsData = useMemo(() => {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 5; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      
      // Filtrar apostas para este mês específico
      const monthBets = bets.filter(bet => {
        const betDate = new Date(bet.date);
        return betDate.getMonth() === date.getMonth() && 
               betDate.getFullYear() === date.getFullYear();
      });

      const stats = calculateStats(monthBets);
      
      months.push({
        month: monthName,
        winRate: stats.winRate,
        betsCount: monthBets.length,
        roi: stats.roi,
        profit: stats.totalProfit
      });
    }

    // Se não há dados reais, usar mock data
    if (months.every(m => m.betsCount === 0)) {
      return [
        { month: 'nov/2025', winRate: 62, betsCount: 24, roi: 8.2, profit: 41.50 },
        { month: 'out/2025', winRate: 58, betsCount: 31, roi: 6.8, profit: 35.20 },
        { month: 'set/2025', winRate: 55, betsCount: 28, roi: 4.5, profit: 22.10 },
        { month: 'ago/2025', winRate: 60, betsCount: 26, roi: 7.3, profit: 38.90 },
        { month: 'jul/2025', winRate: 52, betsCount: 22, roi: 2.1, profit: 12.50 }
      ];
    }

    return months;
  }, [bets]);

  // Informações de data
  const dateInfo = useMemo(() => {
    const today = new Date();
    const weekNumber = Math.ceil(today.getDate() / 7);
    
    return {
      todayFormatted: today.toLocaleDateString('pt-BR'),
      monthYear: today.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
        .replace(/^\w/, c => c.toUpperCase()),
      monthYearShort: today.toLocaleDateString('pt-BR', { month: '2-digit', year: '2-digit' }),
      weekNumber: `${weekNumber}ª semana`
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Visão Geral</h1>
          <p className="text-muted-foreground">Central de Comando – {dateInfo.monthYear}</p>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <p>Hoje: {dateInfo.todayFormatted}</p>
          <p>Semana atual: {dateInfo.weekNumber}</p>
        </div>
      </div>

      {/* SEÇÃO: RESUMO */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Resumo</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard
            title="Banca Atual"
            value={`R$ ${bankroll.currentBankroll.toFixed(2)}`}
            icon={<Wallet className="h-4 w-4 text-muted-foreground" />}
            trend={{
              value: ((bankroll.currentBankroll - bankroll.initialBankroll) / bankroll.initialBankroll * 100),
              isPositive: bankroll.currentBankroll >= bankroll.initialBankroll,
            }}
          />
          <StatCard
            title={`Lucro Hoje`}
            value={`R$ ${todayStats.totalProfit.toFixed(2)}`}
            icon={todayStats.totalProfit >= 0 ?
              <TrendingUp className="h-4 w-4 text-[hsl(var(--profit))]" /> :
              <TrendingDown className="h-4 w-4 text-[hsl(var(--loss))]" />
            }
            onClick={() => setLocation('/bets?period=today')}
            className="cursor-pointer hover:bg-accent/50 transition-colors"
          />
          <StatCard
            title={`Lucro Semana`}
            value={`R$ ${currentWeekStats.totalProfit.toFixed(2)}`}
            icon={currentWeekStats.totalProfit >= 0 ?
              <TrendingUp className="h-4 w-4 text-[hsl(var(--profit))]" /> :
              <TrendingDown className="h-4 w-4 text-[hsl(var(--loss))]" />
            }
            onClick={() => setLocation('/bets?period=week')}
            className="cursor-pointer hover:bg-accent/50 transition-colors"
          />
          <StatCard
            title={`Lucro ${dateInfo.monthYearShort}`}
            value={`R$ ${currentMonthStats.totalProfit.toFixed(2)}`}
            icon={currentMonthStats.totalProfit >= 0 ?
              <TrendingUp className="h-4 w-4 text-[hsl(var(--profit))]" /> :
              <TrendingDown className="h-4 w-4 text-[hsl(var(--loss))]" />
            }
            onClick={() => setLocation('/bets?period=month')}
            className="cursor-pointer hover:bg-accent/50 transition-colors"
          />
          <StatCard
            title="Taxa de Acertos"
            value={`${currentMonthStats.winRate.toFixed(1)}%`}
            icon={<Target className="h-4 w-4 text-muted-foreground" />}
            onClick={() => setLocation('/bets?period=month')}
            className="cursor-pointer hover:bg-accent/50 transition-colors"
          />
          <StatCard
            title="ROI Mês Atual"
            value={`${currentMonthStats.roi.toFixed(1)}%`}
            icon={<Activity className="h-4 w-4 text-muted-foreground" />}
            onClick={() => setLocation('/bets?period=month')}
            className="cursor-pointer hover:bg-accent/50 transition-colors"
          />
        </div>
      </div>

      {/* SEÇÃO: VALORES DE ENTRADA PADRÃO */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Valores de Entrada Padrão</h2>
        <Card>
          <CardHeader>
            <CardTitle>Baseado na Banca Atual</CardTitle>
            <CardDescription>
              Stakes personalizados para gestão de risco
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stakeValues.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="mb-2">Nenhum stake configurado</p>
                <p className="text-sm mb-4">Configure seus stakes na aba de Gestão de Risco</p>
                <Button
                  variant="outline"
                  onClick={() => setLocation('/settings/bankroll')}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Configurar Stakes
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
                {stakeValues.map((stake) => (
                  <div
                    key={stake.id}
                    className="p-3 rounded-lg border-2 transition-all hover:shadow-md"
                    style={{
                      backgroundColor: `${stake.color}08`,
                      borderColor: stake.color,
                    }}
                  >
                    <div
                      className="text-lg font-bold"
                      style={{ color: stake.color }}
                    >
                      {stake.percentage}%
                    </div>
                    <div
                      className="text-sm font-medium"
                      style={{ color: stake.color }}
                    >
                      R$ {stake.amount.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {stake.label}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* SEÇÃO: PERFORMANCE POR CASA DE APOSTAS */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Performance por Casa de Apostas</h2>
        <Card>
          <CardHeader>
            <CardTitle>Resumo do Mês Atual</CardTitle>
            <CardDescription>Apostado vs Retornado e performance por bookmaker</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {bookmakerPerformance.map((bookmaker, index) => (
                <div 
                  key={index} 
                  className="p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => setLocation(`/bets?bookmaker=${encodeURIComponent(bookmaker.name)}&period=month`)}
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold text-lg">{bookmaker.name}</span>
                    <Badge variant="outline">{bookmaker.betsCount} apostas</Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Apostado:</span>
                      <span className="font-medium">R$ {bookmaker.totalStaked.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Retornado:</span>
                      <span className="font-medium">R$ {bookmaker.totalReturned.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Lucro/Prejuízo:</span>
                      <span className={`font-semibold ${bookmaker.totalProfit >= 0 ? 'text-[hsl(var(--profit))]' : 'text-[hsl(var(--loss))]'}`}>
                        {bookmaker.totalProfit >= 0 ? '+' : ''}R$ {bookmaker.totalProfit.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Banca Inicial:</span>
                      <span className="font-medium">R$ {(bankroll.initialBankroll * 0.7).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Banca Atual:</span>
                      <span className="font-medium">R$ {(bankroll.initialBankroll * 0.7 + bookmaker.totalProfit).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SEÇÃO: COMPARAÇÃO DE PERFORMANCE POR PERÍODO */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Comparação de Performance por Período</h2>
        <div className="grid gap-4 md:grid-cols-5">
          {last5MonthsData.map((monthData, index) => (
            <Card key={index} className={`${index === 0 ? 'border-blue-500 bg-blue-50' : ''}`}>
              <CardHeader className="pb-2">
                <CardTitle className={`text-sm ${index === 0 ? 'text-blue-700' : ''}`}>
                  {monthData.month.toUpperCase()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-center">
                  <div className={`text-2xl font-bold ${monthData.winRate >= 55 ? 'text-[hsl(var(--profit))]' : 'text-[hsl(var(--loss))]'}`}>
                    {monthData.winRate.toFixed(0)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Taxa de Acertos</div>
                  <div className="text-sm font-medium">{monthData.betsCount} apostas</div>
                  <div className={`text-sm ${monthData.roi >= 0 ? 'text-[hsl(var(--profit))]' : 'text-[hsl(var(--loss))]'}`}>
                    ROI: {monthData.roi.toFixed(1)}%
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* SEÇÃO: LIMITES DE ENTRADA X PARADA */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Limites de Entrada x Parada</h2>
        <Card>
          <CardHeader>
            <CardTitle>Configurações de Proteção</CardTitle>
            <CardDescription>Limites definidos para proteção da banca</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-700">Stop Gain Mensal</div>
                  <div className="text-2xl font-bold text-green-600">20%</div>
                  <div className="text-sm text-green-600 mt-1">
                    R$ {(bankroll.initialBankroll * 0.20).toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="p-4 border rounded-lg bg-red-50 border-red-200">
                <div className="text-center">
                  <div className="text-lg font-bold text-red-700">Stop Loss Mensal</div>
                  <div className="text-2xl font-bold text-red-600">15%</div>
                  <div className="text-sm text-red-600 mt-1">
                    R$ {(bankroll.initialBankroll * 0.15).toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-700">Stop Gain Semanal</div>
                  <div className="text-2xl font-bold text-green-600">7%</div>
                  <div className="text-sm text-green-600 mt-1">
                    R$ {(bankroll.initialBankroll * 0.07).toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="p-4 border rounded-lg bg-red-50 border-red-200">
                <div className="text-center">
                  <div className="text-lg font-bold text-red-700">Stop Loss Semanal</div>
                  <div className="text-2xl font-bold text-red-600">5%</div>
                  <div className="text-sm text-red-600 mt-1">
                    R$ {(bankroll.initialBankroll * 0.05).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
