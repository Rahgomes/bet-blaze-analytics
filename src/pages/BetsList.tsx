import { useMemo, useState, useEffect } from 'react';
import { useBettingData } from '@/hooks/useBettingData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pencil, Trash2, Search, Eye } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { BetType, BetStatus, Bet } from '@/types/betting';
import { TimePeriod, filterBetsByPeriod } from '@/utils/dateFilters';
import { generateMockBets } from '@/utils/mockData';

export default function BetsList() {
  const { bets: realBets, bookmakers, deleteBet, updateBet } = useBettingData();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBookmaker, setFilterBookmaker] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('all');
  const [selectedBet, setSelectedBet] = useState<Bet | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<Bet | null>(null);

  // Merge real bets with mock bets for demonstration
  const allBets = useMemo(() => {
    const mockBets = realBets.length === 0 ? generateMockBets() : [];
    return [...realBets, ...mockBets];
  }, [realBets]);

  const bets = useMemo(() => filterBetsByPeriod(allBets, selectedPeriod), [allBets, selectedPeriod]);

  useEffect(() => {
    if (location.state?.period) {
      setSelectedPeriod(location.state.period as TimePeriod);
    }
  }, [location.state]);

  const filteredBets = useMemo(() => {
    return bets.filter(bet => {
      const matchesSearch = bet.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          bet.bookmaker.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          bet.league?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          bet.market?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBookmaker = filterBookmaker === 'all' || bet.bookmaker === filterBookmaker;
      const matchesType = filterType === 'all' || bet.betType === filterType;
      const matchesStatus = filterStatus === 'all' || bet.status === filterStatus;
      
      return matchesSearch && matchesBookmaker && matchesType && matchesStatus;
    }).sort((a, b) => new Date(b.matchTime || b.date).getTime() - new Date(a.matchTime || a.date).getTime());
  }, [bets, searchTerm, filterBookmaker, filterType, filterStatus]);

  const isLiveBet = (bet: Bet) => {
    if (!bet.matchTime || !bet.isLive || bet.status !== 'pending') return false;
    const matchDate = new Date(bet.matchTime).toDateString();
    const today = new Date().toDateString();
    return matchDate === today;
  };

  const handleDelete = (id: string) => {
    if (id.startsWith('mock-')) {
      alert('Cannot delete mock data. Add real bets to manage them.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this bet?')) {
      deleteBet(id);
    }
  };

  const handleView = (bet: Bet) => {
    setSelectedBet(bet);
    setViewDialogOpen(true);
  };

  const handleEdit = (bet: Bet) => {
    if (bet.id.startsWith('mock-')) {
      alert('Cannot edit mock data. Add real bets to manage them.');
      return;
    }
    setEditForm(bet);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editForm) return;
    
    const amount = editForm.amount;
    const odds = editForm.odds;
    const return_ = editForm.status === 'won' ? amount * odds : 0;
    const profit = return_ - amount;

    updateBet(editForm.id, {
      ...editForm,
      return: return_,
      profit,
    });

    setEditDialogOpen(false);
    setEditForm(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bets</h1>
          <p className="text-muted-foreground">Manage and view all your bets</p>
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
                    <TableHead>Match Time</TableHead>
                    <TableHead>League</TableHead>
                    <TableHead>Market</TableHead>
                    <TableHead>Bookmaker</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Strategies</TableHead>
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
                    <TableRow 
                      key={bet.id}
                      className={isLiveBet(bet) ? 'bg-orange-500/10 border-l-4 border-l-orange-500' : ''}
                    >
                      <TableCell className="font-medium">{bet.operationNumber}</TableCell>
                      <TableCell>{new Date(bet.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {bet.matchTime ? new Date(bet.matchTime).toLocaleString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        }) : '-'}
                      </TableCell>
                      <TableCell>{bet.league || '-'}</TableCell>
                      <TableCell>{bet.market || '-'}</TableCell>
                      <TableCell>{bet.bookmaker}</TableCell>
                      <TableCell className="capitalize">{bet.betType}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {bet.description}
                        {isLiveBet(bet) && <Badge className="ml-2 bg-orange-500">LIVE</Badge>}
                      </TableCell>
                      <TableCell>
                        {bet.strategies && bet.strategies.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {bet.strategies.map((s, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>
                            ))}
                          </div>
                        ) : '-'}
                      </TableCell>
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
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleView(bet)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(bet)}>
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

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bet Details</DialogTitle>
            <DialogDescription>Complete information about this bet</DialogDescription>
          </DialogHeader>
          {selectedBet && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Operation #</Label>
                  <p className="font-medium">{selectedBet.operationNumber}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Date</Label>
                  <p className="font-medium">{new Date(selectedBet.date).toLocaleDateString()}</p>
                </div>
                {selectedBet.matchTime && (
                  <div>
                    <Label className="text-muted-foreground">Match Time</Label>
                    <p className="font-medium">{new Date(selectedBet.matchTime).toLocaleString()}</p>
                  </div>
                )}
                {selectedBet.league && (
                  <div>
                    <Label className="text-muted-foreground">League</Label>
                    <p className="font-medium">{selectedBet.league}</p>
                  </div>
                )}
                {selectedBet.market && (
                  <div>
                    <Label className="text-muted-foreground">Market</Label>
                    <p className="font-medium">{selectedBet.market}</p>
                  </div>
                )}
                <div>
                  <Label className="text-muted-foreground">Bookmaker</Label>
                  <p className="font-medium">{selectedBet.bookmaker}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Type</Label>
                  <p className="font-medium capitalize">{selectedBet.betType}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Stake</Label>
                  <p className="font-medium">€{selectedBet.amount.toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Odds</Label>
                  <p className="font-medium">{selectedBet.odds.toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Return</Label>
                  <p className="font-medium">€{selectedBet.return.toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Profit/Loss</Label>
                  <p className={`font-medium ${selectedBet.profit >= 0 ? 'text-[hsl(var(--profit))]' : 'text-[hsl(var(--loss))]'}`}>
                    {selectedBet.profit >= 0 ? '+' : ''}€{selectedBet.profit.toFixed(2)}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">ROI</Label>
                  <p className="font-medium">{((selectedBet.profit / selectedBet.amount) * 100).toFixed(2)}%</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge variant="outline" className={
                    selectedBet.status === 'won'
                      ? 'bg-[hsl(var(--profit)/0.1)] text-[hsl(var(--profit))] border-[hsl(var(--profit)/0.3)]'
                      : selectedBet.status === 'lost'
                      ? 'bg-[hsl(var(--loss)/0.1)] text-[hsl(var(--loss))] border-[hsl(var(--loss)/0.3)]'
                      : ''
                  }>
                    {selectedBet.status}
                  </Badge>
                </div>
              </div>
              {selectedBet.strategies && selectedBet.strategies.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Strategies/Protection</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedBet.strategies.map((s, i) => (
                      <Badge key={i} variant="secondary">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {selectedBet.description && (
                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="mt-1">{selectedBet.description}</p>
                </div>
              )}
              {selectedBet.stakeLogic && (
                <div>
                  <Label className="text-muted-foreground">Stake Logic</Label>
                  <p className="mt-1">{selectedBet.stakeLogic}</p>
                </div>
              )}
              <div className="flex gap-4">
                {selectedBet.isProtected && <Badge>Protected</Badge>}
                {selectedBet.isLive && <Badge variant="secondary">Live</Badge>}
                {isLiveBet(selectedBet) && <Badge className="bg-orange-500">LIVE NOW</Badge>}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Bet</DialogTitle>
            <DialogDescription>Update bet information</DialogDescription>
          </DialogHeader>
          {editForm && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-stake">Stake (€)</Label>
                  <Input
                    id="edit-stake"
                    type="number"
                    step="0.01"
                    value={editForm.amount}
                    onChange={(e) => setEditForm({ ...editForm, amount: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-odds">Odds</Label>
                  <Input
                    id="edit-odds"
                    type="number"
                    step="0.01"
                    value={editForm.odds}
                    onChange={(e) => setEditForm({ ...editForm, odds: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-status">Status</Label>
                  <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v as BetStatus })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="won">Won</SelectItem>
                      <SelectItem value="lost">Lost</SelectItem>
                      <SelectItem value="void">Void</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-type">Bet Type</Label>
                  <Select value={editForm.betType} onValueChange={(v) => setEditForm({ ...editForm, betType: v as BetType })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="simple">Simple</SelectItem>
                      <SelectItem value="multiple">Multiple</SelectItem>
                      <SelectItem value="live">Live</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="edit-logic">Stake Logic</Label>
                <Textarea
                  id="edit-logic"
                  value={editForm.stakeLogic || ''}
                  onChange={(e) => setEditForm({ ...editForm, stakeLogic: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveEdit}>Save Changes</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
