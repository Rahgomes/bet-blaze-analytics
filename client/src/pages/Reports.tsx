import { useMemo, useState } from 'react';
import { useBettingData } from '@/hooks/useBettingData';
import { generateMockBets } from '@/utils/mockData';
import { filterBetsByPeriod, calculateStats, TimePeriod } from '@/utils/dateFilters';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Eye } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function Reports() {
  const { bets } = useBettingData();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('all');
  const [detailView, setDetailView] = useState<{ type: string; value: string; bets: any[] } | null>(null);

  const mockBets = generateMockBets();
  const allBets = [...bets, ...mockBets];
  const filteredBets = filterBetsByPeriod(allBets, selectedPeriod);

  // Team Statistics
  const teamStats = useMemo(() => {
    const stats = new Map<string, { bets: any[]; profit: number; wins: number; losses: number; totalStake: number }>();
    
    filteredBets.forEach(bet => {
      if (bet.teams) {
        bet.teams.forEach(team => {
          if (!stats.has(team)) {
            stats.set(team, { bets: [], profit: 0, wins: 0, losses: 0, totalStake: 0 });
          }
          const teamData = stats.get(team)!;
          teamData.bets.push(bet);
          teamData.profit += bet.profit;
          teamData.totalStake += bet.amount;
          if (bet.status === 'won') teamData.wins++;
          if (bet.status === 'lost') teamData.losses++;
        });
      }
    });

    return Array.from(stats.entries()).map(([team, data]) => ({
      team,
      ...data,
      totalBets: data.bets.length,
      roi: data.totalStake > 0 ? (data.profit / data.totalStake) * 100 : 0,
      winRate: data.bets.length > 0 ? (data.wins / data.bets.length) * 100 : 0,
    })).sort((a, b) => b.profit - a.profit);
  }, [filteredBets]);

  // League Statistics
  const leagueStats = useMemo(() => {
    const stats = new Map<string, { bets: any[]; profit: number; wins: number; losses: number; totalStake: number }>();
    
    filteredBets.forEach(bet => {
      if (bet.league) {
        if (!stats.has(bet.league)) {
          stats.set(bet.league, { bets: [], profit: 0, wins: 0, losses: 0, totalStake: 0 });
        }
        const leagueData = stats.get(bet.league)!;
        leagueData.bets.push(bet);
        leagueData.profit += bet.profit;
        leagueData.totalStake += bet.amount;
        if (bet.status === 'won') leagueData.wins++;
        if (bet.status === 'lost') leagueData.losses++;
      }
    });

    return Array.from(stats.entries()).map(([league, data]) => ({
      league,
      ...data,
      totalBets: data.bets.length,
      roi: data.totalStake > 0 ? (data.profit / data.totalStake) * 100 : 0,
      winRate: data.bets.length > 0 ? (data.wins / data.bets.length) * 100 : 0,
    })).sort((a, b) => b.profit - a.profit);
  }, [filteredBets]);

  // Strategy Statistics
  const strategyStats = useMemo(() => {
    const stats = new Map<string, { bets: any[]; profit: number; wins: number; losses: number; totalStake: number }>();
    
    filteredBets.forEach(bet => {
      if (bet.strategies) {
        bet.strategies.forEach(strategy => {
          if (!stats.has(strategy)) {
            stats.set(strategy, { bets: [], profit: 0, wins: 0, losses: 0, totalStake: 0 });
          }
          const stratData = stats.get(strategy)!;
          stratData.bets.push(bet);
          stratData.profit += bet.profit;
          stratData.totalStake += bet.amount;
          if (bet.status === 'won') stratData.wins++;
          if (bet.status === 'lost') stratData.losses++;
        });
      }
    });

    return Array.from(stats.entries()).map(([strategy, data]) => ({
      strategy,
      ...data,
      totalBets: data.bets.length,
      roi: data.totalStake > 0 ? (data.profit / data.totalStake) * 100 : 0,
      winRate: data.bets.length > 0 ? (data.wins / data.bets.length) * 100 : 0,
    })).sort((a, b) => b.profit - a.profit);
  }, [filteredBets]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">Detailed performance analysis by team, league, and strategy</p>
      </div>

      <Tabs value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as TimePeriod)}>
        <TabsList>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="month">Month</TabsTrigger>
          <TabsTrigger value="year">Year</TabsTrigger>
          <TabsTrigger value="all">All Time</TabsTrigger>
        </TabsList>
      </Tabs>

      <Tabs defaultValue="teams">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="teams">By Team</TabsTrigger>
          <TabsTrigger value="leagues">By League</TabsTrigger>
          <TabsTrigger value="strategies">By Strategy</TabsTrigger>
        </TabsList>

        <TabsContent value="teams" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance by Team</CardTitle>
              <CardDescription>Analyze your betting results for each team</CardDescription>
            </CardHeader>
            <CardContent>
              {teamStats.length > 0 && (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={teamStats.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="team" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="profit" fill="#8884d8" name="Profit (€)" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Team Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team</TableHead>
                    <TableHead>Total Bets</TableHead>
                    <TableHead>Wins</TableHead>
                    <TableHead>Win Rate</TableHead>
                    <TableHead>Total Stake</TableHead>
                    <TableHead>Profit</TableHead>
                    <TableHead>ROI</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamStats.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        No team data available
                      </TableCell>
                    </TableRow>
                  ) : (
                    teamStats.map((stat) => (
                      <TableRow key={stat.team}>
                        <TableCell className="font-medium">{stat.team}</TableCell>
                        <TableCell>{stat.totalBets}</TableCell>
                        <TableCell>{stat.wins}</TableCell>
                        <TableCell>{stat.winRate.toFixed(1)}%</TableCell>
                        <TableCell>€{stat.totalStake.toFixed(2)}</TableCell>
                        <TableCell className={stat.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                          €{stat.profit.toFixed(2)}
                        </TableCell>
                        <TableCell className={stat.roi >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {stat.roi.toFixed(2)}%
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDetailView({ type: 'team', value: stat.team, bets: stat.bets })}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leagues" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance by League</CardTitle>
              <CardDescription>Analyze your betting results for each league</CardDescription>
            </CardHeader>
            <CardContent>
              {leagueStats.length > 0 && (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={leagueStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="league" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="profit" fill="#82ca9d" name="Profit (€)" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>League Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>League</TableHead>
                    <TableHead>Total Bets</TableHead>
                    <TableHead>Wins</TableHead>
                    <TableHead>Win Rate</TableHead>
                    <TableHead>Total Stake</TableHead>
                    <TableHead>Profit</TableHead>
                    <TableHead>ROI</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leagueStats.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        No league data available
                      </TableCell>
                    </TableRow>
                  ) : (
                    leagueStats.map((stat) => (
                      <TableRow key={stat.league}>
                        <TableCell className="font-medium">{stat.league}</TableCell>
                        <TableCell>{stat.totalBets}</TableCell>
                        <TableCell>{stat.wins}</TableCell>
                        <TableCell>{stat.winRate.toFixed(1)}%</TableCell>
                        <TableCell>€{stat.totalStake.toFixed(2)}</TableCell>
                        <TableCell className={stat.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                          €{stat.profit.toFixed(2)}
                        </TableCell>
                        <TableCell className={stat.roi >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {stat.roi.toFixed(2)}%
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDetailView({ type: 'league', value: stat.league, bets: stat.bets })}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strategies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance by Strategy</CardTitle>
              <CardDescription>Analyze your betting results for each strategy</CardDescription>
            </CardHeader>
            <CardContent>
              {strategyStats.length > 0 && (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={strategyStats}
                      dataKey="totalBets"
                      nameKey="strategy"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {strategyStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Strategy Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Strategy</TableHead>
                    <TableHead>Total Bets</TableHead>
                    <TableHead>Wins</TableHead>
                    <TableHead>Win Rate</TableHead>
                    <TableHead>Total Stake</TableHead>
                    <TableHead>Profit</TableHead>
                    <TableHead>ROI</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {strategyStats.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        No strategy data available
                      </TableCell>
                    </TableRow>
                  ) : (
                    strategyStats.map((stat) => (
                      <TableRow key={stat.strategy}>
                        <TableCell className="font-medium">
                          <Badge>{stat.strategy}</Badge>
                        </TableCell>
                        <TableCell>{stat.totalBets}</TableCell>
                        <TableCell>{stat.wins}</TableCell>
                        <TableCell>{stat.winRate.toFixed(1)}%</TableCell>
                        <TableCell>€{stat.totalStake.toFixed(2)}</TableCell>
                        <TableCell className={stat.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                          €{stat.profit.toFixed(2)}
                        </TableCell>
                        <TableCell className={stat.roi >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {stat.roi.toFixed(2)}%
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDetailView({ type: 'strategy', value: stat.strategy, bets: stat.bets })}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!detailView} onOpenChange={() => setDetailView(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {detailView?.type === 'team' && `Team: ${detailView.value}`}
              {detailView?.type === 'league' && `League: ${detailView.value}`}
              {detailView?.type === 'strategy' && `Strategy: ${detailView.value}`}
            </DialogTitle>
          </DialogHeader>
          {detailView && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Stake</TableHead>
                  <TableHead>Odds</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Profit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detailView.bets.map((bet) => (
                  <TableRow key={bet.id}>
                    <TableCell>{bet.date}</TableCell>
                    <TableCell>{bet.description}</TableCell>
                    <TableCell>€{bet.amount.toFixed(2)}</TableCell>
                    <TableCell>{bet.odds.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={bet.status === 'won' ? 'default' : bet.status === 'lost' ? 'destructive' : 'secondary'}>
                        {bet.status}
                      </Badge>
                    </TableCell>
                    <TableCell className={bet.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                      €{bet.profit.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
