import { useMemo, useState } from 'react';
import { useBettingData } from '@/hooks/useBettingData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil, Trash2, Search } from 'lucide-react';
import { BetType, BetStatus } from '@/types/betting';

export default function BetsList() {
  const { bets, bookmakers, deleteBet } = useBettingData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBookmaker, setFilterBookmaker] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredBets = useMemo(() => {
    return bets.filter(bet => {
      const matchesSearch = bet.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          bet.bookmaker.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBookmaker = filterBookmaker === 'all' || bet.bookmaker === filterBookmaker;
      const matchesType = filterType === 'all' || bet.betType === filterType;
      const matchesStatus = filterStatus === 'all' || bet.status === filterStatus;
      
      return matchesSearch && matchesBookmaker && matchesType && matchesStatus;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [bets, searchTerm, filterBookmaker, filterType, filterStatus]);

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this bet?')) {
      deleteBet(id);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bets</h1>
        <p className="text-muted-foreground">Manage and view all your bets</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter your bets by various criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={filterBookmaker} onValueChange={setFilterBookmaker}>
              <SelectTrigger>
                <SelectValue placeholder="All Bookmakers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Bookmakers</SelectItem>
                {bookmakers.map((bm) => (
                  <SelectItem key={bm.id} value={bm.name}>{bm.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="simple">Simple</SelectItem>
                <SelectItem value="multiple">Multiple</SelectItem>
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="won">Won</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
                <SelectItem value="void">Void</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Bets ({filteredBets.length})</CardTitle>
          <CardDescription>Complete history of your bets</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredBets.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No bets found matching your criteria</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Bookmaker</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Stake</TableHead>
                    <TableHead className="text-right">Odds</TableHead>
                    <TableHead className="text-right">Return</TableHead>
                    <TableHead className="text-right">Profit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBets.map((bet) => (
                    <TableRow key={bet.id}>
                      <TableCell className="font-medium">{bet.operationNumber}</TableCell>
                      <TableCell>{new Date(bet.date).toLocaleDateString()}</TableCell>
                      <TableCell>{bet.bookmaker}</TableCell>
                      <TableCell className="capitalize">{bet.betType}</TableCell>
                      <TableCell className="max-w-xs truncate">{bet.description}</TableCell>
                      <TableCell className="text-right">€{bet.amount.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{bet.odds.toFixed(2)}</TableCell>
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
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="icon" variant="ghost" className="h-8 w-8">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(bet.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
