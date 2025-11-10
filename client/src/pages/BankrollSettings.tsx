import { useState } from 'react';
import { useBettingData } from '@/hooks/useBettingData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Wallet, 
  Target, 
  Shield, 
  CreditCard, 
  Plus, 
  Trash2, 
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Settings,
  DollarSign,
  PieChart
} from 'lucide-react';

interface ScheduledDeposit {
  amount: number;
  frequency: 'weekly' | 'monthly' | 'quarterly';
  dayOfMonth: number;
  description: string;
  isActive: boolean;
}

interface ManualDeposit {
  date: string;
  amount: number;
  description: string;
}

interface ScheduledWithdrawal {
  trigger: 'monthly_profit' | 'target_reached';
  percentage: number;
  minAmount: number;
  description: string;
  isActive: boolean;
}

export default function BankrollSettings() {
  const { bankroll, updateBankrollSettings } = useBettingData();
  const { toast } = useToast();

  // Enhanced state for all configuration options
  const [bankrollMode, setBankrollMode] = useState<'day-zero' | 'monthly-reset' | 'continuous'>('day-zero');
  const [scheduledDeposits, setScheduledDeposits] = useState<ScheduledDeposit[]>([
    {
      amount: 100,
      frequency: 'monthly',
      dayOfMonth: 1,
      description: 'Aporte mensal fixo',
      isActive: true
    }
  ]);
  const [manualDeposits, setManualDeposits] = useState<ManualDeposit[]>([
    {
      date: '2024-11-01',
      amount: 250,
      description: 'Aporte extra - bônus trabalho'
    }
  ]);
  const [scheduledWithdrawals, setScheduledWithdrawals] = useState<ScheduledWithdrawal[]>([
    {
      trigger: 'monthly_profit',
      percentage: 50,
      minAmount: 200,
      description: 'Proteção de lucros mensal',
      isActive: true
    }
  ]);

  // Functions to handle deposits and withdrawals
  const addScheduledDeposit = () => {
    const newDeposit: ScheduledDeposit = {
      amount: 100,
      frequency: 'monthly',
      dayOfMonth: 1,
      description: 'Novo aporte',
      isActive: true
    };
    setScheduledDeposits([...scheduledDeposits, newDeposit]);
  };

  const removeScheduledDeposit = (index: number) => {
    setScheduledDeposits(scheduledDeposits.filter((_, i) => i !== index));
  };

  const addManualDeposit = () => {
    const newDeposit: ManualDeposit = {
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      description: 'Aporte manual'
    };
    setManualDeposits([...manualDeposits, newDeposit]);
  };

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
              <p className="text-sm text-muted-foreground">Próximo Aporte</p>
              <p className="text-2xl font-bold text-purple-600">01/12</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="bankroll" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="bankroll" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Banca & Aportes
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Metas & Objetivos
          </TabsTrigger>
          <TabsTrigger value="risk" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Gestão de Risco
          </TabsTrigger>
          <TabsTrigger value="withdrawals" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Saques & Retiradas
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: BANCA & APORTES */}
        <TabsContent value="bankroll" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Configuração da Banca */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuração da Banca
                </CardTitle>
                <CardDescription>Defina o modo de operação da sua banca</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="initialBankroll">Banca Inicial (R$)</Label>
                  <Input
                    id="initialBankroll"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.initialBankroll}
                    onChange={(e) => setFormData({ ...formData, initialBankroll: e.target.value })}
                  />
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label>Modo de Gerenciamento</Label>
                  <RadioGroup 
                    value={bankrollMode} 
                    onValueChange={(value) => setBankrollMode(value as 'day-zero' | 'monthly-reset' | 'continuous')}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="day-zero" id="day-zero" />
                      <Label htmlFor="day-zero" className="cursor-pointer">
                        <div>
                          <p className="font-medium">Banca desde o Dia Zero</p>
                          <p className="text-sm text-muted-foreground">Banca única desde o início do tracking</p>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="monthly-reset" id="monthly-reset" />
                      <Label htmlFor="monthly-reset" className="cursor-pointer">
                        <div>
                          <p className="font-medium">Reset Mensal da Banca</p>
                          <p className="text-sm text-muted-foreground">Nova banca inicial todo dia 1º do mês</p>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="continuous" id="continuous" />
                      <Label htmlFor="continuous" className="cursor-pointer">
                        <div>
                          <p className="font-medium">Banca Contínua com Aportes</p>
                          <p className="text-sm text-muted-foreground">Banca cresce com aportes e lucros acumulados</p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>

            {/* Aportes Programados */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Aportes Programados
                </CardTitle>
                <CardDescription>Configure aportes automáticos recorrentes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {scheduledDeposits.map((deposit, index) => (
                  <div key={index} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant={deposit.isActive ? "default" : "secondary"}>
                        {deposit.frequency === 'monthly' ? 'Mensal' : 
                         deposit.frequency === 'weekly' ? 'Semanal' : 'Trimestral'}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeScheduledDeposit(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="font-medium">R$ {deposit.amount.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">{deposit.description}</p>
                    <p className="text-xs text-muted-foreground">Todo dia {deposit.dayOfMonth} do mês</p>
                  </div>
                ))}
                <Button variant="outline" className="w-full" onClick={addScheduledDeposit}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Aporte
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Histórico de Aportes Manuais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Histórico de Aportes Manuais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {manualDeposits.map((deposit, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border-l-4 border-l-green-500 bg-green-50 rounded">
                    <div>
                      <p className="font-medium">{deposit.description}</p>
                      <p className="text-sm text-muted-foreground">{deposit.date}</p>
                    </div>
                    <span className="font-bold text-green-600">+R$ {deposit.amount.toFixed(2)}</span>
                  </div>
                ))}
                <Button variant="outline" className="w-full" onClick={addManualDeposit}>
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Aporte Manual
                </Button>
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
                  <div className="flex justify-between items-center p-3 border-l-4 border-l-red-500 bg-red-50 rounded">
                    <div>
                      <p className="font-medium">Saque de emergência</p>
                      <p className="text-sm text-muted-foreground">2024-10-31</p>
                    </div>
                    <span className="font-bold text-red-600">-R$ 150,00</span>
                  </div>
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
        <Button onClick={handleSubmit} size="lg" className="px-8">
          <Settings className="h-4 w-4 mr-2" />
          Salvar Todas as Configurações
        </Button>
      </div>
    </div>
  );
}
