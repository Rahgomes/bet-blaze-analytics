import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { useBettingData } from '@/hooks/useBettingData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, DollarSign, TrendingDown, Calendar, Coins } from 'lucide-react';
import { WithdrawalsFilters, SortOption } from '@/components/betting/WithdrawalsFilters';
import { WithdrawalsTable } from '@/components/betting/WithdrawalsTable';
import { EditManualWithdrawalModal } from '@/components/betting/EditManualWithdrawalModal';
import { Transaction } from '@/types/betting';
import { useToast } from '@/hooks/use-toast';

export default function WithdrawalsHistory() {
  const [, setLocation] = useLocation();
  const { bankroll, transactions, updateTransaction, deleteTransaction } = useBettingData();
  const { toast } = useToast();

  // Get all withdrawals
  const allWithdrawals = transactions.filter((t) => t.type === 'withdrawal');

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [valueMin, setValueMin] = useState('');
  const [valueMax, setValueMax] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  // Modal states
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Transaction | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [withdrawalToDelete, setWithdrawalToDelete] = useState<Transaction | null>(null);

  // Calculate summary stats
  const totalWithdrawals = allWithdrawals.reduce((sum, w) => sum + w.amount, 0);
  const largestWithdrawal = allWithdrawals.length > 0
    ? Math.max(...allWithdrawals.map((w) => w.amount))
    : 0;
  const latestWithdrawal = allWithdrawals.length > 0
    ? allWithdrawals.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())[0]
    : null;

  // Apply filters and sorting
  const filteredWithdrawals = useMemo(() => {
    let filtered = [...allWithdrawals];

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (w) =>
          (w.title?.toLowerCase().includes(search) ?? false) ||
          (w.description?.toLowerCase().includes(search) ?? false)
      );
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(
        (w) => new Date(w.dateTime) >= dateFrom
      );
    }
    if (dateTo) {
      const endOfDay = new Date(dateTo);
      endOfDay.setHours(23, 59, 59, 999);
      filtered = filtered.filter(
        (w) => new Date(w.dateTime) <= endOfDay
      );
    }

    // Value range filter
    if (valueMin) {
      const min = parseFloat(valueMin);
      filtered = filtered.filter((w) => w.amount >= min);
    }
    if (valueMax) {
      const max = parseFloat(valueMax);
      filtered = filtered.filter((w) => w.amount <= max);
    }

    // Sorting
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
        break;
      case 'highest':
        filtered.sort((a, b) => b.amount - a.amount);
        break;
      case 'lowest':
        filtered.sort((a, b) => a.amount - b.amount);
        break;
    }

    return filtered;
  }, [allWithdrawals, searchTerm, dateFrom, dateTo, valueMin, valueMax, sortBy]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setDateFrom(undefined);
    setDateTo(undefined);
    setValueMin('');
    setValueMax('');
    setSortBy('recent');
  };

  const handleEdit = (withdrawal: Transaction) => {
    setSelectedWithdrawal(withdrawal);
    setShowEditModal(true);
  };

  const handleUpdateWithdrawal = (withdrawalId: string, updates: {
    title?: string;
    amount?: number;
    dateTime?: string;
    description?: string;
  }) => {
    const withdrawal = transactions.find((t) => t.id === withdrawalId);
    if (!withdrawal) return;

    const oldAmount = withdrawal.amount;
    const newAmount = updates.amount ?? oldAmount;
    const availableBankroll = bankroll.currentBankroll + oldAmount;

    if (newAmount > availableBankroll) {
      toast({
        title: 'Erro',
        description: `O valor do saque não pode exceder R$ ${availableBankroll.toFixed(2)} (banca disponível).`,
        variant: 'destructive',
      });
      return;
    }

    const amountDiff = newAmount - oldAmount;
    updateTransaction(withdrawalId, updates);

    // Note: We need to manually adjust bankroll for withdrawals
    if (amountDiff !== 0) {
      // Difference in withdrawal means opposite change in bankroll
      // If withdrawal increases by 10, bankroll decreases by 10
      const newBankroll = bankroll.currentBankroll - amountDiff;
      // This will be handled by the hook, but we're being explicit about the logic
    }

    toast({
      title: 'Saque atualizado',
      description: 'O saque foi atualizado com sucesso.',
    });
  };

  const handleDelete = (withdrawal: Transaction) => {
    setWithdrawalToDelete(withdrawal);
  };

  const confirmDelete = () => {
    if (!withdrawalToDelete) return;

    deleteTransaction(withdrawalToDelete.id);
    setWithdrawalToDelete(null);

    toast({
      title: 'Saque excluído',
      description: 'O saque foi removido e a banca foi recalculada.',
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => setLocation('/settings')}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Histórico Completo de Saques</h1>
          <p className="text-muted-foreground">Visualize, filtre e gerencie todos os seus saques</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Coins className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Saques</p>
                <p className="text-2xl font-bold">{allWithdrawals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold text-red-600">R$ {totalWithdrawals.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingDown className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Maior Saque</p>
                <p className="text-2xl font-bold text-purple-600">R$ {largestWithdrawal.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Último Saque</p>
                <p className="text-xl font-bold text-orange-600">
                  {latestWithdrawal ? `R$ ${latestWithdrawal.amount.toFixed(2)}` : '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <WithdrawalsFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        dateFrom={dateFrom}
        onDateFromChange={setDateFrom}
        dateTo={dateTo}
        onDateToChange={setDateTo}
        valueMin={valueMin}
        onValueMinChange={setValueMin}
        valueMax={valueMax}
        onValueMaxChange={setValueMax}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        onClearFilters={handleClearFilters}
      />

      {/* Table */}
      <WithdrawalsTable
        withdrawals={filteredWithdrawals}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Edit Modal */}
      <EditManualWithdrawalModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        currentBankroll={bankroll.currentBankroll}
        withdrawal={selectedWithdrawal}
        onUpdateWithdrawal={handleUpdateWithdrawal}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!withdrawalToDelete} onOpenChange={() => setWithdrawalToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir saque?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este saque? Esta ação irá recalcular sua banca atual.
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="font-medium">{withdrawalToDelete?.title || 'Saque Manual'}</p>
                <p className="text-sm text-red-600">-R$ {withdrawalToDelete?.amount.toFixed(2)}</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Sim, Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
