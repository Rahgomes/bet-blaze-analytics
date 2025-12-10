import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { useBettingStore } from '@/stores/betting';
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
import { ArrowLeft, DollarSign, TrendingUp, Calendar, Coins } from 'lucide-react';
import { DepositsFilters, SortOption } from '@/components/betting/DepositsFilters';
import { DepositsTable } from '@/components/betting/DepositsTable';
import { EditManualDepositModal } from '@/components/betting/EditManualDepositModal';
import { Transaction } from '@/types/betting';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/useTranslation';

export default function DepositsHistory() {
  const [, setLocation] = useLocation();
  const bankroll = useBettingStore(state => state.bankroll);
  const transactions = useBettingStore(state => state.transactions);
  const updateTransaction = useBettingStore(state => state.updateTransaction);
  const deleteTransaction = useBettingStore(state => state.deleteTransaction);
  const { toast } = useToast();
  const { t } = useTranslation();

  // Get all deposits
  const allDeposits = transactions.filter((t) => t.type === 'deposit');

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [valueMin, setValueMin] = useState('');
  const [valueMax, setValueMax] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  // Modal states
  const [selectedDeposit, setSelectedDeposit] = useState<Transaction | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [depositToDelete, setDepositToDelete] = useState<Transaction | null>(null);

  // Calculate summary stats
  const totalDeposits = allDeposits.reduce((sum, d) => sum + d.amount, 0);
  const largestDeposit = allDeposits.length > 0
    ? Math.max(...allDeposits.map((d) => d.amount))
    : 0;
  const latestDeposit = allDeposits.length > 0
    ? allDeposits.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())[0]
    : null;

  // Apply filters and sorting
  const filteredDeposits = useMemo(() => {
    let filtered = [...allDeposits];

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          (d.title?.toLowerCase().includes(search) ?? false) ||
          (d.description?.toLowerCase().includes(search) ?? false)
      );
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(
        (d) => new Date(d.dateTime) >= dateFrom
      );
    }
    if (dateTo) {
      const endOfDay = new Date(dateTo);
      endOfDay.setHours(23, 59, 59, 999);
      filtered = filtered.filter(
        (d) => new Date(d.dateTime) <= endOfDay
      );
    }

    // Value range filter
    if (valueMin) {
      const min = parseFloat(valueMin);
      filtered = filtered.filter((d) => d.amount >= min);
    }
    if (valueMax) {
      const max = parseFloat(valueMax);
      filtered = filtered.filter((d) => d.amount <= max);
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
  }, [allDeposits, searchTerm, dateFrom, dateTo, valueMin, valueMax, sortBy]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setDateFrom(undefined);
    setDateTo(undefined);
    setValueMin('');
    setValueMax('');
    setSortBy('recent');
  };

  const handleEdit = (deposit: Transaction) => {
    setSelectedDeposit(deposit);
    setShowEditModal(true);
  };

  const handleUpdateDeposit = (depositId: string, updates: {
    title?: string;
    amount?: number;
    dateTime?: string;
    description?: string;
  }) => {
    const deposit = transactions.find((t) => t.id === depositId);
    if (!deposit) return;

    const oldAmount = deposit.amount;
    const newAmount = updates.amount ?? oldAmount;
    const amountDiff = newAmount - oldAmount;

    updateTransaction(depositId, updates);

    if (amountDiff !== 0) {
      // Note: bankroll update is handled by useBettingData hook
      // We just need to update the transaction
    }

    toast({
      title: t('depositsHistory.toasts.depositUpdated'),
      description: t('depositsHistory.toasts.depositUpdatedDescription'),
    });
  };

  const handleDelete = (deposit: Transaction) => {
    setDepositToDelete(deposit);
  };

  const confirmDelete = () => {
    if (!depositToDelete) return;

    deleteTransaction(depositToDelete.id);
    setDepositToDelete(null);

    toast({
      title: t('depositsHistory.toasts.depositDeleted'),
      description: t('depositsHistory.toasts.depositDeletedDescription'),
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => setLocation('/settings?tab=bankroll')}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('depositsHistory.back')}
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{t('depositsHistory.title')}</h1>
          <p className="text-muted-foreground">{t('depositsHistory.subtitle')}</p>
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
                <p className="text-sm text-muted-foreground">{t('depositsHistory.summary.totalDeposits')}</p>
                <p className="text-2xl font-bold">{allDeposits.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('depositsHistory.summary.totalValue')}</p>
                <p className="text-2xl font-bold text-green-600">R$ {totalDeposits.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('depositsHistory.summary.largestDeposit')}</p>
                <p className="text-2xl font-bold text-purple-600">R$ {largestDeposit.toFixed(2)}</p>
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
                <p className="text-sm text-muted-foreground">{t('depositsHistory.summary.latestDeposit')}</p>
                <p className="text-xl font-bold text-orange-600">
                  {latestDeposit ? `R$ ${latestDeposit.amount.toFixed(2)}` : '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <DepositsFilters
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
      <DepositsTable
        deposits={filteredDeposits}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Edit Modal */}
      <EditManualDepositModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        currentBankroll={bankroll.currentBankroll}
        deposit={selectedDeposit}
        onUpdateDeposit={handleUpdateDeposit}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!depositToDelete} onOpenChange={() => setDepositToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('depositsHistory.deleteDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('depositsHistory.deleteDialog.description')}
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="font-medium">{depositToDelete?.title || t('depositsHistory.table.defaultTitle')}</p>
                <p className="text-sm text-green-600">+R$ {depositToDelete?.amount.toFixed(2)}</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('depositsHistory.deleteDialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {t('depositsHistory.deleteDialog.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
