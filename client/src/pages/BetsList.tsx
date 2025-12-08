import { useMemo, useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useBettingStore } from '@/stores/betting';
import { useBetsListFilterStore, PeriodFilter } from '@/stores/filters/betsListFilterStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Pencil, Trash2, Search, Eye, Calendar, Filter, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { BetType, BetStatus, Bet } from '@/types/betting';
import { TimePeriod, filterBetsByPeriod } from '@/utils/dateFilters';
import { generateMockBets } from '@/utils/mockData';

export default function BetsList() {
  const { t, language } = useTranslation();

  // Dados da betting store
  const realBets = useBettingStore(state => state.bets);
  const bookmakers = useBettingStore(state => state.bookmakers);
  const deleteBet = useBettingStore(state => state.deleteBet);
  const updateBet = useBettingStore(state => state.updateBet);

  // Filtros da BetsList filter store
  const {
    searchTerm, filterBookmaker, filterType, filterStatus, filterPeriod,
    filterProfit, filterTeam, oddsRange, amountRange, filterHasBoost,
    filterHasCashout, filterUsedCredits, filterIsProtected, sortColumn,
    sortDirection, currentPage, itemsPerPage, showAdvancedFilters,
    setSearchTerm, setFilterBookmaker, setFilterType, setFilterStatus,
    setFilterPeriod, setFilterProfit, setFilterTeam, setOddsRange,
    setAmountRange, setFilterHasBoost, setFilterHasCashout,
    setFilterUsedCredits, setFilterIsProtected, setSortColumn,
    setSortDirection, setCurrentPage, setItemsPerPage, setShowAdvancedFilters,
  } = useBetsListFilterStore();

  const isMobile = useIsMobile();
  const [, setLocation] = useLocation();

  // Estados locais (não relacionados a filtros)
  const [selectedBet, setSelectedBet] = useState<Bet | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [betToDelete, setBetToDelete] = useState<string>('');
  const [editForm, setEditForm] = useState<Bet | null>(null);

  // Estados para botão "Voltar"
  const [showReturnButton, setShowReturnButton] = useState(false);
  const [returnPath, setReturnPath] = useState('/');
  const [returnLabel, setReturnLabel] = useState(t('common.back'));

  // Verificar query params e sessionStorage ao montar
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const teamParam = params.get('team');

    if (teamParam) {
      setFilterTeam(decodeURIComponent(teamParam));
    }

    const savedPath = sessionStorage.getItem('betsReturnPath');
    const savedLabel = sessionStorage.getItem('betsReturnLabel');

    if (savedPath) {
      setShowReturnButton(true);
      setReturnPath(savedPath);
      setReturnLabel(savedLabel || t('common.back'));
    }
  }, [setFilterTeam, t]);

  // Merge real bets with mock bets for demonstration
  const allBets = useMemo(() => {
    const mockBets = realBets.length === 0 ? generateMockBets() : [];
    return [...realBets, ...mockBets];
  }, [realBets]);

  // Extrair times únicos
  const uniqueTeams = useMemo(() => {
    const teams = new Set<string>();
    allBets.forEach(bet => {
      bet.teams?.forEach(team => teams.add(team));
    });
    return Array.from(teams).sort();
  }, [allBets]);

  // Função para filtrar por período avançado
  const filterBetsByAdvancedPeriod = (bets: Bet[], period: PeriodFilter): Bet[] => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (period) {
      case 'today-games':
        return bets.filter(bet => {
          const betDate = new Date(bet.matchTime || bet.date);
          return betDate >= today && betDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
        });
      case 'week-games':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        return bets.filter(bet => {
          const betDate = new Date(bet.matchTime || bet.date);
          return betDate >= weekStart;
        });
      case 'month-games':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        return bets.filter(bet => {
          const betDate = new Date(bet.matchTime || bet.date);
          return betDate >= monthStart;
        });
      case 'last-10':
        return bets.slice(0, 10);
      case 'last-20':
        return bets.slice(0, 20);
      case 'last-50':
        return bets.slice(0, 50);
      case 'last-100':
        return bets.slice(0, 100);
      default:
        return bets;
    }
  };

  const bets = useMemo(() => {
    const sortedBets = [...allBets].sort((a, b) => 
      new Date(b.matchTime || b.date).getTime() - new Date(a.matchTime || a.date).getTime()
    );
    return filterBetsByAdvancedPeriod(sortedBets, filterPeriod);
  }, [allBets, filterPeriod]);

  const filteredBets = useMemo(() => {
    let filtered = bets.filter(bet => {
      const matchesSearch = bet.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bet.bookmaker.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bet.league?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bet.market?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBookmaker = filterBookmaker === 'all' || bet.bookmaker === filterBookmaker;
      const matchesType = filterType === 'all' || bet.betType === filterType;
      const matchesStatus = filterStatus === 'all' || bet.status === filterStatus;

      // Filtro de time (compara exatamente com o nome do time)
      const matchesTeam = filterTeam === 'all' ||
        bet.teams?.some(t => t === filterTeam || t.toLowerCase() === filterTeam.toLowerCase());

      // Filtro de lucro/prejuízo
      const matchesProfit = filterProfit === 'all' ||
        (filterProfit === 'profit' && bet.profit > 0) ||
        (filterProfit === 'loss' && bet.profit < 0) ||
        (filterProfit === 'breakeven' && bet.profit === 0);

      // Filtros de range
      const matchesOddsRange = bet.odds >= oddsRange.min && bet.odds <= oddsRange.max;
      const matchesAmountRange = bet.amount >= amountRange.min && bet.amount <= amountRange.max;

      // Filtros por características especiais (simulados)
      const hasBoost = bet.id.includes('1'); // Simular boost
      const hasCashout = bet.id.includes('2'); // Simular cashout
      const usedCredits = bet.id.includes('3'); // Simular créditos
      const isProtected = bet.isProtected || false;

      const matchesBoost = !filterHasBoost || hasBoost;
      const matchesCashout = !filterHasCashout || hasCashout;
      const matchesCredits = !filterUsedCredits || usedCredits;
      const matchesProtected = !filterIsProtected || isProtected;

      return matchesSearch && matchesBookmaker && matchesType && matchesStatus &&
             matchesTeam && matchesProfit && matchesOddsRange && matchesAmountRange &&
             matchesBoost && matchesCashout && matchesCredits && matchesProtected;
    });

    // Aplicar ordenação
    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (sortColumn) {
        case 'date':
          aValue = new Date(a.matchTime || a.date).getTime();
          bValue = new Date(b.matchTime || b.date).getTime();
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'odds':
          aValue = a.odds;
          bValue = b.odds;
          break;
        case 'profit':
          aValue = a.profit;
          bValue = b.profit;
          break;
        default:
          aValue = new Date(a.matchTime || a.date).getTime();
          bValue = new Date(b.matchTime || b.date).getTime();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [bets, searchTerm, filterBookmaker, filterType, filterStatus, filterTeam, filterProfit,
      oddsRange, amountRange, filterHasBoost, filterHasCashout, filterUsedCredits,
      filterIsProtected, sortColumn, sortDirection]);

  // Paginação
  const totalPages = Math.ceil(filteredBets.length / itemsPerPage);
  const paginatedBets = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredBets.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredBets, currentPage, itemsPerPage]);

  const isLiveBet = (bet: Bet) => {
    if (!bet.matchTime || !bet.isLive || bet.status !== 'pending') return false;
    const matchDate = new Date(bet.matchTime).toDateString();
    const today = new Date().toDateString();
    return matchDate === today;
  };

  const handleDelete = (id: string) => {
    setBetToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (betToDelete.startsWith('mock-')) {
      // Simular exclusão de dados mock para demonstração
      console.log('Dados de demonstração excluídos (simulação)');
      // TODO: Adicionar toast notification aqui
      alert('✅ Dados de demonstração excluídos (simulação)\nEm uma aplicação real, isso seria permanente.');
    } else {
      deleteBet(betToDelete);
    }
    setDeleteDialogOpen(false);
    setBetToDelete('');
  };

  const handleView = (bet: Bet) => {
    setSelectedBet(bet);
    setViewDialogOpen(true);
  };

  const handleEdit = (bet: Bet) => {
    setEditForm(bet);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editForm) return;

    const amount = editForm.amount;
    const odds = editForm.odds;
    const return_ = editForm.status === 'won' ? amount * odds : 0;
    const profit = return_ - amount;

    if (editForm.id.startsWith('mock-')) {
      // Simular edição de dados mock para demonstração
      console.log('Dados de demonstração editados (simulação):', {
        ...editForm,
        return: return_,
        profit,
      });
      alert('✅ Edição salva (simulação)\nEm uma aplicação real, as alterações seriam salvas no banco de dados.\n\nNota: Para dados mockados, as alterações não são persistidas após recarregar a página.');
    } else {
      updateBet(editForm.id, {
        ...editForm,
        return: return_,
        profit,
      });
    }

    setEditDialogOpen(false);
    setEditForm(null);
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const handleReturnClick = () => {
    // Limpar sessionStorage ao clicar em voltar
    sessionStorage.removeItem('betsReturnPath');
    sessionStorage.removeItem('betsReturnLabel');
    setLocation(returnPath);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('bets.title')}</h1>
          <p className="text-muted-foreground">{t('bets.manageAndView').replace('{count}', filteredBets.length.toString())}</p>
        </div>
        <div className="flex gap-2">
          {showReturnButton && (
            <Button
              variant="outline"
              onClick={handleReturnClick}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {returnLabel}
            </Button>
          )}
          <Select value={filterPeriod} onValueChange={(v) => setFilterPeriod(v as PeriodFilter)}>
            <SelectTrigger className="w-[200px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder={t('bets.period')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('bets.allBets')}</SelectItem>
              <SelectItem value="today-games">{t('bets.todayGames')}</SelectItem>
              <SelectItem value="week-games">{t('bets.weekGames')}</SelectItem>
              <SelectItem value="month-games">{t('bets.monthGames')}</SelectItem>
              <SelectItem value="last-10">{t('bets.last10')}</SelectItem>
              <SelectItem value="last-20">{t('bets.last20')}</SelectItem>
              <SelectItem value="last-50">{t('bets.last50')}</SelectItem>
              <SelectItem value="last-100">{t('bets.last100')}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={itemsPerPage.toString()} onValueChange={(v) => {
            setItemsPerPage(Number(v));
            setCurrentPage(1);
          }}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="20">{t('bets.perPage').replace('{count}', '20')}</SelectItem>
              <SelectItem value="50">{t('bets.perPage').replace('{count}', '50')}</SelectItem>
              <SelectItem value="100">{t('bets.perPage').replace('{count}', '100')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{t('bets.filters')}</CardTitle>
              <CardDescription>{t('bets.filterByMultipleCriteria')}</CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              {showAdvancedFilters ? t('bets.hideAdvancedFilters') : t('bets.advancedFilters')}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filtros básicos */}
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('bets.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={filterTeam} onValueChange={setFilterTeam}>
              <SelectTrigger>
                <SelectValue placeholder={t('bets.allTeams')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('bets.allTeams')}</SelectItem>
                {uniqueTeams.map((team) => (
                  <SelectItem key={team} value={team}>{team}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterBookmaker} onValueChange={setFilterBookmaker}>
              <SelectTrigger>
                <SelectValue placeholder={t('bets.allHouses')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('bets.allHouses')}</SelectItem>
                {bookmakers.map((bm) => (
                  <SelectItem key={bm.id} value={bm.name}>{bm.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder={t('bets.allTypes')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('bets.allTypes')}</SelectItem>
                <SelectItem value="simple">{t('bets.simple')}</SelectItem>
                <SelectItem value="multiple">{t('bets.multiple')}</SelectItem>
                <SelectItem value="live">{t('bets.live')}</SelectItem>
                <SelectItem value="system">{t('bets.system')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder={t('bets.allStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('bets.allStatus')}</SelectItem>
                <SelectItem value="pending">{t('common.pending')}</SelectItem>
                <SelectItem value="won">{t('bets.won')}</SelectItem>
                <SelectItem value="lost">{t('bets.lost')}</SelectItem>
                <SelectItem value="void">{t('bets.void')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterProfit} onValueChange={setFilterProfit}>
              <SelectTrigger>
                <SelectValue placeholder={t('common.filter')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('bets.allResults')}</SelectItem>
                <SelectItem value="profit">{t('bets.onlyProfit')}</SelectItem>
                <SelectItem value="loss">{t('bets.onlyLoss')}</SelectItem>
                <SelectItem value="breakeven">{t('bets.breakeven')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtros avançados */}
          {showAdvancedFilters && (
            <div className="space-y-4 pt-4 border-t">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{t('bets.advancedFilters')}</h4>

              {/* Filtros de Range */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">{t('bets.oddsRange')}</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="number"
                      step="0.1"
                      placeholder={t('bets.min')}
                      value={oddsRange.min}
                      onChange={(e) => setOddsRange({...oddsRange, min: parseFloat(e.target.value) || 1})}
                      className="w-20"
                    />
                    <span className="text-muted-foreground">{t('bets.upTo')}</span>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder={t('bets.max')}
                      value={oddsRange.max}
                      onChange={(e) => setOddsRange({...oddsRange, max: parseFloat(e.target.value) || 10})}
                      className="w-20"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">{t('bets.amountRange')}</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder={t('bets.min')}
                      value={amountRange.min}
                      onChange={(e) => setAmountRange({...amountRange, min: parseFloat(e.target.value) || 0})}
                      className="w-20"
                    />
                    <span className="text-muted-foreground">{t('bets.upTo')}</span>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder={t('bets.max')}
                      value={amountRange.max}
                      onChange={(e) => setAmountRange({...amountRange, max: parseFloat(e.target.value) || 1000})}
                      className="w-20"
                    />
                  </div>
                </div>
              </div>

              {/* Filtros por Características */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t('bets.specialCharacteristics')}</Label>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filterHasBoost}
                      onChange={(e) => setFilterHasBoost(e.target.checked)}
                      className="rounded"
                    />
                    <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700">💰 {t('bets.withBoost')}</Badge>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filterHasCashout}
                      onChange={(e) => setFilterHasCashout(e.target.checked)}
                      className="rounded"
                    />
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">🏦 {t('bets.withCashout')}</Badge>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filterUsedCredits}
                      onChange={(e) => setFilterUsedCredits(e.target.checked)}
                      className="rounded"
                    />
                    <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">💳 {t('bets.credits')}</Badge>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filterIsProtected}
                      onChange={(e) => setFilterIsProtected(e.target.checked)}
                      className="rounded"
                    />
                    <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700">🛡️ {t('bets.protected')}</Badge>
                  </label>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('bets.allBetsCount').replace('{count}', filteredBets.length.toString())}</CardTitle>
          <CardDescription>{t('bets.completeHistory')}</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredBets.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">{t('bets.noBetsFound')}</p>
          ) : (
            isMobile ? (
              // Mobile: Cards layout
              <div className="space-y-4">
                {paginatedBets.map((bet) => (
                  <Card 
                    key={bet.id} 
                    className={`${isLiveBet(bet) ? 'border-l-4 border-l-orange-500 bg-orange-50/30' : ''} ${
                      bet.profit > 0 ? 'border-l-4 border-l-green-500 bg-green-50/20' : 
                      bet.profit < 0 ? 'border-l-4 border-l-red-500 bg-red-50/20' : ''
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">#{bet.operationNumber}</Badge>
                          {isLiveBet(bet) && <Badge className="bg-red-500 animate-pulse text-xs">🔴 LIVE</Badge>}
                        </div>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleView(bet)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(bet)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDelete(bet.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">{bet.bookmaker}</span>
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
                            {bet.status === 'won' ? t('bets.won_lowercase') : bet.status === 'lost' ? t('bets.lost_lowercase') : bet.status === 'pending' ? t('bets.pending_lowercase') : bet.status === 'void' ? t('bets.void_lowercase') : bet.status}
                          </Badge>
                        </div>
                        
                        <p className="text-sm font-medium truncate">{bet.description}</p>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">{t('bets.amount')}:</span>
                            <span className="font-medium ml-1">R$ {bet.amount.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">{t('bets.odds')}:</span>
                            <span className="font-medium ml-1">{bet.odds.toFixed(2)}</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center pt-2 border-t">
                          <div className="flex gap-1">
                            {bet.id.includes('1') && (
                              <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700">💰 +5%</Badge>
                            )}
                            {bet.id.includes('2') && (
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">🏦 Cashout</Badge>
                            )}
                            {bet.id.includes('3') && (
                              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">💳 Créditos</Badge>
                            )}
                          </div>
                          <div className="text-right">
                            <div className={`font-semibold ${bet.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {bet.profit >= 0 ? '+' : ''}R$ {bet.profit.toFixed(2)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(bet.date).toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              // Desktop: Table layout
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead
                        className="cursor-pointer select-none hover:bg-muted/50"
                        onClick={() => handleSort('date')}
                      >
                        <div className="flex items-center gap-1">
                          {t('bets.date')}
                          {sortColumn === 'date' && (
                            <span className="text-xs">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </TableHead>
                      <TableHead>{t('bets.matchTime')}</TableHead>
                      <TableHead>{t('bets.league')}</TableHead>
                      <TableHead>{t('bets.market')}</TableHead>
                      <TableHead>{t('bets.house')}</TableHead>
                      <TableHead>{t('bets.type')}</TableHead>
                      <TableHead
                        className="text-right cursor-pointer select-none hover:bg-muted/50"
                        onClick={() => handleSort('amount')}
                      >
                        <div className="flex items-center justify-end gap-1">
                          {t('bets.amount')}
                          {sortColumn === 'amount' && (
                            <span className="text-xs">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </TableHead>
                      <TableHead
                        className="text-right cursor-pointer select-none hover:bg-muted/50"
                        onClick={() => handleSort('odds')}
                      >
                        <div className="flex items-center justify-end gap-1">
                          {t('bets.odds')}
                          {sortColumn === 'odds' && (
                            <span className="text-xs">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </TableHead>
                      <TableHead>{t('bets.status')}</TableHead>
                      <TableHead className="text-right">{t('bets.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedBets.map((bet) => (
                    <TableRow
                      key={bet.id}
                      className={`${isLiveBet(bet) ? 'bg-orange-500/10 border-l-4 border-l-orange-500' : ''} ${
                        bet.profit > 0 ? 'border-l-4 border-l-green-500 bg-green-50/20' : 
                        bet.profit < 0 ? 'border-l-4 border-l-red-500 bg-red-50/20' : ''
                      }`}
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
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {bet.betType === 'live' ? (
                            <Badge className="bg-red-500 text-white animate-pulse text-xs px-2 py-1">
                              {t('bets.liveNow')}
                            </Badge>
                          ) : (
                            <span className="capitalize">
                              {bet.betType === 'simple' ? t('bets.simple') : bet.betType === 'multiple' ? t('bets.multiple') : bet.betType === 'system' ? t('bets.system') : bet.betType}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">R$ {bet.amount.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{bet.odds.toFixed(2)}</TableCell>
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
                          {bet.status === 'won' ? t('bets.won_lowercase') : bet.status === 'lost' ? t('bets.lost_lowercase') : bet.status === 'pending' ? t('bets.pending_lowercase') : bet.status === 'void' ? t('bets.void_lowercase') : bet.status}
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
            )
          )}
            
          {/* Paginação */}
          {totalPages > 1 && (
              <div className="flex items-center justify-between px-2 py-4">
                <div className="text-sm text-muted-foreground">
                  {t('bets.showing')
                    .replace('{start}', (((currentPage - 1) * itemsPerPage) + 1).toString())
                    .replace('{end}', Math.min(currentPage * itemsPerPage, filteredBets.length).toString())
                    .replace('{total}', filteredBets.length.toString())}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    {t('bets.previous')}
                  </Button>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      );
                    })}
                    {totalPages > 5 && (
                      <>
                        {currentPage < totalPages - 2 && <span className="px-2">...</span>}
                        <Button
                          variant={currentPage === totalPages ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(totalPages)}
                        >
                          {totalPages}
                        </Button>
                      </>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                  >
                    {t('bets.next')}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('bets.completeDetails')}</DialogTitle>
            <DialogDescription>{t('bets.detailedAnalysis')}</DialogDescription>
          </DialogHeader>
          {selectedBet && (
            <div className="space-y-6">
              {/* Identificação */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{t('bets.identification')}</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <Label className="text-xs text-muted-foreground">{t('bets.operationHash')}</Label>
                    <p className="font-semibold text-lg">{selectedBet.operationNumber}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <Label className="text-xs text-muted-foreground">{t('bets.betDate')}</Label>
                    <p className="font-medium">{new Date(selectedBet.date).toLocaleDateString(language === 'pt-br' ? 'pt-BR' : 'en-US')}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <Label className="text-xs text-muted-foreground">{t('bets.bookmakerHouse')}</Label>
                    <p className="font-medium">{selectedBet.bookmaker}</p>
                  </div>
                </div>
              </div>

              {/* Detalhes do Jogo */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{t('bets.gameInfo')}</h4>
                <div className="grid grid-cols-2 gap-4">
                  {selectedBet.matchTime && (
                    <div>
                      <Label className="text-muted-foreground">Data/Hora do Jogo</Label>
                      <p className="font-medium">{new Date(selectedBet.matchTime).toLocaleString('pt-BR')}</p>
                    </div>
                  )}
                  {selectedBet.league && (
                    <div>
                      <Label className="text-muted-foreground">Liga/Competição</Label>
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
                    <Label className="text-muted-foreground">Tipo de Aposta</Label>
                    <Badge variant="outline" className="font-medium">
                      {selectedBet.betType === 'simple' ? 'Simples' : 
                       selectedBet.betType === 'multiple' ? 'Múltipla' : 
                       selectedBet.betType === 'live' ? 'Ao Vivo' : 
                       selectedBet.betType === 'system' ? 'Sistema' : selectedBet.betType}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Análise Financeira */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Análise Financeira</h4>
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <Label className="text-xs text-blue-600 font-medium">Valor Apostado</Label>
                    <p className="text-xl font-bold text-blue-700">R$ {selectedBet.amount.toFixed(2)}</p>
                  </div>
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <Label className="text-xs text-purple-600 font-medium">Odds</Label>
                    <p className="text-xl font-bold text-purple-700">{selectedBet.odds.toFixed(2)}</p>
                  </div>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <Label className="text-xs text-gray-600 font-medium">Retorno Total</Label>
                    <p className="text-xl font-bold text-gray-700">R$ {selectedBet.return.toFixed(2)}</p>
                  </div>
                  <div className={`p-4 border rounded-lg ${selectedBet.profit >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <Label className={`text-xs font-medium ${selectedBet.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedBet.profit >= 0 ? 'Lucro' : 'Prejuízo'}
                    </Label>
                    <p className={`text-xl font-bold ${selectedBet.profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {selectedBet.profit >= 0 ? '+' : ''}R$ {selectedBet.profit.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <Label className="text-xs text-muted-foreground">ROI Individual</Label>
                    <p className={`text-lg font-semibold ${selectedBet.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {((selectedBet.profit / selectedBet.amount) * 100).toFixed(2)}%
                    </p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <Label className="text-xs text-muted-foreground">Probabilidade Implícita</Label>
                    <p className="text-lg font-semibold">{(100 / selectedBet.odds).toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              {/* Status e Badges */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Status e Características</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge 
                    variant="outline" 
                    className={
                      selectedBet.status === 'won'
                        ? 'bg-[hsl(var(--profit)/0.1)] text-[hsl(var(--profit))] border-[hsl(var(--profit)/0.3)] text-sm px-3 py-1'
                        : selectedBet.status === 'lost'
                          ? 'bg-[hsl(var(--loss)/0.1)] text-[hsl(var(--loss))] border-[hsl(var(--loss)/0.3)] text-sm px-3 py-1'
                          : 'text-sm px-3 py-1'
                    }
                  >
                    {selectedBet.status === 'won' ? '✅ Ganha' : 
                     selectedBet.status === 'lost' ? '❌ Perdida' : 
                     selectedBet.status === 'pending' ? '⏳ Pendente' : 
                     selectedBet.status === 'void' ? '🚫 Anulada' : selectedBet.status}
                  </Badge>
                  {selectedBet.isProtected && <Badge className="bg-orange-500 text-sm px-3 py-1">🛡️ Protegida</Badge>}
                  {selectedBet.isLive && <Badge variant="secondary" className="text-sm px-3 py-1">📺 Ao Vivo</Badge>}
                  {isLiveBet(selectedBet) && <Badge className="bg-red-500 animate-pulse text-sm px-3 py-1">🔴 AO VIVO AGORA</Badge>}
                </div>
              </div>

              {/* Características Especiais */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Características Especiais</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Boost */}
                  {selectedBet.id.includes('1') && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">💰 BOOST</Badge>
                      </div>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-yellow-700">Odds Original:</span>
                          <span className="font-medium">{(selectedBet.odds * 0.95).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-yellow-700">Odds Final:</span>
                          <span className="font-medium">{selectedBet.odds.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-yellow-700">Aumento:</span>
                          <span className="font-semibold text-yellow-800">+{((selectedBet.odds / (selectedBet.odds * 0.95) - 1) * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Cashout */}
                  {selectedBet.id.includes('2') && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">🏦 CASHOUT</Badge>
                      </div>
                      <div className="text-sm space-y-1">
                        <div className="text-blue-700 mb-1">Aposta encerrada antecipadamente</div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">Valor Resgatado:</span>
                          <span className="font-medium">R$ {(selectedBet.amount * 0.85).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">% do Potencial:</span>
                          <span className="font-medium">85%</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Créditos */}
                  {selectedBet.id.includes('3') && (
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="bg-purple-100 text-purple-800">💳 CRÉDITOS</Badge>
                      </div>
                      <div className="text-sm space-y-1">
                        <div className="text-purple-700 mb-1">Aposta feita com créditos promocionais</div>
                        <div className="flex justify-between">
                          <span className="text-purple-700">Origem:</span>
                          <span className="font-medium">Bônus de Depósito</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-700">Rollover:</span>
                          <span className="font-medium">3x</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Caso não tenha características especiais */}
                {!selectedBet.id.includes('1') && !selectedBet.id.includes('2') && !selectedBet.id.includes('3') && (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                    <span className="text-gray-500 text-sm">Nenhuma característica especial aplicada nesta aposta</span>
                  </div>
                )}
              </div>

              {/* Estratégias e Proteções */}
              {selectedBet.strategies && selectedBet.strategies.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Estratégias e Proteções</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedBet.strategies.map((s, i) => (
                      <Badge key={i} variant="secondary" className="text-sm px-3 py-1">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Descrição Detalhada */}
              {selectedBet.description && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Descrição Completa</h4>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm leading-relaxed">{selectedBet.description}</p>
                  </div>
                </div>
              )}

              {/* Método de Stake */}
              {selectedBet.stakeLogic && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Método de Stake</h4>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">{selectedBet.stakeLogic}</p>
                  </div>
                </div>
              )}

              {/* Simulação de dados da planilha */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Informações Adicionais</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Placar Final</Label>
                    <p className="font-medium">2x1 (simulado)</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Tempo do Gol</Label>
                    <p className="font-medium">23', 67' e 89'</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Aposta</DialogTitle>
            <DialogDescription>Atualizar informações da aposta</DialogDescription>
          </DialogHeader>
          {editForm && (
            <div className="space-y-6">
              {/* Informações Básicas */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Informações Básicas</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-stake">Valor (R$)</Label>
                    <Input
                      id="edit-stake"
                      type="number"
                      step="0.01"
                      value={editForm.amount}
                      onChange={(e) => setEditForm({ ...editForm, amount: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-odds">Odds</Label>
                    <Input
                      id="edit-odds"
                      type="number"
                      step="0.01"
                      value={editForm.odds}
                      onChange={(e) => setEditForm({ ...editForm, odds: parseFloat(e.target.value) || 1 })}
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
              </div>

              {/* Informações do Jogo */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Informações do Jogo</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-league">Liga/Competição</Label>
                    <Input
                      id="edit-league"
                      value={editForm.league || ''}
                      onChange={(e) => setEditForm({ ...editForm, league: e.target.value })}
                      placeholder="Ex: Premier League"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-market">Mercado</Label>
                    <Input
                      id="edit-market"
                      value={editForm.market || ''}
                      onChange={(e) => setEditForm({ ...editForm, market: e.target.value })}
                      placeholder="Ex: Resultado Final"
                    />
                  </div>
                </div>
              </div>

              {/* Descrição e Lógica */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Detalhes</h4>
                <div>
                  <Label htmlFor="edit-description">Descrição da Aposta</Label>
                  <Textarea
                    id="edit-description"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={3}
                    placeholder="Descreva os detalhes da aposta, seleções, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="edit-logic">Lógica do Stake</Label>
                  <Textarea
                    id="edit-logic"
                    value={editForm.stakeLogic || ''}
                    onChange={(e) => setEditForm({ ...editForm, stakeLogic: e.target.value })}
                    rows={2}
                    placeholder="Ex: 2% da banca, Flat R$50, Kelly Criterion"
                  />
                </div>
              </div>

              {/* Informações Calculadas */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Resultados</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <Label className="text-xs text-muted-foreground">Retorno Potencial</Label>
                    <p className="text-lg font-semibold">R$ {(editForm.amount * editForm.odds).toFixed(2)}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <Label className="text-xs text-muted-foreground">Lucro Potencial</Label>
                    <p className="text-lg font-semibold text-green-600">+R$ {((editForm.amount * editForm.odds) - editForm.amount).toFixed(2)}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <Label className="text-xs text-muted-foreground">ROI Potencial</Label>
                    <p className="text-lg font-semibold">{(((editForm.odds - 1) * 100)).toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleSaveEdit}>Salvar Alterações</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta aposta? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
