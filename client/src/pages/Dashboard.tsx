import { useBettingData } from '@/hooks/useBettingData';
import { StatCard } from '@/components/betting/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Wallet, Target, Activity, AlertTriangle, Calendar, DollarSign } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { filterBetsByPeriod, calculateStats, TimePeriod } from '@/utils/dateFilters';

export default function Dashboard() {
  const { bets, bankroll, loading } = useBettingData();
  const [, setLocation] = useLocation();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('month');

  // Focar apenas no mês atual - sem filtros
  const monthBets = useMemo(() => filterBetsByPeriod(bets, 'month'), [bets]);
  const monthStats = useMemo(() => calculateStats(monthBets), [monthBets]);
  const overallStats = useMemo(() => calculateStats(bets), [bets]);

  const progressToTarget = useMemo(() => {
    return bankroll.targetAmount > 0
      ? ((bankroll.currentBankroll - bankroll.initialBankroll) / (bankroll.targetAmount - bankroll.initialBankroll)) * 100
      : 0;
  }, [bankroll]);

  // Cálculos de lucro por período (focado no mês atual)
  const todayStats = useMemo(() => calculateStats(filterBetsByPeriod(bets, 'today')), [bets]);
  const weekStats = useMemo(() => calculateStats(filterBetsByPeriod(bets, 'week')), [bets]);
  const yearStats = useMemo(() => calculateStats(filterBetsByPeriod(bets, 'year')), [bets]);
  const allTimeStats = useMemo(() => calculateStats(bets), [bets]);
  
  // Stats do período selecionado
  const selectedStats = useMemo(() => {
    const periodBets = filterBetsByPeriod(bets, selectedPeriod);
    return calculateStats(periodBets);
  }, [bets, selectedPeriod]);
  
  // Standard Stake Sizes baseado na banca atual
  const standardStakeSizes = useMemo(() => {
    const current = bankroll.currentBankroll;
    return {
      stake1: current * 0.01, // 1%
      stake2: current * 0.02, // 2%
      stake3: current * 0.03, // 3%
      superOdd: current * 0.005 // 0.5%
    };
  }, [bankroll.currentBankroll]);

  // Cálculo de apostado vs retornado (MENSAL)
  const stakedVsReturned = useMemo(() => {
    const totalStaked = monthStats.totalStake;
    const totalReturned = totalStaked + monthStats.totalProfit;
    return { totalStaked, totalReturned };
  }, [monthStats]);

  // Distribuição por casa de apostas
  const bookmakerDistribution = useMemo(() => {
    const bookmakerStats = new Map();
    
    monthBets.forEach(bet => {
      const current = bookmakerStats.get(bet.bookmaker) || { 
        totalStaked: 0, 
        totalProfit: 0, 
        betsCount: 0 
      };
      
      bookmakerStats.set(bet.bookmaker, {
        totalStaked: current.totalStaked + bet.amount,
        totalProfit: current.totalProfit + bet.profit,
        betsCount: current.betsCount + 1
      });
    });

    const totalStaked = monthStats.totalStake;
    return Array.from(bookmakerStats.entries()).map(([name, stats]) => ({
      name,
      ...stats,
      percentage: totalStaked > 0 ? (stats.totalStaked / totalStaked) * 100 : 0
    })).sort((a, b) => b.totalStaked - a.totalStaked);
  }, [monthBets, monthStats]);

  // Controle de risco mensal
  const riskControl = useMemo(() => {
    const monthlyProfit = monthStats.totalProfit;
    const initialBankroll = bankroll.initialBankroll;
    
    // Limites baseados na planilha
    const stopLossLimit = initialBankroll * -0.15; // -15%
    const stopGainLimit = initialBankroll * 0.20;  // +20%
    
    const alerts = [];
    
    if (monthlyProfit <= stopLossLimit * 0.8) { // 80% do limite
      alerts.push({
        type: 'stop-loss' as const,
        message: 'Próximo do Stop Loss Mensal (-15%)',
        severity: 'high' as const,
        current: monthlyProfit,
        limit: stopLossLimit
      });
    }
    
    if (monthlyProfit >= stopGainLimit * 0.9) { // 90% do limite
      alerts.push({
        type: 'stop-gain' as const,
        message: 'Próximo do Stop Gain Mensal (+20%)',
        severity: 'medium' as const,
        current: monthlyProfit,
        limit: stopGainLimit
      });
    }
    
    return {
      alerts,
      stopLossLimit,
      stopGainLimit,
      currentProfit: monthlyProfit,
      isWithinLimits: monthlyProfit > stopLossLimit && monthlyProfit < stopGainLimit
    };
  }, [monthStats, bankroll]);  const recentBets = useMemo(() => {
    const realBets = [...monthBets].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ).slice(0, 5);

    // Mock data para demonstração quando não há apostas reais
    if (realBets.length === 0) {
      return [
        {
          id: 'mock-1',
          date: new Date().toISOString().split('T')[0],
          bookmaker: 'Bet365',
          betType: 'simples',
          amount: 50.00,
          return: 85.50,
          profit: 35.50,
          status: 'won' as const
        },
        {
          id: 'mock-2',
          date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // ontem
          bookmaker: 'Betano',
          betType: 'múltipla',
          amount: 25.00,
          return: 0.00,
          profit: -25.00,
          status: 'lost' as const
        },
        {
          id: 'mock-3',
          date: new Date(Date.now() - 172800000).toISOString().split('T')[0], // 2 dias atrás
          bookmaker: 'Sportingbet',
          betType: 'simples',
          amount: 75.00,
          return: 142.50,
          profit: 67.50,
          status: 'won' as const
        },
        {
          id: 'mock-4',
          date: new Date(Date.now() - 259200000).toISOString().split('T')[0], // 3 dias atrás
          bookmaker: 'KTO',
          betType: 'simples',
          amount: 100.00,
          return: 100.00,
          profit: 0.00,
          status: 'void' as const
        },
        {
          id: 'mock-5',
          date: new Date(Date.now() - 345600000).toISOString().split('T')[0], // 4 dias atrás
          bookmaker: 'Rivalo',
          betType: 'múltipla',
          amount: 30.00,
          return: 87.60,
          profit: 57.60,
          status: 'won' as const
        }
      ];
    }

    return realBets;
  }, [monthBets]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alertas de Risco */}
      {riskControl.alerts.length > 0 && (
        <div className="space-y-2">
          {riskControl.alerts.map((alert, index) => (
            <div key={index} className={`flex items-center gap-3 p-4 rounded-lg border ${
              alert.type === 'stop-loss' 
                ? 'bg-destructive/10 border-destructive/20' 
                : 'bg-yellow-500/10 border-yellow-500/20'
            }`}>
              <AlertTriangle className={`h-5 w-5 ${
                alert.type === 'stop-loss' ? 'text-destructive' : 'text-yellow-600'
              }`} />
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  alert.type === 'stop-loss' ? 'text-destructive' : 'text-yellow-600'
                }`}>
                  {alert.message}
                </p>
                <p className="text-xs text-muted-foreground">
                  Atual: R$ {alert.current.toFixed(2)} | Limite: R$ {alert.limit.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Painel</h1>
          <p className="text-muted-foreground">Central de Comando - {new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())}</p>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <p>Hoje: {new Date().toLocaleDateString('pt-BR')}</p>
          <p>Semana atual: {Math.ceil(new Date().getDate() / 7)}ª semana</p>
        </div>
      </div>

      {/* Seletor de Período */}
      <div className="flex justify-center">
        <Tabs value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as TimePeriod)} className="w-auto">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="today">Hoje</TabsTrigger>
            <TabsTrigger value="week">Semana</TabsTrigger>
            <TabsTrigger value="month">Mês</TabsTrigger>
            <TabsTrigger value="year">Ano</TabsTrigger>
            <TabsTrigger value="all">Geral</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>      {/* Cards Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
          title={`Lucro ${new Date().toLocaleString('pt-BR', { month: 'long' }).replace(/^\w/, c => c.toUpperCase())}`}
          value={`R$ ${monthStats.totalProfit.toFixed(2)}`}
          icon={monthStats.totalProfit >= 0 ?
            <TrendingUp className="h-4 w-4 text-[hsl(var(--profit))]" /> :
            <TrendingDown className="h-4 w-4 text-[hsl(var(--loss))]" />
          }
          onClick={() => setLocation('/bets?period=month')}
          className="cursor-pointer hover:bg-accent/50 transition-colors"
        />
        <StatCard
          title="Taxa de Acertos"
          value={`${monthStats.winRate.toFixed(1)}%`}
          icon={<Target className="h-4 w-4 text-muted-foreground" />}
          onClick={() => setLocation('/bets?period=month')}
          className="cursor-pointer hover:bg-accent/50 transition-colors"
        />
        <StatCard
          title="Entradas Padrão"
          value="1% | 2% | 3%"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          onClick={() => setLocation('/bankroll-settings')}
          className="cursor-pointer hover:bg-accent/50 transition-colors"
        />
      </div>

      {/* Novos Cards Melhorados */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Standard Stake Sizes Card */}
        <StatCard
          title="Valores de Entrada"
          value={`R$ ${standardStakeSizes.stake2.toFixed(2)}`}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          onClick={() => setLocation('/bankroll-settings')}
          className="cursor-pointer hover:bg-accent/50 transition-colors"
        />
        
        {/* ROI do Período Selecionado */}
        <StatCard
          title={`ROI - ${selectedPeriod === 'today' ? 'Hoje' : 
                        selectedPeriod === 'week' ? 'Semana' : 
                        selectedPeriod === 'month' ? 'Mês' : 
                        selectedPeriod === 'year' ? 'Ano' : 'Geral'}`}
          value={`${selectedStats.roi.toFixed(1)}%`}
          icon={selectedStats.roi >= 0 ?
            <TrendingUp className="h-4 w-4 text-[hsl(var(--profit))]" /> :
            <TrendingDown className="h-4 w-4 text-[hsl(var(--loss))]" />
          }
          onClick={() => setLocation(`/bets?period=${selectedPeriod}`)}
          className="cursor-pointer hover:bg-accent/50 transition-colors"
        />
        
        {/* Win Rate do Período Selecionado */}
        <StatCard
          title={`Taxa de Acertos - ${selectedPeriod === 'today' ? 'Hoje' : 
                                    selectedPeriod === 'week' ? 'Semana' : 
                                    selectedPeriod === 'month' ? 'Mês' : 
                                    selectedPeriod === 'year' ? 'Ano' : 'Geral'}`}
          value={`${selectedStats.winRate.toFixed(1)}%`}
          icon={<Target className="h-4 w-4 text-muted-foreground" />}
          onClick={() => setLocation(`/bets?period=${selectedPeriod}`)}
          className="cursor-pointer hover:bg-accent/50 transition-colors"
        />
        
        {/* Bankroll by Bookmaker */}
        <Card className="cursor-pointer hover:bg-accent/50 transition-colors" 
              onClick={() => setLocation('/bets')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Casas - Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {bookmakerDistribution.slice(0, 2).map((bookmaker, index) => (
                <div key={index} className="flex justify-between text-xs">
                  <span className="font-medium">{bookmaker.name}</span>
                  <span className={`${bookmaker.totalProfit >= 0 ? 'text-[hsl(var(--profit))]' : 'text-[hsl(var(--loss))]'}`}>
                    R$ {bookmaker.totalProfit.toFixed(0)}
                  </span>
                </div>
              ))}
              {bookmakerDistribution.length === 0 && (
                <p className="text-xs text-muted-foreground">Nenhuma casa</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Standard Stake Sizes Detalhado */}
      <Card>
        <CardHeader>
          <CardTitle>Valores de Entrada Padrão</CardTitle>
          <CardDescription>Baseado na banca atual de R$ {bankroll.currentBankroll.toFixed(2)}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 rounded-lg bg-blue-50">
              <div className="text-lg font-bold text-blue-600">R$ {standardStakeSizes.stake1.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">1% da Banca</div>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <div className="text-lg font-bold text-green-600">R$ {standardStakeSizes.stake2.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">2% da Banca</div>
            </div>
            <div className="p-3 rounded-lg bg-orange-50">
              <div className="text-lg font-bold text-orange-600">R$ {standardStakeSizes.stake3.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">3% da Banca</div>
            </div>
            <div className="p-3 rounded-lg bg-purple-50">
              <div className="text-lg font-bold text-purple-600">R$ {standardStakeSizes.superOdd.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">Super Odd (0.5%)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Performance por Período */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Lucro Hoje - {new Date().toLocaleDateString('pt-BR')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className={`text-2xl font-bold ${todayStats.totalProfit >= 0 ? 'text-[hsl(var(--profit))]' : 'text-[hsl(var(--loss))]'}`}>
                R$ {todayStats.totalProfit.toFixed(2)}
              </div>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {filterBetsByPeriod(bets, 'today').length} apostas • ROI: {todayStats.roi.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Lucro Semana - {Math.ceil(new Date().getDate() / 7)}ª semana</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className={`text-2xl font-bold ${weekStats.totalProfit >= 0 ? 'text-[hsl(var(--profit))]' : 'text-[hsl(var(--loss))]'}`}>
                R$ {weekStats.totalProfit.toFixed(2)}
              </div>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {filterBetsByPeriod(bets, 'week').length} apostas • ROI: {weekStats.roi.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Banca por Casa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {bookmakerDistribution.slice(0, 3).map((bookmaker, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{bookmaker.name}</span>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${bookmaker.totalProfit >= 0 ? 'text-[hsl(var(--profit))]' : 'text-[hsl(var(--loss))]'}`}>
                      R$ {bookmaker.totalProfit.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {bookmaker.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
              {bookmakerDistribution.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhuma aposta registrada</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bankroll by Bookmaker Detalhado */}
      <Card>
        <CardHeader>
          <CardTitle>Performance por Casa de Apostas - {selectedPeriod === 'today' ? 'Hoje' : 
                                                          selectedPeriod === 'week' ? 'Semana' : 
                                                          selectedPeriod === 'month' ? 'Mês' : 
                                                          selectedPeriod === 'year' ? 'Ano' : 'Geral'}</CardTitle>
          <CardDescription>Clique em uma casa para ver apostas detalhadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            {bookmakerDistribution.slice(0, 3).map((bookmaker, index) => (
              <div 
                key={index} 
                className="p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                onClick={() => setLocation(`/bets?bookmaker=${encodeURIComponent(bookmaker.name)}&period=${selectedPeriod}`)}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{bookmaker.name}</span>
                  <Badge variant="outline">{bookmaker.betsCount} apostas</Badge>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Apostado:</span>
                    <span>R$ {bookmaker.totalStaked.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Retornado:</span>
                    <span>R$ {(bookmaker.totalStaked + bookmaker.totalProfit).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lucro:</span>
                    <span className={`font-medium ${bookmaker.totalProfit >= 0 ? 'text-[hsl(var(--profit))]' : 'text-[hsl(var(--loss))]'}`}>
                      {bookmaker.totalProfit >= 0 ? '+' : ''}R$ {bookmaker.totalProfit.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">% do Total:</span>
                    <span>{bookmaker.percentage.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ))}
            {bookmakerDistribution.length === 0 && (
              <div className="col-span-3 text-center py-8">
                <p className="text-muted-foreground">Nenhuma aposta registrada no período selecionado</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Progresso da Meta</CardTitle>
            <CardDescription>Progresso em direção à sua meta de lucro</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Banca Inicial</span>
                <span className="font-medium">R$ {bankroll.initialBankroll.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Banca Atual</span>
                <span className="font-medium">R$ {bankroll.currentBankroll.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Meta</span>
                <span className="font-medium">R$ {bankroll.targetAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Falta para Meta</span>
                <span className={`font-medium ${bankroll.targetAmount - bankroll.currentBankroll <= 0 ? 'text-[hsl(var(--profit))]' : 'text-[hsl(var(--loss))]'}`}>
                  R$ {Math.max(bankroll.targetAmount - bankroll.currentBankroll, 0).toFixed(2)}
                </span>
              </div>
            </div>
            <div className="h-3 rounded-full bg-secondary">
              <div
                className={`h-full rounded-full transition-all ${progressToTarget >= 100 ? 'bg-[hsl(var(--profit))]' : 'bg-primary'}`}
                style={{ width: `${Math.min(Math.max(progressToTarget, 0), 100)}%` }}
              />
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {progressToTarget.toFixed(1)}% da meta
              </p>
              {progressToTarget >= 100 && (
                <Badge className="bg-[hsl(var(--profit))] text-white">
                  Meta Atingida! 🎉
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Apostado vs Retornado - {new Date().toLocaleString('pt-BR', { month: 'long' }).replace(/^\w/, c => c.toUpperCase())}</CardTitle>
            <CardDescription>Separado por casa de apostas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {bookmakerDistribution.slice(0, 3).map((bookmaker, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{bookmaker.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {bookmaker.betsCount} apostas
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Apostado: R$ {bookmaker.totalStaked.toFixed(2)}</span>
                    <span className="text-muted-foreground">Retornado: R$ {(bookmaker.totalStaked + bookmaker.totalProfit).toFixed(2)}</span>
                  </div>
                  <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-secondary">
                    <div
                      className="bg-red-500 transition-all"
                      style={{
                        width: `${(bookmaker.totalStaked / (bookmaker.totalStaked + Math.abs(bookmaker.totalProfit) + 0.01)) * 100}%`
                      }}
                    />
                    <div
                      className={`transition-all ${bookmaker.totalProfit >= 0 ? 'bg-[hsl(var(--profit))]' : 'bg-red-600'}`}
                      style={{
                        width: `${(Math.abs(bookmaker.totalProfit) / (bookmaker.totalStaked + Math.abs(bookmaker.totalProfit) + 0.01)) * 100}%`
                      }}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-medium ${bookmaker.totalProfit >= 0 ? 'text-[hsl(var(--profit))]' : 'text-[hsl(var(--loss))]'}`}>
                      {bookmaker.totalProfit >= 0 ? '+' : ''}R$ {bookmaker.totalProfit.toFixed(2)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {bookmaker.totalStaked > 0 ? ((bookmaker.totalStaked + bookmaker.totalProfit) / bookmaker.totalStaked * 100).toFixed(1) : '0'}% retorno
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {bookmakerDistribution.length === 0 && (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">Nenhuma aposta registrada no mês</p>
              </div>
            )}
            
            {bookmakerDistribution.length > 0 && (
              <div className="pt-2 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Mês</span>
                  <span className={`font-medium ${monthStats.totalProfit >= 0 ? 'text-[hsl(var(--profit))]' : 'text-[hsl(var(--loss))]'}`}>
                    {monthStats.totalProfit >= 0 ? '+' : ''}R$ {monthStats.totalProfit.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumo de Performance</CardTitle>
            <CardDescription>Estatísticas do mês vs geral</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">{new Date().toLocaleString('pt-BR', { month: 'long' }).replace(/^\w/, c => c.toUpperCase())}</span>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Apostas:</span>
                    <span className="font-medium">{monthBets.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Ticket Médio:</span>
                    <span className="font-medium">R$ {monthBets.length > 0 ? (monthStats.totalStake / monthBets.length).toFixed(2) : '0.00'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>ROI:</span>
                    <span className={`font-medium ${monthStats.roi >= 0 ? 'text-[hsl(var(--profit))]' : 'text-[hsl(var(--loss))]'}`}>
                      {monthStats.roi.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">Geral</span>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Apostas:</span>
                    <span className="font-medium">{bets.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Ticket Médio:</span>
                    <span className="font-medium">R$ {bets.length > 0 ? (overallStats.totalStake / bets.length).toFixed(2) : '0.00'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>ROI:</span>
                    <span className={`font-medium ${overallStats.roi >= 0 ? 'text-[hsl(var(--profit))]' : 'text-[hsl(var(--loss))]'}`}>
                      {overallStats.roi.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-[hsl(var(--profit)/0.1)]">
                  <div className="text-lg font-bold text-[hsl(var(--profit))]">{monthStats.wonBets}</div>
                  <div className="text-xs text-muted-foreground">Ganhas (Mês)</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-[hsl(var(--loss)/0.1)]">
                  <div className="text-lg font-bold text-[hsl(var(--loss))]">{monthBets.length - monthStats.wonBets}</div>
                  <div className="text-xs text-muted-foreground">Perdidas (Mês)</div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Entradas Configuradas</span>
                <div className="text-right">
                  <div className="text-sm font-medium">1% • 2% • 3%</div>
                  <div className="text-xs text-muted-foreground">Super Odd: 0.5%</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparação de Períodos */}
      <Card>
        <CardHeader>
          <CardTitle>Comparação de Performance por Período</CardTitle>
          <CardDescription>ROI e Taxa de Acertos - Visão Geral</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="text-center p-3 rounded-lg bg-slate-50">
              <div className="text-sm font-medium text-muted-foreground mb-1">Hoje</div>
              <div className={`text-lg font-bold ${todayStats.roi >= 0 ? 'text-[hsl(var(--profit))]' : 'text-[hsl(var(--loss))]'}`}>
                {todayStats.roi.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">
                {todayStats.winRate.toFixed(0)}% acertos
              </div>
              <div className="text-xs text-muted-foreground">
                {filterBetsByPeriod(bets, 'today').length} apostas
              </div>
            </div>
            
            <div className="text-center p-3 rounded-lg bg-slate-50">
              <div className="text-sm font-medium text-muted-foreground mb-1">Semana</div>
              <div className={`text-lg font-bold ${weekStats.roi >= 0 ? 'text-[hsl(var(--profit))]' : 'text-[hsl(var(--loss))]'}`}>
                {weekStats.roi.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">
                {weekStats.winRate.toFixed(0)}% acertos
              </div>
              <div className="text-xs text-muted-foreground">
                {filterBetsByPeriod(bets, 'week').length} apostas
              </div>
            </div>
            
            <div className="text-center p-3 rounded-lg bg-blue-50 border border-blue-200">
              <div className="text-sm font-medium text-blue-600 mb-1">Mês</div>
              <div className={`text-lg font-bold ${monthStats.roi >= 0 ? 'text-[hsl(var(--profit))]' : 'text-[hsl(var(--loss))]'}`}>
                {monthStats.roi.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">
                {monthStats.winRate.toFixed(0)}% acertos
              </div>
              <div className="text-xs text-muted-foreground">
                {monthBets.length} apostas
              </div>
            </div>
            
            <div className="text-center p-3 rounded-lg bg-slate-50">
              <div className="text-sm font-medium text-muted-foreground mb-1">Ano</div>
              <div className={`text-lg font-bold ${yearStats.roi >= 0 ? 'text-[hsl(var(--profit))]' : 'text-[hsl(var(--loss))]'}`}>
                {yearStats.roi.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">
                {yearStats.winRate.toFixed(0)}% acertos
              </div>
              <div className="text-xs text-muted-foreground">
                {filterBetsByPeriod(bets, 'year').length} apostas
              </div>
            </div>
            
            <div className="text-center p-3 rounded-lg bg-slate-50">
              <div className="text-sm font-medium text-muted-foreground mb-1">Geral</div>
              <div className={`text-lg font-bold ${allTimeStats.roi >= 0 ? 'text-[hsl(var(--profit))]' : 'text-[hsl(var(--loss))]'}`}>
                {allTimeStats.roi.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">
                {allTimeStats.winRate.toFixed(0)}% acertos
              </div>
              <div className="text-xs text-muted-foreground">
                {bets.length} apostas
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
