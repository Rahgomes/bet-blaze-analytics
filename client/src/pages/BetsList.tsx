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
import { BetType, BetStatus, Bet } from '@/types/betting';
import { TimePeriod, filterBetsByPeriod } from '@/utils/dateFilters';
import { generateMockBets } from '@/utils/mockData';

export default function BetsList() {
  const { bets: realBets, bookmakers, deleteBet, updateBet } = useBettingData();
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
      alert('Não é possível excluir dados de demonstração. Adicione apostas reais para gerenciá-las.');
      return;
    }
    if (window.confirm('Tem certeza que deseja excluir esta aposta?')) {
      deleteBet(id);
    }
  };

  const handleView = (bet: Bet) => {
    setSelectedBet(bet);
    setViewDialogOpen(true);
  };

  const handleEdit = (bet: Bet) => {
    if (bet.id.startsWith('mock-')) {
      alert('Não é possível editar dados de demonstração. Adicione apostas reais para gerenciá-las.');
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
          <h1 className="text-3xl font-bold tracking-tight">Apostas</h1>
          <p className="text-muted-foreground">Gerencie e visualize todas as suas apostas</p>
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

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Filtre suas apostas por diversos critérios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={filterBookmaker} onValueChange={setFilterBookmaker}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as Casas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Casas</SelectItem>
                {bookmakers.map((bm) => (
                  <SelectItem key={bm.id} value={bm.name}>{bm.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os Tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="simple">Simples</SelectItem>
                <SelectItem value="multiple">Múltipla</SelectItem>
                <SelectItem value="live">Ao Vivo</SelectItem>
                <SelectItem value="system">Sistema</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="won">Ganha</SelectItem>
                <SelectItem value="lost">Perdida</SelectItem>
                <SelectItem value="void">Anulada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Todas as Apostas ({filteredBets.length})</CardTitle>
          <CardDescription>Histórico completo das suas apostas</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredBets.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhuma aposta encontrada com esses critérios</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Hora do Jogo</TableHead>
                    <TableHead>Liga</TableHead>
                    <TableHead>Mercado</TableHead>
                    <TableHead>Casa</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Estratégias</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-right">Odds</TableHead>
                    <TableHead className="text-right">Retorno</TableHead>
                    <TableHead className="text-right">Lucro</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBets.map((bet) => (
                    <TableRow
                      key={bet.id}
                      className={isLiveBet(bet) ? 'bg-orange-500/10 border-l-4 border-l-orange-500' : ''}
                    >
                      <TableCell>{bet.operationNumber}</TableCell>
                      <TableCell>{new Date(bet.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {bet.matchTime ? new Date(bet.matchTime).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false
                        }) : '-'}
                      </TableCell>
                      <TableCell>{bet.league || '-'}</TableCell>
                      <TableCell>{bet.market || '-'}</TableCell>
                      <TableCell>{bet.bookmaker}</TableCell>
                      <TableCell className="capitalize">{bet.betType === 'simple' ? 'simples' : bet.betType === 'multiple' ? 'múltipla' : bet.betType === 'live' ? 'ao vivo' : bet.betType === 'system' ? 'sistema' : bet.betType}</TableCell>
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
                      <TableCell className="text-right">R$ {bet.amount.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{bet.odds.toFixed(2)}</TableCell>
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
                          {bet.status === 'won' ? 'ganha' : bet.status === 'lost' ? 'perdida' : bet.status === 'pending' ? 'pendente' : bet.status === 'void' ? 'anulada' : bet.status}
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
            <DialogTitle>Detalhes da Aposta</DialogTitle>
            <DialogDescription>Informações completas sobre esta aposta</DialogDescription>
          </DialogHeader>
          {selectedBet && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Operação #</Label>
                  <p className="font-medium">{selectedBet.operationNumber}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Data</Label>
                  <p className="font-medium">{new Date(selectedBet.date).toLocaleDateString()}</p>
                </div>
                {selectedBet.matchTime && (
                  <div>
                    <Label className="text-muted-foreground">Hora do Jogo</Label>
                    <p className="font-medium">{new Date(selectedBet.matchTime).toLocaleString()}</p>
                  </div>
                )}
                {selectedBet.league && (
                  <div>
                    <Label className="text-muted-foreground">Liga</Label>
                    <p className="font-medium">{selectedBet.league}</p>
                  </div>
                )}
                {selectedBet.market && (
                  <div>
                    <Label className="text-muted-foreground">Mercado</Label>
                    <p className="font-medium">{selectedBet.market}</p>
                  </div>
                )}
                <div>
                  <Label className="text-muted-foreground">Casa</Label>
                  <p className="font-medium">{selectedBet.bookmaker}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Tipo</Label>
                  <p className="font-medium capitalize">{selectedBet.betType === 'simple' ? 'simples' : selectedBet.betType === 'multiple' ? 'múltipla' : selectedBet.betType === 'live' ? 'ao vivo' : selectedBet.betType === 'system' ? 'sistema' : selectedBet.betType}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Valor</Label>
                  <p className="font-medium">R$ {selectedBet.amount.toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Odds</Label>
                  <p className="font-medium">{selectedBet.odds.toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Retorno</Label>
                  <p className="font-medium">R$ {selectedBet.return.toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Lucro/Prejuízo</Label>
                  <p className={`font-medium ${selectedBet.profit >= 0 ? 'text-[hsl(var(--profit))]' : 'text-[hsl(var(--loss))]'}`}>
                    {selectedBet.profit >= 0 ? '+' : ''}R$ {selectedBet.profit.toFixed(2)}
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
                    {selectedBet.status === 'won' ? 'ganha' : selectedBet.status === 'lost' ? 'perdida' : selectedBet.status === 'pending' ? 'pendente' : selectedBet.status === 'void' ? 'anulada' : selectedBet.status}
                  </Badge>
                </div>
              </div>
              {selectedBet.strategies && selectedBet.strategies.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Estratégias/Proteção</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedBet.strategies.map((s, i) => (
                      <Badge key={i} variant="secondary">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {selectedBet.description && (
                <div>
                  <Label className="text-muted-foreground">Descrição</Label>
                  <p className="mt-1">{selectedBet.description}</p>
                </div>
              )}
              {selectedBet.stakeLogic && (
                <div>
                  <Label className="text-muted-foreground">Lógica do Valor</Label>
                  <p className="mt-1">{selectedBet.stakeLogic}</p>
                </div>
              )}
              <div className="flex gap-4">
                {selectedBet.isProtected && <Badge>Protegida</Badge>}
                {selectedBet.isLive && <Badge variant="secondary">Ao Vivo</Badge>}
                {isLiveBet(selectedBet) && <Badge className="bg-orange-500">AO VIVO AGORA</Badge>}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Aposta</DialogTitle>
            <DialogDescription>Atualizar informações da aposta</DialogDescription>
          </DialogHeader>
          {editForm && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-stake">Valor (R$)</Label>
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
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="won">Ganha</SelectItem>
                      <SelectItem value="lost">Perdida</SelectItem>
                      <SelectItem value="void">Anulada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-type">Tipo de Aposta</Label>
                  <Select value={editForm.betType} onValueChange={(v) => setEditForm({ ...editForm, betType: v as BetType })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="simple">Simples</SelectItem>
                      <SelectItem value="multiple">Múltipla</SelectItem>
                      <SelectItem value="live">Ao Vivo</SelectItem>
                      <SelectItem value="system">Sistema</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="edit-description">Descrição</Label>
                <Textarea
                  id="edit-description"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="edit-logic">Lógica do Valor</Label>
                <Textarea
                  id="edit-logic"
                  value={editForm.stakeLogic || ''}
                  onChange={(e) => setEditForm({ ...editForm, stakeLogic: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleSaveEdit}>Salvar Alterações</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
