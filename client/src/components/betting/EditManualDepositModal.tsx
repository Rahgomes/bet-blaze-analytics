import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Transaction } from '@/types/betting';
import { useTranslation } from '@/hooks/useTranslation';

interface EditManualDepositModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentBankroll: number;
  deposit: Transaction | null;
  onUpdateDeposit: (depositId: string, updates: {
    title?: string;
    amount?: number;
    dateTime?: string;
    description?: string;
  }) => void;
}

export function EditManualDepositModal({
  open,
  onOpenChange,
  currentBankroll,
  deposit,
  onUpdateDeposit,
}: EditManualDepositModalProps) {
  const { toast } = useToast();
  const { t, language } = useTranslation();
  const locale = language === 'pt-br' ? ptBR : enUS;
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [time, setTime] = useState(format(new Date(), 'HH:mm'));
  const [description, setDescription] = useState('');

  // Populate form when deposit changes
  useEffect(() => {
    if (deposit) {
      setTitle(deposit.title || '');
      setAmount(deposit.amount.toString());
      const depositDate = new Date(deposit.dateTime);
      setDate(depositDate);
      setTime(format(depositDate, 'HH:mm'));
      setDescription(deposit.description || '');
    }
  }, [deposit]);

  const amountNumber = parseFloat(amount) || 0;
  const originalAmount = deposit?.amount || 0;
  const amountDiff = amountNumber - originalAmount;
  const newBankroll = currentBankroll + amountDiff;

  const handleSubmit = () => {
    if (!deposit) return;

    if (!title.trim()) {
      toast({
        title: t('depositsHistory.toasts.errorTitle'),
        description: t('depositsHistory.toasts.errorTitleRequired'),
        variant: 'destructive',
      });
      return;
    }

    if (amountNumber <= 0) {
      toast({
        title: t('depositsHistory.toasts.errorTitle'),
        description: t('depositsHistory.toasts.errorAmountRequired'),
        variant: 'destructive',
      });
      return;
    }

    const [hours, minutes] = time.split(':');
    const selectedDate = new Date(date);
    selectedDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

    onUpdateDeposit(deposit.id, {
      title: title.trim(),
      amount: amountNumber,
      dateTime: selectedDate.toISOString(),
      description: description.trim() || undefined,
    });

    onOpenChange(false);

    toast({
      title: t('depositsHistory.toasts.depositEditSuccess'),
      description: t('depositsHistory.toasts.depositEditSuccessDescription'),
    });
  };

  if (!deposit) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('depositsHistory.editModal.title')}</DialogTitle>
          <DialogDescription>
            {t('depositsHistory.editModal.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Título/Nome do Aporte */}
          <div className="space-y-2">
            <Label htmlFor="edit-title">{t('depositsHistory.editModal.titleLabel')}</Label>
            <Input
              id="edit-title"
              placeholder={t('depositsHistory.editModal.titlePlaceholder')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Valor do Aporte */}
          <div className="space-y-2">
            <Label htmlFor="edit-amount">{t('depositsHistory.editModal.amountLabel')}</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                R$
              </span>
              <Input
                id="edit-amount"
                type="number"
                step="0.01"
                min="0"
                placeholder={t('depositsHistory.editModal.amountPlaceholder')}
                className="pl-10"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          {/* Preview da Banca */}
          {amountNumber > 0 && (
            <div className="rounded-lg bg-muted p-4 space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium">
                <span>💰</span>
                <span>{t('depositsHistory.editModal.previewTitle')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('depositsHistory.editModal.previewCurrentBankroll')}</span>
                <span className="font-medium">R$ {currentBankroll.toFixed(2)}</span>
              </div>
              {amountDiff !== 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('depositsHistory.editModal.previewDifference')}</span>
                  <span className={cn(
                    "font-medium",
                    amountDiff > 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {amountDiff > 0 ? '+' : ''}R$ {amountDiff.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('depositsHistory.editModal.previewAfterEdit')}</span>
                <span className="font-semibold text-green-600">
                  R$ {newBankroll.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Data/Hora */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('depositsHistory.editModal.dateLabel')}</Label>
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
                    {date ? format(date, 'dd/MM/yyyy', { locale }) : t('depositsHistory.editModal.dateSelect')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => newDate && setDate(newDate)}
                    initialFocus
                    locale={locale}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-time">{t('depositsHistory.editModal.timeLabel')}</Label>
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
            <Label htmlFor="edit-description">{t('depositsHistory.editModal.descriptionLabel')}</Label>
            <Textarea
              id="edit-description"
              placeholder={t('depositsHistory.editModal.descriptionPlaceholder')}
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('depositsHistory.editModal.cancel')}
          </Button>
          <Button onClick={handleSubmit}>{t('depositsHistory.editModal.save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
