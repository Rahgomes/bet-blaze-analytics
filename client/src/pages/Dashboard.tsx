import { useBettingData } from '@/hooks/useBettingData';
import { StatCard } from '@/components/betting/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Wallet, Target, Activity } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { filterBetsByPeriod, calculateStats, TimePeriod } from '@/utils/dateFilters';

export default function Dashboard() {
  const { bets, bankroll, loading } = useBettingData();
  const [, setLocation] = useLocation();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('all');


  const periodBets = useMemo(() => filterBetsByPeriod(bets, selectedPeriod), [bets, selectedPeriod]);
  const periodStats = useMemo(() => calculateStats(periodBets), [periodBets]);
  const overallStats = useMemo(() => calculateStats(bets), [bets]);

  const progressToTarget = useMemo(() => {
    return bankroll.targetAmount > 0
      ? ((bankroll.currentBankroll - bankroll.initialBankroll) / (bankroll.targetAmount - bankroll.initialBankroll)) * 100
      : 0;
  }, [bankroll]);

  const recentBets = useMemo(() => {
    const realBets = [...periodBets].sort((a, b) =>
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
  }, [periodBets]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Painel</h1>
          <p className="text-muted-foreground">Bem-vindo ao seu rastreador de apostas</p>
        </div>
        <Tabs value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as TimePeriod)}>
          <TabsList>
            <TabsTrigger value="today">Hoje</TabsTrigger>
            <TabsTrigger value="week">Semana</TabsTrigger>
            <TabsTrigger value="month">Mês</TabsTrigger>
            <TabsTrigger value="year">Ano</TabsTrigger>
            <TabsTrigger value="all">Tudo</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

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
          title={`Lucro (${selectedPeriod === 'all' ? 'Geral' : selectedPeriod === 'today' ? 'Hoje' : selectedPeriod === 'week' ? 'Semana' : selectedPeriod === 'month' ? 'Mês' : 'Ano'})`}
          value={`R$ ${periodStats.totalProfit.toFixed(2)}`}
          icon={periodStats.totalProfit >= 0 ?
            <TrendingUp className="h-4 w-4 text-[hsl(var(--profit))]" /> :
            <TrendingDown className="h-4 w-4 text-[hsl(var(--loss))]" />
          }
          onClick={() => setLocation('/bets')}
          className="cursor-pointer hover:bg-accent/50 transition-colors"
        />
        <StatCard
          title={`ROI (${selectedPeriod === 'all' ? 'Geral' : selectedPeriod === 'today' ? 'Hoje' : selectedPeriod === 'week' ? 'Semana' : selectedPeriod === 'month' ? 'Mês' : 'Ano'})`}
          value={`${periodStats.roi.toFixed(2)}%`}
          icon={<Activity className="h-4 w-4 text-muted-foreground" />}
          onClick={() => setLocation('/bets')}
          className="cursor-pointer hover:bg-accent/50 transition-colors"
        />
        <StatCard
          title={`Taxa de Acertos (${selectedPeriod === 'all' ? 'Geral' : selectedPeriod === 'today' ? 'Hoje' : selectedPeriod === 'week' ? 'Semana' : selectedPeriod === 'month' ? 'Mês' : 'Ano'})`}
          value={`${periodStats.winRate.toFixed(1)}%`}
          icon={<Target className="h-4 w-4 text-muted-foreground" />}
          onClick={() => setLocation('/bets')}
          className="cursor-pointer hover:bg-accent/50 transition-colors"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Progresso da Banca</CardTitle>
            <CardDescription>Progresso em direção à sua meta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Inicial</span>
                <span className="font-medium">R$ {bankroll.initialBankroll.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Atual</span>
                <span className="font-medium">R$ {bankroll.currentBankroll.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Meta</span>
                <span className="font-medium">R$ {bankroll.targetAmount.toFixed(2)}</span>
              </div>
            </div>
            <div className="h-2 rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${Math.min(Math.max(progressToTarget, 0), 100)}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {progressToTarget.toFixed(1)}% da meta
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estatísticas de Apostas</CardTitle>
            <CardDescription>Desempenho geral</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total de Apostas ({selectedPeriod === 'all' ? 'Geral' : selectedPeriod === 'today' ? 'Hoje' : selectedPeriod === 'week' ? 'Semana' : selectedPeriod === 'month' ? 'Mês' : 'Ano'})</span>
              <span className="text-2xl font-bold">{periodBets.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Ganhas</span>
              <Badge variant="outline" className="bg-[hsl(var(--profit)/0.1)] text-[hsl(var(--profit))] border-[hsl(var(--profit)/0.3)]">
                {periodStats.wonBets}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Perdidas</span>
              <Badge variant="outline" className="bg-[hsl(var(--loss)/0.1)] text-[hsl(var(--loss))] border-[hsl(var(--loss)/0.3)]">
                {periodBets.length - periodStats.wonBets}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Investido</span>
              <span className="font-medium">R$ {periodStats.totalStake.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Retornado</span>
              <span className="font-medium">R$ {(periodStats.totalStake + periodStats.totalProfit).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Geral (Todos os Tempos)</span>
              <div className="text-right">
                <div className="font-medium">R$ {overallStats.totalProfit.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">{overallStats.roi.toFixed(1)}% ROI</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Apostas Recentes</CardTitle>
          <CardDescription>Suas últimas 5 apostas</CardDescription>
        </CardHeader>
        <CardContent>
          {periodBets.length === 0 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                📊 <strong>Dados de demonstração:</strong> Estas são apostas fictícias para mostrar como será a visualização. Adicione suas apostas reais!
              </p>
            </div>
          )}
          {recentBets.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Casa</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-right">Retorno</TableHead>
                  <TableHead className="text-right">Lucro</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentBets.map((bet) => (
                  <TableRow key={bet.id}>
                    <TableCell>{new Date(bet.date).toLocaleDateString()}</TableCell>
                    <TableCell>{bet.bookmaker}</TableCell>
                    <TableCell className="capitalize">{bet.betType}</TableCell>
                    <TableCell className="text-right">R$ {bet.amount.toFixed(2)}</TableCell>
                    <TableCell className="text-right">R$ {bet.return.toFixed(2)}</TableCell>
                    <TableCell className={`text-right font-medium ${bet.profit >= 0 ? 'text-[hsl(var(--profit))]' : 'text-[hsl(var(--loss))]'}`}>
                      {bet.profit >= 0 ? '+' : ''}R$ {bet.profit.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          bet.status === 'won'
                            ? 'bg-[hsl(var(--profit)/0.1)] text-[hsl(var(--profit))] border-[hsl(var(--profit)/0.3)]'
                            : bet.status === 'lost'
                              ? 'bg-[hsl(var(--loss)/0.1)] text-[hsl(var(--loss))] border-[hsl(var(--loss)/0.3)]'
                              : ''
                        }
                      >
                        {bet.status === 'won' ? 'ganha' : bet.status === 'lost' ? 'perdida' : bet.status === 'void' ? 'anulada' : bet.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
