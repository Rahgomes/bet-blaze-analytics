import { useMemo, useState } from 'react';
import { useBettingData } from '@/hooks/useBettingData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookmakerStats } from '@/types/betting';
import { TimePeriod, filterBetsByPeriod, calculateStats } from '@/utils/dateFilters';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Analytics() {
  const { bets, bookmakers } = useBettingData();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('all');

  const periodBets = useMemo(() => filterBetsByPeriod(bets, selectedPeriod), [bets, selectedPeriod]);
  const periodStats = useMemo(() => calculateStats(periodBets), [periodBets]);

  const bookmakerStats = useMemo((): BookmakerStats[] => {
    return bookmakers.map((bm) => {
      const bookmakerBets = periodBets.filter(b => b.bookmaker === bm.name);
      const totalBets = bookmakerBets.length;
      const totalStake = bookmakerBets.reduce((sum, b) => sum + b.amount, 0);
      const totalReturn = bookmakerBets.reduce((sum, b) => sum + b.return, 0);
      const profit = bookmakerBets.reduce((sum, b) => sum + b.profit, 0);
      const roi = totalStake > 0 ? (profit / totalStake) * 100 : 0;
      const wonBets = bookmakerBets.filter(b => b.status === 'won').length;
      const winRate = totalBets > 0 ? (wonBets / totalBets) * 100 : 0;

      return {
        bookmaker: bm.name,
        totalBets,
        totalStake,
        totalReturn,
        profit,
        roi,
        winRate,
      };
    }).filter(stat => stat.totalBets > 0);
  }, [periodBets, bookmakers]);

  const betTypeStats = useMemo(() => {
    const types = ['simple', 'multiple', 'live', 'system'];
    return types.map(type => {
      const typeBets = periodBets.filter(b => b.betType === type);
      const totalBets = typeBets.length;
      const totalStake = typeBets.reduce((sum, b) => sum + b.amount, 0);
      const profit = typeBets.reduce((sum, b) => sum + b.profit, 0);
      const roi = totalStake > 0 ? (profit / totalStake) * 100 : 0;
      const wonBets = typeBets.filter(b => b.status === 'won').length;
      const winRate = totalBets > 0 ? (wonBets / totalBets) * 100 : 0;

      return { type, totalBets, totalStake, profit, roi, winRate };
    }).filter(stat => stat.totalBets > 0);
  }, [periodBets]);

  const leagueStats = useMemo(() => {
    const leagues = new Map<string, { totalBets: number; profit: number; totalStake: number }>();
    
    periodBets.forEach(bet => {
      if (bet.league) {
        const current = leagues.get(bet.league) || { totalBets: 0, profit: 0, totalStake: 0 };
        leagues.set(bet.league, {
          totalBets: current.totalBets + 1,
          profit: current.profit + bet.profit,
          totalStake: current.totalStake + bet.amount,
        });
      }
    });

    return Array.from(leagues.entries()).map(([league, data]) => ({
      league,
      ...data,
      roi: data.totalStake > 0 ? (data.profit / data.totalStake) * 100 : 0,
    })).sort((a, b) => b.profit - a.profit);
  }, [periodBets]);

  const marketStats = useMemo(() => {
    const markets = new Map<string, number>();
    periodBets.forEach(bet => {
      if (bet.market) {
        markets.set(bet.market, (markets.get(bet.market) || 0) + 1);
      }
    });
    return Array.from(markets.entries()).map(([name, value]) => ({ name, value }));
  }, [periodBets]);

  const monthlyStats = useMemo(() => {
    const months = new Map<string, { stake: number; return_: number; profit: number; bets: number }>();
    
    periodBets.forEach(bet => {
      const month = bet.date.substring(0, 7); // YYYY-MM
      const current = months.get(month) || { stake: 0, return_: 0, profit: 0, bets: 0 };
      months.set(month, {
        stake: current.stake + bet.amount,
        return_: current.return_ + bet.return,
        profit: current.profit + bet.profit,
        bets: current.bets + 1,
      });
    });

    return Array.from(months.entries())
      .map(([month, data]) => ({
        month,
        ...data,
        roi: data.stake > 0 ? (data.profit / data.stake) * 100 : 0,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [periodBets]);

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--profit))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Detailed performance analysis</p>
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

      {/* Summary Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${periodStats.totalProfit >= 0 ? 'text-[hsl(var(--profit))]' : 'text-[hsl(var(--loss))]'}`}>
              {periodStats.totalProfit >= 0 ? '+' : ''}€{periodStats.totalProfit.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">ROI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{periodStats.roi.toFixed(2)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{periodStats.winRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Bets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{periodBets.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profit Over Time</CardTitle>
            <CardDescription>Monthly profit trend</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="profit" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profit by League</CardTitle>
            <CardDescription>Top performing competitions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={leagueStats.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="league" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="profit" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Market Distribution</CardTitle>
            <CardDescription>Bets by market type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={marketStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {marketStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ROI by Bookmaker</CardTitle>
            <CardDescription>Return on investment comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bookmakerStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="bookmaker" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="roi" fill="hsl(var(--profit))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tables */}
      <Card>
        <CardHeader>
          <CardTitle>Performance by Bookmaker</CardTitle>
          <CardDescription>Compare your results across different bookmakers</CardDescription>
        </CardHeader>
        <CardContent>
          {bookmakerStats.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No data available</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bookmaker</TableHead>
                  <TableHead className="text-right">Bets</TableHead>
                  <TableHead className="text-right">Total Stake</TableHead>
                  <TableHead className="text-right">Total Return</TableHead>
                  <TableHead className="text-right">Profit</TableHead>
                  <TableHead className="text-right">ROI</TableHead>
                  <TableHead className="text-right">Win Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookmakerStats.map((stat) => (
                  <TableRow key={stat.bookmaker}>
                    <TableCell className="font-medium">{stat.bookmaker}</TableCell>
                    <TableCell className="text-right">{stat.totalBets}</TableCell>
                    <TableCell className="text-right">€{stat.totalStake.toFixed(2)}</TableCell>
                    <TableCell className="text-right">€{stat.totalReturn.toFixed(2)}</TableCell>
                    <TableCell className={`text-right font-medium ${stat.profit >= 0 ? 'text-[hsl(var(--profit))]' : 'text-[hsl(var(--loss))]'}`}>
                      {stat.profit >= 0 ? '+' : ''}€{stat.profit.toFixed(2)}
                    </TableCell>
                    <TableCell className={`text-right ${stat.roi >= 0 ? 'text-[hsl(var(--profit))]' : 'text-[hsl(var(--loss))]'}`}>
                      {stat.roi >= 0 ? '+' : ''}{stat.roi.toFixed(2)}%
                    </TableCell>
                    <TableCell className="text-right">{stat.winRate.toFixed(1)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance by Bet Type</CardTitle>
          <CardDescription>Compare your results across bet types</CardDescription>
        </CardHeader>
        <CardContent>
          {betTypeStats.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No data available</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Bets</TableHead>
                  <TableHead className="text-right">Total Stake</TableHead>
                  <TableHead className="text-right">Profit</TableHead>
                  <TableHead className="text-right">ROI</TableHead>
                  <TableHead className="text-right">Win Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {betTypeStats.map((stat) => (
                  <TableRow key={stat.type}>
                    <TableCell className="font-medium capitalize">{stat.type}</TableCell>
                    <TableCell className="text-right">{stat.totalBets}</TableCell>
                    <TableCell className="text-right">€{stat.totalStake.toFixed(2)}</TableCell>
                    <TableCell className={`text-right font-medium ${stat.profit >= 0 ? 'text-[hsl(var(--profit))]' : 'text-[hsl(var(--loss))]'}`}>
                      {stat.profit >= 0 ? '+' : ''}€{stat.profit.toFixed(2)}
                    </TableCell>
                    <TableCell className={`text-right ${stat.roi >= 0 ? 'text-[hsl(var(--profit))]' : 'text-[hsl(var(--loss))]'}`}>
                      {stat.roi >= 0 ? '+' : ''}{stat.roi.toFixed(2)}%
                    </TableCell>
                    <TableCell className="text-right">{stat.winRate.toFixed(1)}%</TableCell>
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
