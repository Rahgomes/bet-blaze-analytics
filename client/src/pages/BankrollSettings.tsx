import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import { useBettingStore } from '@/stores/betting';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { useToast } from '@/hooks/use-toast';
import {
  Wallet,
  Target,
  Shield,
  CreditCard,
  Plus,
  Trash2,
  Edit2,
  TrendingDown,
  AlertTriangle,
  Settings,
  DollarSign,
  PieChart,
  History,
  ChevronDown,
  HelpCircle
} from 'lucide-react';
import {
  calculateLinearProjection,
  calculateCompoundProjection,
  calculateBettingROI,
  calculateTotalGrowth,
  calculateMonthlyProgress,
  getBankrollAtMonthStart,
} from '@/utils/goalsCalculations';
import { AddManualDepositModal } from '@/components/betting/AddManualDepositModal';
import { EditManualDepositModal } from '@/components/betting/EditManualDepositModal';
import { AddManualWithdrawalModal } from '@/components/betting/AddManualWithdrawalModal';
import { EditManualWithdrawalModal } from '@/components/betting/EditManualWithdrawalModal';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Transaction, CustomStake, StopLossGainConfig, StopMode } from '@/types/betting';
import { StakeManager } from '@/components/betting/StakeManager';
import { StopLossGainField } from '@/components/betting/StopLossGainField';
import { convertStopValue } from '@/utils/stopLossGainUtils';

export default function BankrollSettings() {
  const [, setLocation] = useLocation();

  // Dados e actions da betting store
  const bankroll = useBettingStore(state => state.bankroll);
  const updateBankrollSettings = useBettingStore(state => state.updateBankrollSettings);
  const bets = useBettingStore(state => state.bets);
  const transactions = useBettingStore(state => state.transactions);
  const addTransaction = useBettingStore(state => state.addTransaction);
  const updateTransaction = useBettingStore(state => state.updateTransaction);
  const deleteTransaction = useBettingStore(state => state.deleteTransaction);

  const { toast } = useToast();

  // State for protecting initial bankroll editing
  const [allowEditInitialBankroll, setAllowEditInitialBankroll] = useState(false);
  const [showEditBankrollDialog, setShowEditBankrollDialog] = useState(false);

  // State for manual deposits modals
  const [showAddDepositModal, setShowAddDepositModal] = useState(false);
  const [showEditDepositModal, setShowEditDepositModal] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState<Transaction | null>(null);
  const [depositToDelete, setDepositToDelete] = useState<Transaction | null>(null);

  // State for manual withdrawals modals
  const [showAddWithdrawalModal, setShowAddWithdrawalModal] = useState(false);
  const [showEditWithdrawalModal, setShowEditWithdrawalModal] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Transaction | null>(null);
  const [withdrawalToDelete, setWithdrawalToDelete] = useState<Transaction | null>(null);

  // State for "Load More" pagination
  const [visibleDepositsCount, setVisibleDepositsCount] = useState(3);
  const [visibleWithdrawalsCount, setVisibleWithdrawalsCount] = useState(3);

  // Tab navigation state - read from URL query parameter
  const tabFromUrl = new URLSearchParams(window.location.search).get('tab');
  const validTabs = ['bankroll', 'goals', 'risk', 'withdrawals'];
  const initialTab = validTabs.includes(tabFromUrl || '') ? tabFromUrl : 'bankroll';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Handle tab changes - update URL with query parameter
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setLocation(`/settings?tab=${value}`);
  };

  const [formData, setFormData] = useState<{
    initialBankroll: string;
    targetMode: 'percentage' | 'fixed';
    targetPercentage: string;
    targetAmount: string;
    stopLossWeekly: string;
    stopGainWeekly: string;
    stopLossMonthly: string;
    stopGainMonthly: string;
    // New: Enhanced stop loss/gain config
    stopLossGain: StopLossGainConfig;
    // New: Custom stakes
    customStakes: CustomStake[];
    maxStakesRecommended: number;
  }>({
    initialBankroll: bankroll.initialBankroll.toString(),
    targetMode: bankroll.targetMode || 'percentage',
    targetPercentage: bankroll.targetPercentage.toString(),
    targetAmount: bankroll.targetAmount.toString(),
    stopLossWeekly: bankroll.stopLossWeekly.toString(),
    stopGainWeekly: bankroll.stopGainWeekly.toString(),
    stopLossMonthly: bankroll.stopLossMonthly.toString(),
    stopGainMonthly: bankroll.stopGainMonthly.toString(),
    // New: Stop loss/gain config (with fallback to old values)
    stopLossGain: bankroll.stopLossGain || {
      dailyLoss: 50,
      dailyLossMode: 'currency' as const,
      dailyGain: 100,
      dailyGainMode: 'currency' as const,
      weeklyLoss: bankroll.stopLossWeekly || 100,
      weeklyLossMode: 'currency' as const,
      weeklyGain: bankroll.stopGainWeekly || 200,
      weeklyGainMode: 'currency' as const,
      monthlyLoss: bankroll.stopLossMonthly || 300,
      monthlyLossMode: 'currency' as const,
      monthlyGain: bankroll.stopGainMonthly || 500,
      monthlyGainMode: 'currency' as const,
    },
    // New: Custom stakes (with fallback to empty array)
    customStakes: bankroll.customStakes || [],
    maxStakesRecommended: bankroll.maxStakesRecommended || 6,
  });

  // Store initial form data for change detection
  const [initialFormData, setInitialFormData] = useState(formData);

  // Update initial form data when bankroll changes (e.g., after save)
  useEffect(() => {
    const newInitialData = {
      initialBankroll: bankroll.initialBankroll.toString(),
      targetMode: bankroll.targetMode || 'percentage',
      targetPercentage: bankroll.targetPercentage.toString(),
      targetAmount: bankroll.targetAmount.toString(),
      stopLossWeekly: bankroll.stopLossWeekly.toString(),
      stopGainWeekly: bankroll.stopGainWeekly.toString(),
      stopLossMonthly: bankroll.stopLossMonthly.toString(),
      stopGainMonthly: bankroll.stopGainMonthly.toString(),
      stopLossDaily: '50',
      stopGainDaily: '100',
      maxStakePercentage: '5',
      minStakeAmount: '10',
      maxStakeAmount: '500',
      dynamicStaking: false,
    };
    setInitialFormData(newInitialData);
  }, [bankroll]);

  // Function to detect if there are any changes
  const hasChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify(initialFormData);
  };

  // Calculate bankroll breakdown
  const deposits = transactions.filter(t => t.type === 'deposit');
  const withdrawals = transactions.filter(t => t.type === 'withdrawal');
  const totalDeposits = deposits.reduce((sum, t) => sum + t.amount, 0);
  const totalWithdrawals = withdrawals.reduce((sum, t) => sum + t.amount, 0);
  const totalBetProfit = bets.reduce((sum, bet) => sum + bet.profit, 0);

  // Projection mode state
  const [projectionMode, setProjectionMode] = useState<'linear' | 'compound'>(
    bankroll.projectionMode || 'linear'
  );

  // Goal calculations (derived state with useMemo)
  const goalCalculations = useMemo(() => {
    const monthlyGoal = formData.targetMode === 'percentage'
      ? parseFloat(formData.targetPercentage || '0')
      : (parseFloat(formData.targetAmount || '0') / bankroll.currentBankroll) * 100;

    const currentBank = bankroll.currentBankroll;

    // Calculate projections
    const projection6 = projectionMode === 'linear'
      ? calculateLinearProjection(monthlyGoal, 6, currentBank)
      : calculateCompoundProjection(monthlyGoal, 6, currentBank);

    const projection12 = projectionMode === 'linear'
      ? calculateLinearProjection(monthlyGoal, 12, currentBank)
      : calculateCompoundProjection(monthlyGoal, 12, currentBank);

    // Calculate current performance
    const bettingROI = calculateBettingROI(bets);
    const totalGrowth = calculateTotalGrowth(
      bankroll.initialBankroll,
      currentBank,
      totalDeposits,
      totalWithdrawals
    );

    // Calculate monthly progress
    const bankrollAtMonthStart = getBankrollAtMonthStart(
      currentBank,
      bets,
      transactions
    );

    const monthlyProgress = calculateMonthlyProgress(
      bets,
      transactions,
      monthlyGoal,
      bankrollAtMonthStart
    );

    return {
      projection6,
      projection12,
      bettingROI,
      totalGrowth,
      monthlyProgress
    };
  }, [
    formData.targetMode,
    formData.targetPercentage,
    formData.targetAmount,
    projectionMode,
    bankroll.currentBankroll,
    bankroll.initialBankroll,
    bets,
    transactions,
    totalDeposits,
    totalWithdrawals
  ]);

  const handleCheckboxChange = (checked: boolean) => {
    if (checked) {
      setShowEditBankrollDialog(true);
    } else {
      setAllowEditInitialBankroll(false);
    }
  };

  const handleConfirmEditBankroll = () => {
    setAllowEditInitialBankroll(true);
    setShowEditBankrollDialog(false);
  };

  const handleAddDeposit = (deposit: {
    title: string;
    amount: number;
    dateTime: string;
    description?: string;
  }) => {
    addTransaction({
      type: 'deposit',
      amount: deposit.amount,
      dateTime: deposit.dateTime,
      title: deposit.title,
      description: deposit.description,
    });
  };

  const handleUpdateDeposit = (depositId: string, updates: {
    title?: string;
    amount?: number;
    dateTime?: string;
    description?: string;
  }) => {
    const deposit = transactions.find(t => t.id === depositId);
    if (!deposit) return;

    // Calculate the difference in amount to adjust bankroll
    const oldAmount = deposit.amount;
    const newAmount = updates.amount ?? oldAmount;
    const amountDiff = newAmount - oldAmount;

    // Update the transaction
    updateTransaction(depositId, updates);

    // The useBettingData hook doesn't automatically adjust bankroll on update,
    // so we need to manually adjust it if the amount changed
    if (amountDiff !== 0) {
      updateBankrollSettings({
        currentBankroll: bankroll.currentBankroll + amountDiff,
      });
    }
  };

  const handleDeleteDeposit = (deposit: Transaction) => {
    deleteTransaction(deposit.id);
    setDepositToDelete(null);
  };

  const handleAddWithdrawal = (withdrawal: {
    title: string;
    amount: number;
    dateTime: string;
    description?: string;
  }) => {
    if (withdrawal.amount > bankroll.currentBankroll) {
      toast({
        title: 'Erro',
        description: 'O valor do saque não pode exceder a banca disponível.',
        variant: 'destructive',
      });
      return;
    }

    addTransaction({
      type: 'withdrawal',
      amount: withdrawal.amount,
      dateTime: withdrawal.dateTime,
      title: withdrawal.title,
      description: withdrawal.description,
    });
  };

  const handleUpdateWithdrawal = (withdrawalId: string, updates: {
    title?: string;
    amount?: number;
    dateTime?: string;
    description?: string;
  }) => {
    const withdrawal = transactions.find(t => t.id === withdrawalId);
    if (!withdrawal) return;

    const availableBankroll = bankroll.currentBankroll + withdrawal.amount;
    const newAmount = updates.amount ?? withdrawal.amount;

    if (newAmount > availableBankroll) {
      toast({
        title: 'Erro',
        description: 'O valor do saque não pode exceder a banca disponível.',
        variant: 'destructive',
      });
      return;
    }

    const amountDiff = newAmount - withdrawal.amount;
    updateTransaction(withdrawalId, updates);

    if (amountDiff !== 0) {
      updateBankrollSettings({
        currentBankroll: bankroll.currentBankroll - amountDiff,
      });
    }
  };

  const handleDeleteWithdrawal = (withdrawal: Transaction) => {
    deleteTransaction(withdrawal.id);
    setWithdrawalToDelete(null);
  };

  // === NEW HANDLERS FOR CUSTOM STAKES ===

  const handleAddStake = (stakeData: Omit<CustomStake, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newStake: CustomStake = {
      ...stakeData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setFormData({
      ...formData,
      customStakes: [...formData.customStakes, newStake],
    });
  };

  const handleUpdateStake = (id: string, updates: Partial<CustomStake>) => {
    setFormData({
      ...formData,
      customStakes: formData.customStakes.map(s =>
        s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
      ),
    });
  };

  const handleDeleteStake = (id: string) => {
    setFormData({
      ...formData,
      customStakes: formData.customStakes.filter(s => s.id !== id),
    });
  };

  // === NEW HANDLERS FOR STOP LOSS/GAIN ===

  const handleStopValueChange = (
    field: keyof StopLossGainConfig,
    value: number
  ) => {
    setFormData({
      ...formData,
      stopLossGain: {
        ...formData.stopLossGain,
        [field]: value,
      },
    });
  };

  const handleStopModeChange = (
    field: keyof StopLossGainConfig,
    mode: StopMode
  ) => {
    // When mode changes, convert the value
    const valueField = field.replace('Mode', '') as keyof StopLossGainConfig;
    const currentValue = formData.stopLossGain[valueField] as number;
    const currentMode = formData.stopLossGain[field] as StopMode;

    const convertedValue = convertStopValue(
      currentValue,
      currentMode,
      mode,
      bankroll.currentBankroll
    );

    setFormData({
      ...formData,
      stopLossGain: {
        ...formData.stopLossGain,
        [valueField]: convertedValue,
        [field]: mode,
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const initialBankroll = parseFloat(formData.initialBankroll);
    const targetPercentage = parseFloat(formData.targetPercentage);
    const targetAmount = formData.targetMode === 'fixed'
      ? parseFloat(formData.targetAmount)
      : initialBankroll * (targetPercentage / 100);
    const stopLossWeekly = parseFloat(formData.stopLossWeekly);
    const stopGainWeekly = parseFloat(formData.stopGainWeekly);
    const stopLossMonthly = parseFloat(formData.stopLossMonthly);
    const stopGainMonthly = parseFloat(formData.stopGainMonthly);

    updateBankrollSettings({
      initialBankroll,
      targetMode: formData.targetMode as 'percentage' | 'fixed',
      targetPercentage,
      targetAmount,
      stopLossWeekly,
      stopGainWeekly,
      stopLossMonthly,
      stopGainMonthly,
      projectionMode: projectionMode,
      // NEW: Save stop loss/gain and custom stakes
      stopLossGain: formData.stopLossGain,
      customStakes: formData.customStakes,
      maxStakesRecommended: formData.maxStakesRecommended,
    });

    // After saving, disable editing initial bankroll
    setAllowEditInitialBankroll(false);

    toast({
      title: 'Sucesso',
      description: 'Configurações da banca atualizadas com sucesso',
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestão Financeira</h1>
        <p className="text-muted-foreground">Configure sua banca, aportes, metas e proteção de riscos</p>
      </div>

      {/* Card de Resumo Geral */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Banca Atual</p>
              <p className="text-2xl font-bold text-blue-600">R$ {bankroll.currentBankroll.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Meta Mensal</p>
              <p className="text-2xl font-bold text-green-600">+{formData.targetPercentage}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Stop Loss</p>
              <p className="text-2xl font-bold text-red-600">R$ {formData.stopLossMonthly}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Aportes</p>
              <p className="text-2xl font-bold text-purple-600">R$ {totalDeposits.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="bankroll" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Banca & Aportes
            {hasChanges() && <Badge variant="destructive" className="ml-1 h-2 w-2 p-0 rounded-full" />}
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Metas & Objetivos
            {hasChanges() && <Badge variant="destructive" className="ml-1 h-2 w-2 p-0 rounded-full" />}
          </TabsTrigger>
          <TabsTrigger value="risk" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Gestão de Risco
            {hasChanges() && <Badge variant="destructive" className="ml-1 h-2 w-2 p-0 rounded-full" />}
          </TabsTrigger>
          <TabsTrigger value="withdrawals" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Saques
            {hasChanges() && <Badge variant="destructive" className="ml-1 h-2 w-2 p-0 rounded-full" />}
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: BANCA & APORTES */}
        <TabsContent value="bankroll" className="space-y-6">
          {/* Configuração da Banca */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuração da Banca
              </CardTitle>
              <CardDescription>Visualize e gerencie sua banca</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Banca Inicial */}
              <div className="space-y-2">
                <Label htmlFor="initialBankroll">Banca Inicial (R$)</Label>
                <Input
                  id="initialBankroll"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.initialBankroll}
                  onChange={(e) => setFormData({ ...formData, initialBankroll: e.target.value })}
                  disabled={!allowEditInitialBankroll}
                  className={!allowEditInitialBankroll ? 'bg-muted' : ''}
                />
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id="allow-edit-bankroll"
                    checked={allowEditInitialBankroll}
                    onCheckedChange={handleCheckboxChange}
                  />
                  <Label
                    htmlFor="allow-edit-bankroll"
                    className="text-sm font-normal cursor-pointer"
                  >
                    {allowEditInitialBankroll ? 'Desabilitar edição da banca inicial' : 'Habilitar edição da banca inicial'}
                  </Label>
                </div>
              </div>

              <Separator />

              {/* Banca Atual - Breakdown */}
              <div className="space-y-3">
                <Label className="text-base">Banca Atual (calculada automaticamente)</Label>
                <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Banca Inicial:</span>
                    <span className="font-medium">R$ {parseFloat(formData.initialBankroll || '0').toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Aportes:</span>
                    <span className="font-medium text-green-600">+R$ {totalDeposits.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Lucro/Prejuízo em Apostas:</span>
                    <span className={`font-medium ${totalBetProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {totalBetProfit >= 0 ? '+' : ''}R$ {totalBetProfit.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Saques:</span>
                    <span className="font-medium text-red-600">-R$ {totalWithdrawals.toFixed(2)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between">
                    <span className="font-semibold">Banca Atual:</span>
                    <span className="text-xl font-bold text-blue-600">
                      R$ {bankroll.currentBankroll.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Histórico de Aportes Manuais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Histórico de Aportes Manuais
              </CardTitle>
              <CardDescription>Registre e acompanhe seus aportes à banca</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {deposits.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Nenhum aporte registrado ainda</p>
                    <p className="text-sm">Clique em "Registrar Aporte Manual" para adicionar</p>
                  </div>
                ) : (
                  <>
                    {deposits
                      .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
                      .slice(0, visibleDepositsCount)
                      .map((deposit) => (
                        <div
                          key={deposit.id}
                          className="p-4 border-l-4 border-l-green-500 bg-green-50 rounded-lg space-y-2"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-semibold text-base">{deposit.title || 'Aporte Manual'}</p>
                              <p className="text-sm text-green-700 font-bold mt-1">
                                +R$ {deposit.amount.toFixed(2)} • {format(new Date(deposit.dateTime), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                              </p>
                              {deposit.description && (
                                <p className="text-sm text-muted-foreground mt-1">{deposit.description}</p>
                              )}
                              <p className="text-xs text-muted-foreground mt-2">
                                Banca após: R$ {deposit.balanceAfter.toFixed(2)}
                              </p>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedDeposit(deposit);
                                  setShowEditDepositModal(true);
                                }}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDepositToDelete(deposit)}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}

                    {/* Load More button */}
                    {deposits.length > visibleDepositsCount && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setVisibleDepositsCount(prev => prev + 3)}
                      >
                        <ChevronDown className="h-4 w-4 mr-2" />
                        Carregar Mais ({deposits.length - visibleDepositsCount} restantes)
                      </Button>
                    )}
                  </>
                )}

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddDepositModal(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Registrar Aporte Manual
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setLocation('/settings/deposits-history')}
                  >
                    <History className="h-4 w-4 mr-2" />
                    Visualizar Histórico Completo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: METAS & OBJETIVOS */}
        <TabsContent value="goals" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Meta Principal
                </CardTitle>
                <CardDescription>Configure sua meta mensal e acompanhe o progresso</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label>Tipo de Meta</Label>
                  <RadioGroup
                    value={formData.targetMode}
                    onValueChange={(value) => setFormData({ ...formData, targetMode: value as 'percentage' | 'fixed' })}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="percentage" id="percentage" />
                      <Label htmlFor="percentage">Meta Percentual</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="fixed" id="fixed" />
                      <Label htmlFor="fixed">Meta em Valor Fixo</Label>
                    </div>
                  </RadioGroup>
                </div>

                {formData.targetMode === 'percentage' ? (
                  <div className="space-y-2">
                    <Label htmlFor="targetPercentage">Meta Mensal (%)</Label>
                    <Input
                      id="targetPercentage"
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.targetPercentage}
                      onChange={(e) => setFormData({ ...formData, targetPercentage: e.target.value })}
                    />
                    <p className="text-sm text-muted-foreground">
                      Valor alvo mensal: R$ {(parseFloat(formData.initialBankroll || '0') * (parseFloat(formData.targetPercentage || '0') / 100)).toFixed(2)}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="targetAmount">Valor da Meta Mensal (R$)</Label>
                    <Input
                      id="targetAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.targetAmount}
                      onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    />
                  </div>
                )}

                <Separator />

                {/* Modo de Projeção */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Modo de Projeção</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="font-semibold mb-2">Linear vs Composto:</p>
                          <ul className="space-y-1 text-xs">
                            <li><strong>Linear:</strong> Multiplicação simples (5% × 6 = 30%)</li>
                            <li><strong>Composto:</strong> Juros compostos ((1.05)^6 - 1 ≈ 34%)</li>
                          </ul>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <RadioGroup
                    value={projectionMode}
                    onValueChange={(value) => setProjectionMode(value as 'linear' | 'compound')}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="linear" id="linear" />
                      <Label htmlFor="linear">Linear</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="compound" id="compound" />
                      <Label htmlFor="compound">Composto</Label>
                    </div>
                  </RadioGroup>
                </div>

                <Separator />

                {/* Projeções */}
                <div className="space-y-3">
                  <Label>Projeções</Label>
                  <div className="grid gap-3">
                    {/* 6 Month Projection */}
                    <div className="p-3 border rounded-lg bg-slate-50">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-sm">6 Meses</span>
                        <Badge variant="outline">
                          {goalCalculations.projection6.percentage.toFixed(2)}%
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Banca projetada:</span>
                          <span className="font-semibold">
                            R$ {goalCalculations.projection6.bankroll.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Lucro estimado:</span>
                          <span className="font-semibold">
                            +R$ {goalCalculations.projection6.profit.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 12 Month Projection */}
                    <div className="p-3 border rounded-lg bg-slate-50">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-sm">12 Meses</span>
                        <Badge variant="outline">
                          {goalCalculations.projection12.percentage.toFixed(2)}%
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Banca projetada:</span>
                          <span className="font-semibold">
                            R$ {goalCalculations.projection12.bankroll.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Lucro estimado:</span>
                          <span className="font-semibold">
                            +R$ {goalCalculations.projection12.profit.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Progresso & Análise
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* TWO SEPARATE METRICS */}
                  <div className="grid gap-4">
                    {/* ROI das Apostas */}
                    <div className="p-4 border rounded-lg bg-blue-50">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">ROI das Apostas</p>
                          <p className="text-xs text-muted-foreground">Performance pura das apostas</p>
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Lucro das apostas ÷ Total apostado</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <p className={`text-2xl font-bold ${
                        goalCalculations.bettingROI.roiPercentage >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {goalCalculations.bettingROI.roiPercentage >= 0 ? '+' : ''}
                        {goalCalculations.bettingROI.roiPercentage.toFixed(2)}%
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        R$ {goalCalculations.bettingROI.roi.toFixed(2)} de lucro
                      </p>
                    </div>

                    {/* Crescimento Total da Banca */}
                    <div className="p-4 border rounded-lg bg-green-50">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Crescimento Total da Banca</p>
                          <p className="text-xs text-muted-foreground">Inclui depósitos e saques</p>
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Crescimento considerando todas transações</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <p className={`text-2xl font-bold ${
                        goalCalculations.totalGrowth.growthPercentage >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {goalCalculations.totalGrowth.growthPercentage >= 0 ? '+' : ''}
                        {goalCalculations.totalGrowth.growthPercentage.toFixed(2)}%
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        R$ {goalCalculations.totalGrowth.growth.toFixed(2)} de crescimento
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* MONTHLY PROGRESS */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-medium">Progresso Mensal</Label>
                      {goalCalculations.monthlyProgress.isOnTrack ? (
                        <Badge className="bg-green-500">No Caminho Certo</Badge>
                      ) : (
                        <Badge variant="destructive">Abaixo da Meta</Badge>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Meta do mês:</span>
                        <span className="font-bold">{parseFloat(formData.targetPercentage || '0').toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Progresso atual:</span>
                        <span className={`font-bold ${
                          goalCalculations.monthlyProgress.currentProgressPercentage >= 0
                            ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {goalCalculations.monthlyProgress.currentProgressPercentage >= 0 ? '+' : ''}
                          {goalCalculations.monthlyProgress.currentProgressPercentage.toFixed(2)}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          goalCalculations.monthlyProgress.isOnTrack
                            ? 'bg-gradient-to-r from-green-500 to-green-600'
                            : 'bg-gradient-to-r from-yellow-500 to-orange-500'
                        }`}
                        style={{
                          width: `${Math.min(100, Math.max(0,
                            (goalCalculations.monthlyProgress.currentProgressPercentage /
                             parseFloat(formData.targetPercentage || '1')) * 100
                          ))}%`
                        }}
                      />
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Dia {goalCalculations.monthlyProgress.daysElapsed} de{' '}
                      {goalCalculations.monthlyProgress.daysInMonth} do mês
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 3: GESTÃO DE RISCO */}
        <TabsContent value="risk" className="space-y-6">
          {/* Custom Stakes Manager */}
          <StakeManager
            stakes={formData.customStakes}
            maxRecommended={formData.maxStakesRecommended}
            onAddStake={handleAddStake}
            onUpdateStake={handleUpdateStake}
            onDeleteStake={handleDeleteStake}
            currentBankroll={bankroll.currentBankroll}
          />

          {/* Stop Loss & Stop Gain */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Stop Loss & Stop Gain
              </CardTitle>
              <CardDescription>
                Defina limites de proteção por período. Alterne entre R$ e % conforme preferir.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Daily */}
              <div className="grid grid-cols-2 gap-4">
                <StopLossGainField
                  label="Stop Loss Diário"
                  value={formData.stopLossGain.dailyLoss}
                  mode={formData.stopLossGain.dailyLossMode}
                  onValueChange={(v) => handleStopValueChange('dailyLoss', v)}
                  onModeChange={(m) => handleStopModeChange('dailyLossMode', m)}
                  currentBankroll={bankroll.currentBankroll}
                  type="loss"
                  tooltip="Limite máximo de perda permitido em um único dia. Ao atingir, pare de apostar."
                />
                <StopLossGainField
                  label="Stop Gain Diário"
                  value={formData.stopLossGain.dailyGain}
                  mode={formData.stopLossGain.dailyGainMode}
                  onValueChange={(v) => handleStopValueChange('dailyGain', v)}
                  onModeChange={(m) => handleStopModeChange('dailyGainMode', m)}
                  currentBankroll={bankroll.currentBankroll}
                  type="gain"
                  tooltip="Meta de lucro diário. Ao atingir, considere parar para proteger ganhos."
                />
              </div>

              {/* Weekly */}
              <div className="grid grid-cols-2 gap-4">
                <StopLossGainField
                  label="Stop Loss Semanal"
                  value={formData.stopLossGain.weeklyLoss}
                  mode={formData.stopLossGain.weeklyLossMode}
                  onValueChange={(v) => handleStopValueChange('weeklyLoss', v)}
                  onModeChange={(m) => handleStopModeChange('weeklyLossMode', m)}
                  currentBankroll={bankroll.currentBankroll}
                  type="loss"
                  tooltip="Limite máximo de perda permitido na semana. Protege contra sequências ruins."
                />
                <StopLossGainField
                  label="Stop Gain Semanal"
                  value={formData.stopLossGain.weeklyGain}
                  mode={formData.stopLossGain.weeklyGainMode}
                  onValueChange={(v) => handleStopValueChange('weeklyGain', v)}
                  onModeChange={(m) => handleStopModeChange('weeklyGainMode', m)}
                  currentBankroll={bankroll.currentBankroll}
                  type="gain"
                  tooltip="Meta de lucro semanal. Considere sacar parte dos ganhos ao atingir."
                />
              </div>

              {/* Monthly */}
              <div className="grid grid-cols-2 gap-4">
                <StopLossGainField
                  label="Stop Loss Mensal"
                  value={formData.stopLossGain.monthlyLoss}
                  mode={formData.stopLossGain.monthlyLossMode}
                  onValueChange={(v) => handleStopValueChange('monthlyLoss', v)}
                  onModeChange={(m) => handleStopModeChange('monthlyLossMode', m)}
                  currentBankroll={bankroll.currentBankroll}
                  type="loss"
                  tooltip="Limite máximo de perda no mês. Revise sua estratégia se atingir."
                />
                <StopLossGainField
                  label="Stop Gain Mensal"
                  value={formData.stopLossGain.monthlyGain}
                  mode={formData.stopLossGain.monthlyGainMode}
                  onValueChange={(v) => handleStopValueChange('monthlyGain', v)}
                  onModeChange={(m) => handleStopModeChange('monthlyGainMode', m)}
                  currentBankroll={bankroll.currentBankroll}
                  type="gain"
                  tooltip="Meta de lucro mensal. Ao atingir, considere realizar lucros parciais."
                />
              </div>
            </CardContent>
          </Card>

        </TabsContent>

        {/* TAB 4: SAQUES */}
        <TabsContent value="withdrawals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5" />
                Histórico de Saques Manuais
              </CardTitle>
              <CardDescription>Registre e acompanhe suas retiradas da banca</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {withdrawals.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Nenhum saque registrado ainda</p>
                    <p className="text-sm">Clique em "Registrar Saque Manual" para adicionar</p>
                  </div>
                ) : (
                  <>
                    {withdrawals
                      .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
                      .slice(0, visibleWithdrawalsCount)
                      .map((withdrawal) => (
                        <div
                          key={withdrawal.id}
                          className="p-4 border-l-4 border-l-red-500 bg-red-50 rounded-lg space-y-2"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-semibold text-base">{withdrawal.title || 'Saque Manual'}</p>
                              <p className="text-sm text-red-700 font-bold mt-1">
                                -R$ {withdrawal.amount.toFixed(2)} • {format(new Date(withdrawal.dateTime), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                              </p>
                              {withdrawal.description && (
                                <p className="text-sm text-muted-foreground mt-1">{withdrawal.description}</p>
                              )}
                              <p className="text-xs text-muted-foreground mt-2">
                                Banca após: R$ {withdrawal.balanceAfter.toFixed(2)}
                              </p>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedWithdrawal(withdrawal);
                                  setShowEditWithdrawalModal(true);
                                }}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setWithdrawalToDelete(withdrawal)}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}

                    {withdrawals.length > visibleWithdrawalsCount && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setVisibleWithdrawalsCount(prev => prev + 3)}
                      >
                        <ChevronDown className="h-4 w-4 mr-2" />
                        Carregar Mais ({withdrawals.length - visibleWithdrawalsCount} restantes)
                      </Button>
                    )}
                  </>
                )}

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddWithdrawalModal(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Registrar Saque Manual
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setLocation('/settings/withdrawals-history')}
                  >
                    <History className="h-4 w-4 mr-2" />
                    Visualizar Histórico Completo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end pt-6">
        <Button
          onClick={handleSubmit}
          size="lg"
          className="px-8"
          disabled={!hasChanges()}
        >
          <Settings className="h-4 w-4 mr-2" />
          Salvar Todas as Configurações
        </Button>
      </div>

      {/* Modals */}
      <AddManualDepositModal
        open={showAddDepositModal}
        onOpenChange={setShowAddDepositModal}
        currentBankroll={bankroll.currentBankroll}
        onAddDeposit={handleAddDeposit}
      />

      <EditManualDepositModal
        open={showEditDepositModal}
        onOpenChange={setShowEditDepositModal}
        currentBankroll={bankroll.currentBankroll}
        deposit={selectedDeposit}
        onUpdateDeposit={handleUpdateDeposit}
      />

      {/* Delete Deposit Confirmation Dialog */}
      <AlertDialog open={!!depositToDelete} onOpenChange={() => setDepositToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir aporte?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este aporte? Esta ação irá recalcular sua banca atual.
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="font-medium">{depositToDelete?.title || 'Aporte Manual'}</p>
                <p className="text-sm text-green-600">+R$ {depositToDelete?.amount.toFixed(2)}</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => depositToDelete && handleDeleteDeposit(depositToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Sim, Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Withdrawal Modals */}
      <AddManualWithdrawalModal
        open={showAddWithdrawalModal}
        onOpenChange={setShowAddWithdrawalModal}
        currentBankroll={bankroll.currentBankroll}
        onAddWithdrawal={handleAddWithdrawal}
      />

      <EditManualWithdrawalModal
        open={showEditWithdrawalModal}
        onOpenChange={setShowEditWithdrawalModal}
        currentBankroll={bankroll.currentBankroll}
        withdrawal={selectedWithdrawal}
        onUpdateWithdrawal={handleUpdateWithdrawal}
      />

      {/* Delete Withdrawal Confirmation Dialog */}
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
              onClick={() => withdrawalToDelete && handleDeleteWithdrawal(withdrawalToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Sim, Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Initial Bankroll Confirmation Dialog */}
      <AlertDialog open={showEditBankrollDialog} onOpenChange={setShowEditBankrollDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>⚠️ Alterar Banca Inicial</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja alterar a banca inicial?
              <div className="mt-4 space-y-2">
                <p className="text-sm">
                  <strong>Atenção:</strong> Esta alteração pode impactar seus cálculos de ROI, percentuais e metas.
                </p>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Banca inicial atual:</span>{' '}
                    <span className="font-semibold">R$ {parseFloat(formData.initialBankroll).toFixed(2)}</span>
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowEditBankrollDialog(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmEditBankroll}>
              Sim, Permitir Edição
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
