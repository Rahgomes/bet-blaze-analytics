import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
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

interface AddManualWithdrawalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentBankroll: number;
  onAddWithdrawal: (withdrawal: {
    title: string;
    amount: number;
    dateTime: string;
    description?: string;
  }) => void;
}

export function AddManualWithdrawalModal({
  open,
  onOpenChange,
  currentBankroll,
  onAddWithdrawal,
}: AddManualWithdrawalModalProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [time, setTime] = useState(format(new Date(), 'HH:mm'));
  const [description, setDescription] = useState('');
  const [showLargeWithdrawalAlert, setShowLargeWithdrawalAlert] = useState(false);

  const amountNumber = parseFloat(amount) || 0;
  const newBankroll = currentBankroll - amountNumber;
  const percentageOfBankroll = currentBankroll > 0 ? (amountNumber / currentBankroll) * 100 : 0;
  const isLargeWithdrawal = percentageOfBankroll >= 50;

  const validateAndSubmit = () => {
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

    if (amountNumber > currentBankroll) {
      toast({
        title: 'Erro',
        description: 'O valor do saque não pode exceder a banca disponível.',
        variant: 'destructive',
      });
      return;
    }

    // Check if it's a large withdrawal (>= 50%)
    if (isLargeWithdrawal) {
      setShowLargeWithdrawalAlert(true);
      return;
    }

    confirmWithdrawal();
  };

  const confirmWithdrawal = () => {
    const [hours, minutes] = time.split(':');
    const selectedDate = new Date(date);
    selectedDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

    onAddWithdrawal({
      title: title.trim(),
      amount: amountNumber,
      dateTime: selectedDate.toISOString(),
      description: description.trim() || undefined,
    });

    // Reset form
    setTitle('');
    setAmount('');
    setDate(new Date());
    setTime(format(new Date(), 'HH:mm'));
    setDescription('');
    setShowLargeWithdrawalAlert(false);
    onOpenChange(false);

    toast({
      title: 'Saque registrado',
      description: 'O saque manual foi registrado com sucesso.',
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Saque Manual</DialogTitle>
            <DialogDescription>
              Registre uma retirada da sua banca
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Título/Nome do Saque */}
            <div className="space-y-2">
              <Label htmlFor="title">Título/Nome do Saque</Label>
              <Input
                id="title"
                placeholder="Ex: Saque para investimento"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Valor do Saque */}
            <div className="space-y-2">
              <Label htmlFor="amount">Valor do Saque</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  R$
                </span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  max={currentBankroll}
                  placeholder="0,00"
                  className="pl-10"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              {amountNumber > currentBankroll && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Valor excede a banca disponível
                </p>
              )}
            </div>

            {/* Preview da Banca */}
            {amountNumber > 0 && amountNumber <= currentBankroll && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span>💰</span>
                  <span>Preview</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Banca atual:</span>
                  <span className="font-medium">R$ {currentBankroll.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Após saque:</span>
                  <span className="font-semibold text-red-600">
                    R$ {newBankroll.toFixed(2)}
                  </span>
                </div>
                {isLargeWithdrawal && (
                  <div className="flex items-start gap-2 mt-2 pt-2 border-t border-red-300">
                    <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-orange-700">
                      Este saque representa <strong>{percentageOfBankroll.toFixed(1)}%</strong> da sua banca.
                      Você será solicitado a confirmar.
                    </p>
                  </div>
                )}
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
                <Label htmlFor="time">Hora</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>

            {/* Descrição (opcional) */}
            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
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
            <Button onClick={validateAndSubmit} className="bg-red-600 hover:bg-red-700">
              Registrar Saque
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Large Withdrawal Alert Dialog */}
      <AlertDialog open={showLargeWithdrawalAlert} onOpenChange={setShowLargeWithdrawalAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Atenção: Saque Grande
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Este saque representa <strong className="text-orange-700">{percentageOfBankroll.toFixed(1)}%</strong> da sua banca atual.
              </p>
              <div className="bg-muted p-3 rounded-lg space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Valor do saque:</span>
                  <span className="font-semibold text-red-600">-R$ {amountNumber.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Banca após saque:</span>
                  <span className="font-semibold">R$ {newBankroll.toFixed(2)}</span>
                </div>
              </div>
              <p className="text-foreground font-medium">
                Tem certeza que deseja continuar com este saque?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowLargeWithdrawalAlert(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmWithdrawal}
              className="bg-red-600 hover:bg-red-700"
            >
              Sim, Confirmar Saque
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
