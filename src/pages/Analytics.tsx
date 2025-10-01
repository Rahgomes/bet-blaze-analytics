import { useMemo } from 'react';
import { useBettingData } from '@/hooks/useBettingData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BookmakerStats } from '@/types/betting';

export default function Analytics() {
  const { bets, bookmakers } = useBettingData();

  const bookmakerStats = useMemo((): BookmakerStats[] => {
    return bookmakers.map((bm) => {
      const bookmakerBets = bets.filter(b => b.bookmaker === bm.name);
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
  }, [bets, bookmakers]);

  const betTypeStats = useMemo(() => {
    const types = ['simple', 'multiple', 'live', 'system'];
    return types.map(type => {
      const typeBets = bets.filter(b => b.betType === type);
      const totalBets = typeBets.length;
      const totalStake = typeBets.reduce((sum, b) => sum + b.amount, 0);
      const profit = typeBets.reduce((sum, b) => sum + b.profit, 0);
      const roi = totalStake > 0 ? (profit / totalStake) * 100 : 0;
      const wonBets = typeBets.filter(b => b.status === 'won').length;
      const winRate = totalBets > 0 ? (wonBets / totalBets) * 100 : 0;

      return { type, totalBets, totalStake, profit, roi, winRate };
    }).filter(stat => stat.totalBets > 0);
  }, [bets]);

  const monthlyStats = useMemo(() => {
    const months = new Map<string, { stake: number; return_: number; profit: number; bets: number }>();
    
    bets.forEach(bet => {
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
      .sort((a, b) => b.month.localeCompare(a.month));
  }, [bets]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Detailed performance analysis</p>
      </div>

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

      <Card>
        <CardHeader>
          <CardTitle>Monthly Performance</CardTitle>
          <CardDescription>Track your performance over time</CardDescription>
        </CardHeader>
        <CardContent>
          {monthlyStats.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No data available</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Bets</TableHead>
                  <TableHead className="text-right">Total Stake</TableHead>
                  <TableHead className="text-right">Total Return</TableHead>
                  <TableHead className="text-right">Profit</TableHead>
                  <TableHead className="text-right">ROI</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyStats.map((stat) => (
                  <TableRow key={stat.month}>
                    <TableCell className="font-medium">{stat.month}</TableCell>
                    <TableCell className="text-right">{stat.bets}</TableCell>
                    <TableCell className="text-right">€{stat.stake.toFixed(2)}</TableCell>
                    <TableCell className="text-right">€{stat.return_.toFixed(2)}</TableCell>
                    <TableCell className={`text-right font-medium ${stat.profit >= 0 ? 'text-[hsl(var(--profit))]' : 'text-[hsl(var(--loss))]'}`}>
                      {stat.profit >= 0 ? '+' : ''}€{stat.profit.toFixed(2)}
                    </TableCell>
                    <TableCell className={`text-right ${stat.roi >= 0 ? 'text-[hsl(var(--profit))]' : 'text-[hsl(var(--loss))]'}`}>
                      {stat.roi >= 0 ? '+' : ''}{stat.roi.toFixed(2)}%
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
