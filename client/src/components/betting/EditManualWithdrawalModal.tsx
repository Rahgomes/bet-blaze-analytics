import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Transaction } from '@/types/betting';

interface EditManualWithdrawalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentBankroll: number;
  withdrawal: Transaction | null;
  onUpdateWithdrawal: (withdrawalId: string, updates: {
    title?: string;
    amount?: number;
    dateTime?: string;
    description?: string;
  }) => void;
}

export function EditManualWithdrawalModal({
  open,
  onOpenChange,
  currentBankroll,
  withdrawal,
  onUpdateWithdrawal,
}: EditManualWithdrawalModalProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [time, setTime] = useState(format(new Date(), 'HH:mm'));
  const [description, setDescription] = useState('');

  // Populate form when withdrawal changes
  useEffect(() => {
    if (withdrawal) {
      setTitle(withdrawal.title || '');
      setAmount(withdrawal.amount.toString());
      const withdrawalDate = new Date(withdrawal.dateTime);
      setDate(withdrawalDate);
      setTime(format(withdrawalDate, 'HH:mm'));
      setDescription(withdrawal.description || '');
    }
  }, [withdrawal]);

  const amountNumber = parseFloat(amount) || 0;
  const originalAmount = withdrawal?.amount || 0;
  const amountDiff = amountNumber - originalAmount;

  // For withdrawals: available = current bankroll + original withdrawal amount
  // This is because the original withdrawal was already subtracted
  const availableBankroll = currentBankroll + originalAmount;
  const newBankroll = currentBankroll - amountDiff;
  const exceedsAvailable = amountNumber > availableBankroll;

  const handleSubmit = () => {
    if (!withdrawal) return;

    if (!title.trim()) {
      toast({
        title: 'Erro',
        description: 'Por favor, insira um título para o saque.',
        variant: 'destructive',
      });
      return;
    }

    if (amountNumber <= 0) {
      toast({
        title: 'Erro',
        description: 'Por favor, insira um valor válido para o saque.',
        variant: 'destructive',
      });
      return;
    }

    if (exceedsAvailable) {
      toast({
        title: 'Erro',
        description: `O valor do saque não pode exceder R$ ${availableBankroll.toFixed(2)} (banca disponível).`,
        variant: 'destructive',
      });
      return;
    }

    const [hours, minutes] = time.split(':');
    const selectedDate = new Date(date);
    selectedDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

    onUpdateWithdrawal(withdrawal.id, {
      title: title.trim(),
      amount: amountNumber,
      dateTime: selectedDate.toISOString(),
      description: description.trim() || undefined,
    });

    onOpenChange(false);

    toast({
      title: 'Saque atualizado',
      description: 'O saque manual foi atualizado com sucesso.',
    });
  };

  if (!withdrawal) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Saque Manual</DialogTitle>
          <DialogDescription>
            Atualize as informações do saque
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Título/Nome do Saque */}
          <div className="space-y-2">
            <Label htmlFor="edit-title">Título/Nome do Saque</Label>
            <Input
              id="edit-title"
              placeholder="Ex: Saque para investimento"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Valor do Saque */}
          <div className="space-y-2">
            <Label htmlFor="edit-amount">Valor do Saque</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                R$
              </span>
              <Input
                id="edit-amount"
                type="number"
                step="0.01"
                min="0"
                max={availableBankroll}
                placeholder="0,00"
                className="pl-10"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            {exceedsAvailable && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Valor excede o disponível: R$ {availableBankroll.toFixed(2)}
              </p>
            )}
          </div>

          {/* Preview da Banca */}
          {amountNumber > 0 && !exceedsAvailable && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium">
                <span>💰</span>
                <span>Preview</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Banca atual:</span>
                <span className="font-medium">R$ {currentBankroll.toFixed(2)}</span>
              </div>
              {amountDiff !== 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Diferença:</span>
                  <span className={cn(
                    "font-medium",
                    amountDiff > 0 ? "text-red-600" : "text-green-600"
                  )}>
                    {amountDiff > 0 ? '-' : '+'}R$ {Math.abs(amountDiff).toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Após edição:</span>
                <span className="font-semibold text-red-600">
                  R$ {newBankroll.toFixed(2)}
                </span>
              </div>
              <div className="text-xs text-muted-foreground pt-2 border-t border-red-300">
                Disponível para edição: R$ {availableBankroll.toFixed(2)}
              </div>
            </div>
          )}

          {/* Data/Hora */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecione'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => newDate && setDate(newDate)}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-time">Hora</Label>
              <Input
                id="edit-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          {/* Descrição (opcional) */}
          <div className="space-y-2">
            <Label htmlFor="edit-description">Descrição (opcional)</Label>
            <Textarea
              id="edit-description"
              placeholder="Ex: Retirada para despesas pessoais"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="bg-red-600 hover:bg-red-700">
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
