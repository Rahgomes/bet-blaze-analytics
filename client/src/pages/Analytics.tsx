import { useMemo, useState } from 'react';
import { useBettingData } from '@/hooks/useBettingData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnalyticsFilters } from '@/components/betting/AnalyticsFilters';
import { ComparisonMetricCard } from '@/components/betting/ComparisonMetricCard';
import { TrendLineChart } from '@/components/betting/TrendLineChart';
import { GoalTrackingCard } from '@/components/betting/GoalTrackingCard';
import { PerformanceTable } from '@/components/betting/PerformanceTable';
import { Bet } from '@/types/betting';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import {
  startOfToday,
  startOfWeek,
  startOfMonth,
  startOfYear,
  subDays,
  subMonths,
  format,
  isAfter,
  isBefore,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TrendingUp, DollarSign, Target as TargetIcon, Activity } from 'lucide-react';

export default function Analytics() {
  const { bets, bankroll } = useBettingData();

  // Estados dos filtros
  const [period, setPeriod] = useState('30days');
  const [selectedBookmakers, setSelectedBookmakers] = useState<string[]>([]);
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>([]);
  const [selectedBetTypes, setSelectedBetTypes] = useState<string[]>([]);
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [oddsRange, setOddsRange] = useState({ min: 1.01, max: 10 });
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);

  // Extrair listas únicas de filtros
  const availableBookmakers = useMemo(() =>
    Array.from(new Set(bets.map(b => b.bookmaker))).filter(Boolean).sort(),
    [bets]
  );

  const availableLeagues = useMemo(() =>
    Array.from(new Set(bets.map(b => b.league).filter(Boolean))).sort(),
    [bets]
  );

  const availableMarkets = useMemo(() =>
    Array.from(new Set(bets.map(b => b.market).filter(Boolean))).sort(),
    [bets]
  );

  const availableTeams = useMemo(() => {
    const teams = new Set<string>();
    bets.forEach(bet => {
      if (bet.homeTeam) teams.add(bet.homeTeam);
      if (bet.awayTeam) teams.add(bet.awayTeam);
    });
    return Array.from(teams).sort();
  }, [bets]);

  // Função para obter data inicial com base no período
  const getStartDate = (periodKey: string): Date | null => {
    const now = new Date();
    switch (periodKey) {
      case 'today': return startOfToday();
      case 'week': return startOfWeek(now, { locale: ptBR });
      case 'month': return startOfMonth(now);
      case '30days': return subDays(now, 30);
      case '90days': return subDays(now, 90);
      case 'year': return startOfYear(now);
      case 'all': return null;
      default: return null;
    }
  };

  // Função para obter período anterior equivalente
  const getPreviousPeriodDates = (currentStartDate: Date | null): { start: Date | null; end: Date } => {
    if (!currentStartDate) return { start: null, end: new Date() };

    const now = new Date();
    const daysDiff = Math.ceil((now.getTime() - currentStartDate.getTime()) / (1000 * 60 * 60 * 24));

    return {
      start: subDays(currentStartDate, daysDiff),
      end: currentStartDate,
    };
  };

  // Filtrar apostas por período e filtros
  const filterBets = (betsToFilter: Bet[], startDate: Date | null, endDate?: Date): Bet[] => {
    return betsToFilter.filter(bet => {
      const betDate = new Date(bet.date);

      // Filtro de período
      if (startDate && isBefore(betDate, startDate)) return false;
      if (endDate && isAfter(betDate, endDate)) return false;

      // Filtros avançados
      if (selectedBookmakers.length > 0 && !selectedBookmakers.includes(bet.bookmaker)) return false;
      if (selectedLeagues.length > 0 && bet.league && !selectedLeagues.includes(bet.league)) return false;
      if (selectedBetTypes.length > 0 && !selectedBetTypes.includes(bet.isLive ? 'Ao vivo' : 'Pré-jogo')) return false;
      if (selectedMarkets.length > 0 && bet.market && !selectedMarkets.includes(bet.market)) return false;
      if (bet.odds < oddsRange.min || bet.odds > oddsRange.max) return false;
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(bet.status)) return false;

      if (selectedTeams.length > 0) {
        const hasTeam = (bet.homeTeam && selectedTeams.includes(bet.homeTeam)) ||
                       (bet.awayTeam && selectedTeams.includes(bet.awayTeam));
        if (!hasTeam) return false;
      }

      return true;
    });
  };

  // Apostas do período atual
  const currentStartDate = getStartDate(period);
  const currentBets = useMemo(() =>
    filterBets(bets, currentStartDate),
    [bets, period, selectedBookmakers, selectedLeagues, selectedBetTypes, selectedMarkets, oddsRange, selectedStatuses, selectedTeams]
  );

  // Apostas do período anterior
  const previousPeriodDates = getPreviousPeriodDates(currentStartDate);
  const previousBets = useMemo(() =>
    filterBets(bets, previousPeriodDates.start, previousPeriodDates.end),
    [bets, period, selectedBookmakers, selectedLeagues, selectedBetTypes, selectedMarkets, oddsRange, selectedStatuses, selectedTeams]
  );

  // Calcular métricas do período atual
  const currentMetrics = useMemo(() => {
    const totalProfit = currentBets.reduce((sum, bet) => sum + bet.profit, 0);
    const totalStake = currentBets.reduce((sum, bet) => sum + bet.amount, 0);
    const roi = totalStake > 0 ? (totalProfit / totalStake) * 100 : 0;
    const wonBets = currentBets.filter(b => b.status === 'won').length;
    const winRate = currentBets.length > 0 ? (wonBets / currentBets.length) * 100 : 0;

    return { totalProfit, totalStake, roi, winRate, totalBets: currentBets.length };
  }, [currentBets]);

  // Calcular métricas do período anterior
  const previousMetrics = useMemo(() => {
    const totalProfit = previousBets.reduce((sum, bet) => sum + bet.profit, 0);
    const totalStake = previousBets.reduce((sum, bet) => sum + bet.amount, 0);
    const roi = totalStake > 0 ? (totalProfit / totalStake) * 100 : 0;
    const wonBets = previousBets.filter(b => b.status === 'won').length;
    const winRate = previousBets.length > 0 ? (wonBets / previousBets.length) * 100 : 0;

    return { totalProfit, totalStake, roi, winRate, totalBets: previousBets.length };
  }, [previousBets]);

  // Calcular dados de evolução temporal (agrupamento por data)
  const evolutionData = useMemo(() => {
    // Criar mapa para período atual
    const currentMap = new Map<string, number>();
    currentBets.forEach(bet => {
      const dateKey = format(new Date(bet.date), 'dd/MM');
      currentMap.set(dateKey, (currentMap.get(dateKey) || 0) + bet.profit);
    });

    // Criar mapa para período anterior
    const previousMap = new Map<string, number>();
    previousBets.forEach(bet => {
      const dateKey = format(new Date(bet.date), 'dd/MM');
      previousMap.set(dateKey, (previousMap.get(dateKey) || 0) + bet.profit);
    });

    // Combinar datas e criar array de dados acumulados
    const allDates = Array.from(new Set([...currentMap.keys(), ...previousMap.keys()])).sort();

    let currentAccumulated = 0;
    let previousAccumulated = 0;

    return allDates.slice(-10).map(date => {
      currentAccumulated += currentMap.get(date) || 0;
      previousAccumulated += previousMap.get(date) || 0;

      return {
        date,
        current: currentAccumulated,
        previous: period !== 'all' ? previousAccumulated : undefined,
      };
    });
  }, [currentBets, previousBets, period]);

  // Calcular performance por casa de apostas
  const bookmakerPerformance = useMemo(() => {
    const bookmakers = new Map<string, { totalBets: number; totalStake: number; totalProfit: number; won: number }>();

    currentBets.forEach(bet => {
      const current = bookmakers.get(bet.bookmaker) || { totalBets: 0, totalStake: 0, totalProfit: 0, won: 0 };
      bookmakers.set(bet.bookmaker, {
        totalBets: current.totalBets + 1,
        totalStake: current.totalStake + bet.amount,
        totalProfit: current.totalProfit + bet.profit,
        won: current.won + (bet.status === 'won' ? 1 : 0),
      });
    });

    return Array.from(bookmakers.entries()).map(([dimension, data]) => ({
      dimension,
      totalBets: data.totalBets,
      totalStake: data.totalStake,
      profit: data.totalProfit,
      roi: data.totalStake > 0 ? (data.totalProfit / data.totalStake) * 100 : 0,
      winRate: data.totalBets > 0 ? (data.won / data.totalBets) * 100 : 0,
    }));
  }, [currentBets]);

  // Calcular performance por liga
  const leaguePerformance = useMemo(() => {
    const leagues = new Map<string, { totalBets: number; totalStake: number; totalProfit: number; won: number }>();

    currentBets.forEach(bet => {
      if (!bet.league) return;
      const current = leagues.get(bet.league) || { totalBets: 0, totalStake: 0, totalProfit: 0, won: 0 };
      leagues.set(bet.league, {
        totalBets: current.totalBets + 1,
        totalStake: current.totalStake + bet.amount,
        totalProfit: current.totalProfit + bet.profit,
        won: current.won + (bet.status === 'won' ? 1 : 0),
      });
    });

    return Array.from(leagues.entries()).map(([dimension, data]) => ({
      dimension,
      totalBets: data.totalBets,
      totalStake: data.totalStake,
      profit: data.totalProfit,
      roi: data.totalStake > 0 ? (data.totalProfit / data.totalStake) * 100 : 0,
      winRate: data.totalBets > 0 ? (data.won / data.totalBets) * 100 : 0,
    }));
  }, [currentBets]);

  // Calcular performance por mercado
  const marketPerformance = useMemo(() => {
    const markets = new Map<string, { totalBets: number; totalStake: number; totalProfit: number; won: number }>();

    currentBets.forEach(bet => {
      if (!bet.market) return;
      const current = markets.get(bet.market) || { totalBets: 0, totalStake: 0, totalProfit: 0, won: 0 };
      markets.set(bet.market, {
        totalBets: current.totalBets + 1,
        totalStake: current.totalStake + bet.amount,
        totalProfit: current.totalProfit + bet.profit,
        won: current.won + (bet.status === 'won' ? 1 : 0),
      });
    });

    return Array.from(markets.entries()).map(([dimension, data]) => ({
      dimension,
      totalBets: data.totalBets,
      totalStake: data.totalStake,
      profit: data.totalProfit,
      roi: data.totalStake > 0 ? (data.totalProfit / data.totalStake) * 100 : 0,
      winRate: data.totalBets > 0 ? (data.won / data.totalBets) * 100 : 0,
    }));
  }, [currentBets]);

  // Calcular distribuição por status
  const statusDistribution = useMemo(() => {
    const statusMap = new Map<string, number>();
    currentBets.forEach(bet => {
      statusMap.set(bet.status, (statusMap.get(bet.status) || 0) + 1);
    });

    const statusLabels: Record<string, string> = {
      won: 'Ganhas',
      lost: 'Perdidas',
      pending: 'Pendentes',
      void: 'Anuladas',
      cashout: 'Cashout',
    };

    return Array.from(statusMap.entries()).map(([status, value]) => ({
      name: statusLabels[status] || status,
      value,
    }));
  }, [currentBets]);

  // Calcular evolução mensal
  const monthlyEvolution = useMemo(() => {
    const months = new Map<string, { profit: number; bets: number; stake: number }>();

    currentBets.forEach(bet => {
      const monthKey = format(new Date(bet.date), 'MMM/yy', { locale: ptBR });
      const current = months.get(monthKey) || { profit: 0, bets: 0, stake: 0 };
      months.set(monthKey, {
        profit: current.profit + bet.profit,
        bets: current.bets + 1,
        stake: current.stake + bet.amount,
      });
    });

    return Array.from(months.entries())
      .map(([month, data]) => ({
        month,
        profit: data.profit,
        bets: data.bets,
        roi: data.stake > 0 ? (data.profit / data.stake) * 100 : 0,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [currentBets]);

  // Calcular distribuição por faixa de odds
  const oddsDistribution = useMemo(() => {
    const ranges = [
      { label: '1.01-1.50', min: 1.01, max: 1.50 },
      { label: '1.51-2.00', min: 1.51, max: 2.00 },
      { label: '2.01-3.00', min: 2.01, max: 3.00 },
      { label: '3.01-5.00', min: 3.01, max: 5.00 },
      { label: '5.01+', min: 5.01, max: 999 },
    ];

    return ranges.map(range => {
      const betsInRange = currentBets.filter(b => b.odds >= range.min && b.odds <= range.max);
      const totalStake = betsInRange.reduce((sum, b) => sum + b.amount, 0);
      const totalProfit = betsInRange.reduce((sum, b) => sum + b.profit, 0);
      const won = betsInRange.filter(b => b.status === 'won').length;

      return {
        range: range.label,
        bets: betsInRange.length,
        profit: totalProfit,
        roi: totalStake > 0 ? (totalProfit / totalStake) * 100 : 0,
        winRate: betsInRange.length > 0 ? (won / betsInRange.length) * 100 : 0,
      };
    }).filter(r => r.bets > 0);
  }, [currentBets]);

  // Função de limpar filtros
  const handleClearFilters = () => {
    setPeriod('30days');
    setSelectedBookmakers([]);
    setSelectedLeagues([]);
    setSelectedBetTypes([]);
    setSelectedMarkets([]);
    setOddsRange({ min: 1.01, max: 10 });
    setSelectedStatuses([]);
    setSelectedTeams([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Análise Avançada</h1>
        <p className="text-muted-foreground">Análise detalhada e comparativa de performance</p>
      </div>

      {/* Filtros */}
      <AnalyticsFilters
        period={period}
        setPeriod={setPeriod}
        selectedBookmakers={selectedBookmakers}
        setSelectedBookmakers={setSelectedBookmakers}
        selectedLeagues={selectedLeagues}
        setSelectedLeagues={setSelectedLeagues}
        selectedBetTypes={selectedBetTypes}
        setSelectedBetTypes={setSelectedBetTypes}
        selectedMarkets={selectedMarkets}
        setSelectedMarkets={setSelectedMarkets}
        oddsRange={oddsRange}
        setOddsRange={setOddsRange}
        selectedStatuses={selectedStatuses}
        setSelectedStatuses={setSelectedStatuses}
        selectedTeams={selectedTeams}
        setSelectedTeams={setSelectedTeams}
        availableBookmakers={availableBookmakers}
        availableLeagues={availableLeagues}
        availableMarkets={availableMarkets}
        availableTeams={availableTeams}
        onClearFilters={handleClearFilters}
      />

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="risk">Risco e Projeções</TabsTrigger>
        </TabsList>

        {/* ABA: VISÃO GERAL */}
        <TabsContent value="overview" className="space-y-6">
          {/* Cards de Métricas com Comparação */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <ComparisonMetricCard
              title="Lucro Total"
              currentValue={currentMetrics.totalProfit}
              previousValue={previousMetrics.totalProfit}
              format="currency"
              icon={<DollarSign className="h-4 w-4" />}
            />
            <ComparisonMetricCard
              title="ROI"
              currentValue={currentMetrics.roi}
              previousValue={previousMetrics.roi}
              format="percentage"
              icon={<TrendingUp className="h-4 w-4" />}
            />
            <ComparisonMetricCard
              title="Taxa de Acerto"
              currentValue={currentMetrics.winRate}
              previousValue={previousMetrics.winRate}
              format="percentage"
              icon={<TargetIcon className="h-4 w-4" />}
            />
            <ComparisonMetricCard
              title="Total de Apostas"
              currentValue={currentMetrics.totalBets}
              previousValue={previousMetrics.totalBets}
              format="number"
              icon={<Activity className="h-4 w-4" />}
            />
          </div>

          {/* Gráfico de Evolução Temporal */}
          <TrendLineChart
            data={evolutionData.length > 0 ? evolutionData : [{ date: 'Sem dados', current: 0 }]}
            title="Evolução do Lucro Acumulado"
            yAxisLabel="Lucro (R$)"
            format="currency"
            showComparison={period !== 'all' && evolutionData.length > 0}
          />

          {/* Tracking de Meta */}
          <GoalTrackingCard
            currentValue={bankroll.currentBankroll}
            targetValue={bankroll.currentBankroll * 1.10} // Meta de 10% de crescimento
            targetDate={new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)} // Fim do mês
            currentBets={currentBets}
            startValue={bankroll.currentBankroll - currentMetrics.totalProfit}
          />
        </TabsContent>

        {/* ABA: PERFORMANCE */}
        <TabsContent value="performance" className="space-y-6">
          {/* Performance por Casa de Apostas */}
          <PerformanceTable
            title="Performance por Casa de Apostas"
            data={bookmakerPerformance}
            columns={[
              { key: 'dimension', label: 'Casa de Apostas', sortable: true },
              { key: 'totalBets', label: 'Apostas', format: 'number', sortable: true },
              { key: 'totalStake', label: 'Valor Apostado', format: 'currency', sortable: true },
              { key: 'profit', label: 'Lucro', format: 'currency', sortable: true, colorCode: true },
              { key: 'roi', label: 'ROI', format: 'percentage', sortable: true, colorCode: true },
              { key: 'winRate', label: 'Taxa de Acerto', format: 'percentage', sortable: true },
            ]}
            defaultSortKey="profit"
            defaultSortDirection="desc"
            emptyMessage="Nenhum dado de casa de apostas disponível"
          />

          {/* Performance por Liga */}
          <PerformanceTable
            title="Performance por Liga/Competição"
            data={leaguePerformance}
            columns={[
              { key: 'dimension', label: 'Liga', sortable: true },
              { key: 'totalBets', label: 'Apostas', format: 'number', sortable: true },
              { key: 'totalStake', label: 'Valor Apostado', format: 'currency', sortable: true },
              { key: 'profit', label: 'Lucro', format: 'currency', sortable: true, colorCode: true },
              { key: 'roi', label: 'ROI', format: 'percentage', sortable: true, colorCode: true },
              { key: 'winRate', label: 'Taxa de Acerto', format: 'percentage', sortable: true },
            ]}
            defaultSortKey="profit"
            defaultSortDirection="desc"
            emptyMessage="Nenhum dado de liga disponível"
          />

          {/* Performance por Mercado */}
          <PerformanceTable
            title="Performance por Mercado"
            data={marketPerformance}
            columns={[
              { key: 'dimension', label: 'Mercado', sortable: true },
              { key: 'totalBets', label: 'Apostas', format: 'number', sortable: true },
              { key: 'totalStake', label: 'Valor Apostado', format: 'currency', sortable: true },
              { key: 'profit', label: 'Lucro', format: 'currency', sortable: true, colorCode: true },
              { key: 'roi', label: 'ROI', format: 'percentage', sortable: true, colorCode: true },
              { key: 'winRate', label: 'Taxa de Acerto', format: 'percentage', sortable: true },
            ]}
            defaultSortKey="profit"
            defaultSortDirection="desc"
            emptyMessage="Nenhum dado de mercado disponível"
          />
        </TabsContent>

        {/* ABA: TENDÊNCIAS */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Evolução Mensal - Lucro */}
            <Card>
              <CardHeader>
                <CardTitle>Evolução Mensal - Lucro</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyEvolution}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <RechartsTooltip
                      formatter={(value: any) =>
                        new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(value)
                      }
                    />
                    <Legend />
                    <Bar dataKey="profit" name="Lucro" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Evolução Mensal - ROI */}
            <Card>
              <CardHeader>
                <CardTitle>Evolução Mensal - ROI</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyEvolution}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <RechartsTooltip formatter={(value: any) => `${value.toFixed(2)}%`} />
                    <Legend />
                    <Bar dataKey="roi" name="ROI %" fill="hsl(var(--chart-3))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Distribuição por Status */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusDistribution.map((entry, index) => {
                        const colors = [
                          'hsl(var(--chart-1))',
                          'hsl(var(--chart-2))',
                          'hsl(var(--chart-3))',
                          'hsl(var(--chart-4))',
                          'hsl(var(--chart-5))',
                        ];
                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                      })}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Performance por Faixa de Odds */}
            <Card>
              <CardHeader>
                <CardTitle>Performance por Faixa de Odds</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={oddsDistribution}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="range" className="text-xs" />
                    <YAxis className="text-xs" />
                    <RechartsTooltip formatter={(value: any) => `${value.toFixed(2)}%`} />
                    <Legend />
                    <Bar dataKey="roi" name="ROI %" fill="hsl(var(--primary))" />
                    <Bar dataKey="winRate" name="Taxa de Acerto %" fill="hsl(var(--chart-2))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Tabela de Performance por Faixa de Odds */}
          <PerformanceTable
            title="Detalhamento por Faixa de Odds"
            data={oddsDistribution}
            columns={[
              { key: 'range', label: 'Faixa de Odds', sortable: true },
              { key: 'bets', label: 'Apostas', format: 'number', sortable: true },
              { key: 'profit', label: 'Lucro', format: 'currency', sortable: true, colorCode: true },
              { key: 'roi', label: 'ROI', format: 'percentage', sortable: true, colorCode: true },
              { key: 'winRate', label: 'Taxa de Acerto', format: 'percentage', sortable: true },
            ]}
            defaultSortKey="roi"
            defaultSortDirection="desc"
            emptyMessage="Nenhum dado de faixa de odds disponível"
          />
        </TabsContent>

        {/* ABA: RISCO E PROJEÇÕES */}
        <TabsContent value="risk" className="space-y-6">
          {/* Cards de Métricas de Risco */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Stake Médio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {currentBets.length > 0
                    ? new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(currentMetrics.totalStake / currentBets.length)
                    : 'R$ 0,00'}
                </div>
                <p className="text-xs text-muted-foreground">Por aposta</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Odds Média</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {currentBets.length > 0
                    ? (currentBets.reduce((sum, b) => sum + b.odds, 0) / currentBets.length).toFixed(2)
                    : '0.00'}
                </div>
                <p className="text-xs text-muted-foreground">Média ponderada</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Maior Aposta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {currentBets.length > 0
                    ? new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(Math.max(...currentBets.map(b => b.amount)))
                    : 'R$ 0,00'}
                </div>
                <p className="text-xs text-muted-foreground">Stake máximo</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">% da Banca</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {bankroll.currentBankroll > 0 && currentBets.length > 0
                    ? ((currentMetrics.totalStake / currentBets.length / bankroll.currentBankroll) * 100).toFixed(2)
                    : '0.00'}%
                </div>
                <p className="text-xs text-muted-foreground">Stake médio / Banca</p>
              </CardContent>
            </Card>
          </div>

          {/* Projeção de Crescimento */}
          <Card>
            <CardHeader>
              <CardTitle>Projeção de Crescimento da Banca</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Projeção Linear (1 mês)</p>
                  <p className="text-2xl font-bold text-primary">
                    {(() => {
                      const daysInPeriod = currentBets.length > 0 ? 30 : 1;
                      const dailyProfit = currentMetrics.totalProfit / daysInPeriod;
                      const projected = bankroll.currentBankroll + (dailyProfit * 30);
                      return new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(projected);
                    })()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Baseado no lucro diário médio
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Projeção Linear (3 meses)</p>
                  <p className="text-2xl font-bold text-primary">
                    {(() => {
                      const daysInPeriod = currentBets.length > 0 ? 30 : 1;
                      const dailyProfit = currentMetrics.totalProfit / daysInPeriod;
                      const projected = bankroll.currentBankroll + (dailyProfit * 90);
                      return new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(projected);
                    })()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Crescimento linear mantendo o ritmo
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Meta Necessária (Mensal)</p>
                  <p className="text-2xl font-bold text-chart-3">
                    {(() => {
                      const monthlyTarget = bankroll.currentBankroll * 0.05; // 5% ao mês
                      return new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(monthlyTarget);
                    })()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Para crescimento de 5% ao mês
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm font-medium mb-2">Análise de Risco</p>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>
                    • Exposição atual: {' '}
                    <span className="font-semibold text-foreground">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(currentMetrics.totalStake)}
                    </span>
                    {' '}({((currentMetrics.totalStake / bankroll.currentBankroll) * 100).toFixed(1)}% da banca)
                  </p>
                  <p>
                    • ROI atual: {' '}
                    <span className={`font-semibold ${currentMetrics.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {currentMetrics.roi.toFixed(2)}%
                    </span>
                  </p>
                  <p>
                    • Para manter crescimento sustentável, mantenha ROI acima de 3% e stake médio abaixo de 3% da banca.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Distribuição de Stakes */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Stakes</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    {
                      range: '< 1%',
                      count: currentBets.filter(b => (b.amount / bankroll.currentBankroll) * 100 < 1).length,
                    },
                    {
                      range: '1-2%',
                      count: currentBets.filter(b => {
                        const pct = (b.amount / bankroll.currentBankroll) * 100;
                        return pct >= 1 && pct < 2;
                      }).length,
                    },
                    {
                      range: '2-3%',
                      count: currentBets.filter(b => {
                        const pct = (b.amount / bankroll.currentBankroll) * 100;
                        return pct >= 2 && pct < 3;
                      }).length,
                    },
                    {
                      range: '3-5%',
                      count: currentBets.filter(b => {
                        const pct = (b.amount / bankroll.currentBankroll) * 100;
                        return pct >= 3 && pct < 5;
                      }).length,
                    },
                    {
                      range: '> 5%',
                      count: currentBets.filter(b => (b.amount / bankroll.currentBankroll) * 100 >= 5).length,
                    },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="range" className="text-xs" />
                  <YAxis className="text-xs" />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="count" name="Número de Apostas" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
