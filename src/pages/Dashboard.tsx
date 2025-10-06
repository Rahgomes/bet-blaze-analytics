import { useBettingData } from '@/hooks/useBettingData';
import { StatCard } from '@/components/betting/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Wallet, Target, Activity } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { filterBetsByPeriod, calculateStats, TimePeriod } from '@/utils/dateFilters';

export default function Dashboard() {
  const { bets, bankroll, loading } = useBettingData();
  const navigate = useNavigate();
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
    return [...periodBets].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ).slice(0, 5);
  }, [periodBets]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your betting tracker</p>
        </div>
        <Tabs value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as TimePeriod)}>
          <TabsList>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Current Bankroll"
          value={`€${bankroll.currentBankroll.toFixed(2)}`}
          icon={<Wallet className="h-4 w-4 text-muted-foreground" />}
          trend={{
            value: ((bankroll.currentBankroll - bankroll.initialBankroll) / bankroll.initialBankroll * 100),
            isPositive: bankroll.currentBankroll >= bankroll.initialBankroll,
          }}
        />
        <StatCard
          title={`Profit (${selectedPeriod === 'all' ? 'Overall' : selectedPeriod})`}
          value={`€${periodStats.totalProfit.toFixed(2)}`}
          icon={periodStats.totalProfit >= 0 ? 
            <TrendingUp className="h-4 w-4 text-[hsl(var(--profit))]" /> : 
            <TrendingDown className="h-4 w-4 text-[hsl(var(--loss))]" />
          }
          onClick={() => navigate('/bets', { state: { period: selectedPeriod } })}
          className="cursor-pointer hover:bg-accent/50 transition-colors"
        />
        <StatCard
          title={`ROI (${selectedPeriod === 'all' ? 'Overall' : selectedPeriod})`}
          value={`${periodStats.roi.toFixed(2)}%`}
          icon={<Activity className="h-4 w-4 text-muted-foreground" />}
          onClick={() => navigate('/bets', { state: { period: selectedPeriod } })}
          className="cursor-pointer hover:bg-accent/50 transition-colors"
        />
        <StatCard
          title={`Win Rate (${selectedPeriod === 'all' ? 'Overall' : selectedPeriod})`}
          value={`${periodStats.winRate.toFixed(1)}%`}
          icon={<Target className="h-4 w-4 text-muted-foreground" />}
          onClick={() => navigate('/bets', { state: { period: selectedPeriod } })}
          className="cursor-pointer hover:bg-accent/50 transition-colors"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Bankroll Progress</CardTitle>
            <CardDescription>Progress towards your target</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Initial</span>
                <span className="font-medium">€{bankroll.initialBankroll.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current</span>
                <span className="font-medium">€{bankroll.currentBankroll.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Target</span>
                <span className="font-medium">€{bankroll.targetAmount.toFixed(2)}</span>
              </div>
            </div>
            <div className="h-2 rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${Math.min(Math.max(progressToTarget, 0), 100)}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {progressToTarget.toFixed(1)}% to target
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bet Statistics</CardTitle>
            <CardDescription>Overall performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Bets ({selectedPeriod})</span>
              <span className="text-2xl font-bold">{periodBets.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Won</span>
              <Badge variant="outline" className="bg-[hsl(var(--profit)/0.1)] text-[hsl(var(--profit))] border-[hsl(var(--profit)/0.3)]">
                {periodStats.wonBets}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Stake</span>
              <span className="font-medium">€{periodStats.totalStake.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Overall (All Time)</span>
              <div className="text-right">
                <div className="font-medium">€{overallStats.totalProfit.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">{overallStats.roi.toFixed(1)}% ROI</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Bets</CardTitle>
          <CardDescription>Your last 5 bets</CardDescription>
        </CardHeader>
        <CardContent>
          {recentBets.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No bets yet. Add your first bet!</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Bookmaker</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Stake</TableHead>
                  <TableHead className="text-right">Return</TableHead>
                  <TableHead className="text-right">Profit</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentBets.map((bet) => (
                  <TableRow key={bet.id}>
                    <TableCell>{new Date(bet.date).toLocaleDateString()}</TableCell>
                    <TableCell>{bet.bookmaker}</TableCell>
                    <TableCell className="capitalize">{bet.betType}</TableCell>
                    <TableCell className="text-right">€{bet.amount.toFixed(2)}</TableCell>
                    <TableCell className="text-right">€{bet.return.toFixed(2)}</TableCell>
                    <TableCell className={`text-right font-medium ${bet.profit >= 0 ? 'text-[hsl(var(--profit))]' : 'text-[hsl(var(--loss))]'}`}>
                      {bet.profit >= 0 ? '+' : ''}€{bet.profit.toFixed(2)}
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
                        {bet.status}
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
