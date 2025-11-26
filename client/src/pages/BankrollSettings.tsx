import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useBettingData } from '@/hooks/useBettingData';
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
  ChevronDown
} from 'lucide-react';
import { AddManualDepositModal } from '@/components/betting/AddManualDepositModal';
import { EditManualDepositModal } from '@/components/betting/EditManualDepositModal';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Transaction } from '@/types/betting';

interface ScheduledWithdrawal {
  trigger: 'monthly_profit' | 'target_reached';
  percentage: number;
  minAmount: number;
  description: string;
  isActive: boolean;
}

export default function BankrollSettings() {
  const [, setLocation] = useLocation();
  const { bankroll, updateBankrollSettings, bets, transactions, addTransaction, updateTransaction, deleteTransaction } = useBettingData();
  const { toast } = useToast();

  const [scheduledWithdrawals, setScheduledWithdrawals] = useState<ScheduledWithdrawal[]>([
    {
      trigger: 'monthly_profit',
      percentage: 50,
      minAmount: 200,
      description: 'Proteção de lucros mensal',
      isActive: true
    }
  ]);

  // State for protecting initial bankroll editing
  const [allowEditInitialBankroll, setAllowEditInitialBankroll] = useState(false);
  const [showEditBankrollDialog, setShowEditBankrollDialog] = useState(false);

  // State for manual deposits modals
  const [showAddDepositModal, setShowAddDepositModal] = useState(false);
  const [showEditDepositModal, setShowEditDepositModal] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState<Transaction | null>(null);
  const [depositToDelete, setDepositToDelete] = useState<Transaction | null>(null);

  // State for "Load More" pagination
  const [visibleDepositsCount, setVisibleDepositsCount] = useState(3);

  const addScheduledWithdrawal = () => {
    const newWithdrawal: ScheduledWithdrawal = {
      trigger: 'monthly_profit',
      percentage: 25,
      minAmount: 100,
      description: 'Nova regra de saque',
      isActive: true
    };
    setScheduledWithdrawals([...scheduledWithdrawals, newWithdrawal]);
  };

  const removeScheduledWithdrawal = (index: number) => {
    setScheduledWithdrawals(scheduledWithdrawals.filter((_, i) => i !== index));
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
    stopLossDaily: string;
    stopGainDaily: string;
    maxStakePercentage: string;
    minStakeAmount: string;
    maxStakeAmount: string;
    dynamicStaking: boolean;
  }>({
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const initialBankroll = parseFloat(formData.initialBankroll);
    const targetPercentage = parseFloat(formData.targetPercentage);
    const targetAmount = formData.targetMode === 'fixed'
      ? parseFloat(formData.targetAmount)
      : initialBankroll * (1 + targetPercentage / 100);
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

      <Tabs defaultValue="bankroll" className="space-y-6">
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
            Saques & Retiradas
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
                <CardDescription>Configure sua meta anual e acompanhe o progresso</CardDescription>
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
                    <Label htmlFor="targetPercentage">Meta Anual (%)</Label>
                    <Input
                      id="targetPercentage"
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.targetPercentage}
                      onChange={(e) => setFormData({ ...formData, targetPercentage: e.target.value })}
                    />
                    <p className="text-sm text-muted-foreground">
                      Valor alvo: R$ {(parseFloat(formData.initialBankroll || '0') * (1 + parseFloat(formData.targetPercentage || '0') / 100)).toFixed(2)}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="targetAmount">Valor da Meta (R$)</Label>
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

                {/* Metas Intermediárias */}
                <div className="space-y-3">
                  <Label>Metas Intermediárias</Label>
                  <div className="grid gap-3">
                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-sm">Meta Mensal</p>
                          <p className="text-xs text-muted-foreground">1% ao mês</p>
                        </div>
                        <Badge variant="outline">Conservadora</Badge>
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-sm">Meta Trimestral</p>
                          <p className="text-xs text-muted-foreground">3% no trimestre</p>
                        </div>
                        <Badge variant="outline">Moderada</Badge>
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
                  <div className="flex justify-between">
                    <span>Progresso da Meta Anual</span>
                    <span className="font-bold">25%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full" style={{width: '25%'}}></div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Este Mês</p>
                      <p className="text-lg font-bold text-green-600">+2.5%</p>
                      <p className="text-xs text-green-600">Meta: 1%</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">No Ano</p>
                      <p className="text-lg font-bold text-blue-600">+8.2%</p>
                      <p className="text-xs text-blue-600">Meta: {formData.targetPercentage}%</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Simulação de Crescimento */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Projeção 12 Meses</Label>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex justify-between text-sm">
                        <span>Com meta atual:</span>
                        <span className="font-bold">
                          R$ {(parseFloat(formData.initialBankroll || '0') * (1 + parseFloat(formData.targetPercentage || '0') / 100)).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-green-600 mt-1">
                        <span>Lucro estimado:</span>
                        <span className="font-bold">
                          +R$ {(parseFloat(formData.initialBankroll || '0') * (parseFloat(formData.targetPercentage || '0') / 100)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alertas e Notificações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Alertas & Acompanhamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label htmlFor="daily-progress">Progresso Diário</Label>
                    <p className="text-sm text-muted-foreground">Alertas diários de performance</p>
                  </div>
                  <Switch id="daily-progress" defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label htmlFor="weekly-review">Review Semanal</Label>
                    <p className="text-sm text-muted-foreground">Relatório semanal automático</p>
                  </div>
                  <Switch id="weekly-review" defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label htmlFor="goal-alerts">Alertas de Meta</Label>
                    <p className="text-sm text-muted-foreground">Notificações ao atingir marcos</p>
                  </div>
                  <Switch id="goal-alerts" defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: GESTÃO DE RISCO */}
        <TabsContent value="risk" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Stop Loss & Stop Gain
                </CardTitle>
                <CardDescription>Defina limites de proteção por período</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="stopLossDaily">Stop Loss Diário (R$)</Label>
                      <Input
                        id="stopLossDaily"
                        type="number"
                        step="0.01"
                        value={formData.stopLossDaily}
                        onChange={(e) => setFormData({ ...formData, stopLossDaily: e.target.value })}
                      />
                      <p className="text-xs text-red-600 mt-1">
                        {((parseFloat(formData.stopLossDaily || '0') / parseFloat(formData.initialBankroll || '1')) * 100).toFixed(1)}% da banca
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="stopGainDaily">Stop Gain Diário (R$)</Label>
                      <Input
                        id="stopGainDaily"
                        type="number"
                        step="0.01"
                        value={formData.stopGainDaily}
                        onChange={(e) => setFormData({ ...formData, stopGainDaily: e.target.value })}
                      />
                      <p className="text-xs text-green-600 mt-1">
                        {((parseFloat(formData.stopGainDaily || '0') / parseFloat(formData.initialBankroll || '1')) * 100).toFixed(1)}% da banca
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="stopLossWeekly">Stop Loss Semanal (R$)</Label>
                      <Input
                        id="stopLossWeekly"
                        type="number"
                        step="0.01"
                        value={formData.stopLossWeekly}
                        onChange={(e) => setFormData({ ...formData, stopLossWeekly: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="stopGainWeekly">Stop Gain Semanal (R$)</Label>
                      <Input
                        id="stopGainWeekly"
                        type="number"
                        step="0.01"
                        value={formData.stopGainWeekly}
                        onChange={(e) => setFormData({ ...formData, stopGainWeekly: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="stopLossMonthly">Stop Loss Mensal (R$)</Label>
                      <Input
                        id="stopLossMonthly"
                        type="number"
                        step="0.01"
                        value={formData.stopLossMonthly}
                        onChange={(e) => setFormData({ ...formData, stopLossMonthly: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="stopGainMonthly">Stop Gain Mensal (R$)</Label>
                      <Input
                        id="stopGainMonthly"
                        type="number"
                        step="0.01"
                        value={formData.stopGainMonthly}
                        onChange={(e) => setFormData({ ...formData, stopGainMonthly: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Regras de Stake
                </CardTitle>
                <CardDescription>Configure limites de apostas e regras dinâmicas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="maxStakePercentage">Stake Máximo (% da Banca)</Label>
                    <Input
                      id="maxStakePercentage"
                      type="number"
                      step="0.1"
                      max="20"
                      value={formData.maxStakePercentage}
                      onChange={(e) => setFormData({ ...formData, maxStakePercentage: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Valor atual: R$ {(parseFloat(formData.initialBankroll || '0') * (parseFloat(formData.maxStakePercentage || '0') / 100)).toFixed(2)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="minStakeAmount">Stake Mínimo (R$)</Label>
                      <Input
                        id="minStakeAmount"
                        type="number"
                        step="0.01"
                        value={formData.minStakeAmount}
                        onChange={(e) => setFormData({ ...formData, minStakeAmount: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxStakeAmount">Stake Máximo (R$)</Label>
                      <Input
                        id="maxStakeAmount"
                        type="number"
                        step="0.01"
                        value={formData.maxStakeAmount}
                        onChange={(e) => setFormData({ ...formData, maxStakeAmount: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label htmlFor="dynamicStaking">Stake Dinâmico</Label>
                      <p className="text-sm text-muted-foreground">Ajusta stake baseado na performance</p>
                    </div>
                    <Switch
                      id="dynamicStaking"
                      checked={formData.dynamicStaking}
                      onCheckedChange={(checked) => setFormData({ ...formData, dynamicStaking: checked })}
                    />
                  </div>

                  {formData.dynamicStaking && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 mb-2">Regras Dinâmicas Ativas</p>
                      <div className="space-y-1 text-xs text-blue-700">
                        <p>• +0.5% após 3 vitórias consecutivas</p>
                        <p>• -0.5% após 2 derrotas seguidas</p>
                        <p>• Ajuste máximo: ±2% do stake base</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alertas de Risco */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Alertas de Proteção
              </CardTitle>
              <CardDescription>Configure notificações automáticas de risco</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label htmlFor="high-exposure">Alta Exposição</Label>
                    <p className="text-sm text-muted-foreground">+3 apostas no mesmo time</p>
                  </div>
                  <Switch id="high-exposure" defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label htmlFor="poor-performance">Performance Ruim</Label>
                    <p className="text-sm text-muted-foreground">5 derrotas seguidas</p>
                  </div>
                  <Switch id="poor-performance" defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label htmlFor="stop-reached">Stop Atingido</Label>
                    <p className="text-sm text-muted-foreground">Stop loss/gain alcançado</p>
                  </div>
                  <Switch id="stop-reached" defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label htmlFor="large-stake">Stake Elevado</Label>
                    <p className="text-sm text-muted-foreground">Aposta &gt; 10% da banca</p>
                  </div>
                  <Switch id="large-stake" defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: SAQUES & RETIRADAS */}
        <TabsContent value="withdrawals" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Saques Programados
                </CardTitle>
                <CardDescription>Configure proteção automática de lucros</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {scheduledWithdrawals.map((withdrawal, index) => (
                  <div key={index} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant={withdrawal.isActive ? "default" : "secondary"}>
                        {withdrawal.trigger === 'monthly_profit' ? 'Lucro Mensal' : 'Meta Atingida'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeScheduledWithdrawal(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="font-medium">{withdrawal.percentage}% do lucro</p>
                    <p className="text-sm text-muted-foreground">{withdrawal.description}</p>
                    <p className="text-xs text-muted-foreground">Mínimo: R$ {withdrawal.minAmount}</p>
                  </div>
                ))}
                <Button variant="outline" className="w-full" onClick={addScheduledWithdrawal}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Regra de Saque
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5" />
                  Histórico de Saques
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {withdrawals.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Nenhum saque registrado ainda</p>
                    </div>
                  ) : (
                    withdrawals
                      .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
                      .map((withdrawal) => (
                        <div
                          key={withdrawal.id}
                          className="flex justify-between items-center p-3 border-l-4 border-l-red-500 bg-red-50 rounded"
                        >
                          <div>
                            <p className="font-medium">{withdrawal.title || 'Saque'}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(withdrawal.dateTime), "dd/MM/yyyy", { locale: ptBR })}
                            </p>
                          </div>
                          <span className="font-bold text-red-600">-R$ {withdrawal.amount.toFixed(2)}</span>
                        </div>
                      ))
                  )}
                  <Button variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Registrar Saque Manual
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
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

      {/* Delete Confirmation Dialog */}
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
