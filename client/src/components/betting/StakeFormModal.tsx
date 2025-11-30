import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { CustomStake, StakeLabelMode, PREDEFINED_STAKE_LABELS } from '@/types/betting';
import { generateAutoLabel, generateAutoColor, validateStakePercentage, calculateStakeAmount } from '@/utils/stakeUtils';

interface StakeFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (stake: Omit<CustomStake, 'id' | 'createdAt' | 'updatedAt'>) => void;
  existingStakes: CustomStake[];
  editingStake?: CustomStake;
  currentBankroll: number;
}

export function StakeFormModal({
  open,
  onOpenChange,
  onSubmit,
  existingStakes,
  editingStake,
  currentBankroll,
}: StakeFormModalProps) {
  const { toast } = useToast();
  const [percentage, setPercentage] = useState('');
  const [labelMode, setLabelMode] = useState<StakeLabelMode>('auto');
  const [customLabel, setCustomLabel] = useState('');
  const [predefinedLabel, setPredefinedLabel] = useState('');
  const [color, setColor] = useState('');

  // Initialize form when editing
  useEffect(() => {
    if (editingStake && open) {
      setPercentage(editingStake.percentage.toString());
      setLabelMode(editingStake.labelMode);
      setCustomLabel(editingStake.labelMode === 'custom' ? editingStake.label : '');
      setPredefinedLabel(editingStake.labelMode === 'predefined' ? editingStake.label : '');
      setColor(editingStake.color);
    } else if (open) {
      // Reset for new stake
      setPercentage('');
      setLabelMode('auto');
      setCustomLabel('');
      setPredefinedLabel('');
      setColor('');
    }
  }, [editingStake, open]);

  const percentageNum = parseFloat(percentage) || 0;
  const autoLabel = generateAutoLabel(percentageNum);
  const autoColor = generateAutoColor(percentageNum);
  const stakeAmount = calculateStakeAmount(percentageNum, currentBankroll);

  const validation = validateStakePercentage(
    percentageNum,
    existingStakes,
    editingStake?.id
  );

  const getFinalLabel = (): string => {
    if (labelMode === 'auto') return autoLabel;
    if (labelMode === 'predefined') return predefinedLabel;
    return customLabel;
  };

  const getFinalColor = (): string => {
    return color || autoColor;
  };

  const handleSubmit = () => {
    if (!validation.valid) {
      toast({
        title: 'Erro de validação',
        description: validation.error,
        variant: 'destructive',
      });
      return;
    }

    const finalLabel = getFinalLabel();
    if (!finalLabel) {
      toast({
        title: 'Erro',
        description: 'Por favor, defina um label para o stake',
        variant: 'destructive',
      });
      return;
    }

    onSubmit({
      percentage: percentageNum,
      labelMode,
      label: finalLabel,
      color: getFinalColor(),
    });

    toast({
      title: editingStake ? 'Stake atualizado' : 'Stake criado',
      description: `${finalLabel}: ${percentageNum}% (R$ ${stakeAmount.toFixed(2)})`,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingStake ? 'Editar Stake' : 'Criar Novo Stake'}
          </DialogTitle>
          <DialogDescription>
            Configure um percentual da banca para gestão de risco
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Percentage Input */}
          <div className="space-y-2">
            <Label htmlFor="percentage">Percentual da Banca *</Label>
            <div className="relative">
              <Input
                id="percentage"
                type="number"
                step="0.1"
                min="0.1"
                max="10"
                placeholder="1.5"
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                className={!validation.valid ? 'border-red-500' : ''}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                %
              </span>
            </div>
            {!validation.valid && (
              <p className="text-sm text-red-600">{validation.error}</p>
            )}
            {validation.valid && percentageNum > 0 && (
              <p className="text-sm text-muted-foreground">
                ≈ R$ {stakeAmount.toFixed(2)} na banca atual
              </p>
            )}
          </div>

          {/* Label Mode Selection */}
          <div className="space-y-3">
            <Label>Modo de Label</Label>
            <RadioGroup value={labelMode} onValueChange={(v) => setLabelMode(v as StakeLabelMode)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="auto" id="auto" />
                <Label htmlFor="auto" className="font-normal">
                  Automático {percentageNum > 0 && `(${autoLabel})`}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="predefined" id="predefined" />
                <Label htmlFor="predefined" className="font-normal">Selecionar da lista</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom" className="font-normal">Customizado</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Predefined Label Selector */}
          {labelMode === 'predefined' && (
            <div className="space-y-2">
              <Label htmlFor="predefinedLabel">Selecione o Label</Label>
              <Select value={predefinedLabel} onValueChange={setPredefinedLabel}>
                <SelectTrigger id="predefinedLabel">
                  <SelectValue placeholder="Escolha um label..." />
                </SelectTrigger>
                <SelectContent>
                  {PREDEFINED_STAKE_LABELS.map((label) => (
                    <SelectItem key={label} value={label}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Custom Label Input */}
          {labelMode === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="customLabel">Label Customizado</Label>
              <Input
                id="customLabel"
                placeholder="Ex: Entrada Especial"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                maxLength={30}
              />
            </div>
          )}

          {/* Color Picker */}
          <div className="space-y-2">
            <Label htmlFor="color">
              Cor (opcional) {!color && `- usando automática`}
            </Label>
            <div className="flex gap-2">
              <Input
                id="color"
                type="color"
                value={color || autoColor}
                onChange={(e) => setColor(e.target.value)}
                className="w-20 h-10"
              />
              {color && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setColor('')}
                >
                  Resetar
                </Button>
              )}
            </div>
          </div>

          {/* Preview */}
          {percentageNum > 0 && (
            <div
              className="rounded-lg p-4 border-2"
              style={{
                borderColor: getFinalColor(),
                backgroundColor: `${getFinalColor()}10`
              }}
            >
              <p className="text-xs text-muted-foreground mb-2">Preview:</p>
              <div
                className="text-xl font-bold"
                style={{ color: getFinalColor() }}
              >
                {percentageNum}% - {getFinalLabel()}
              </div>
              <div
                className="text-sm font-semibold mt-1"
                style={{ color: getFinalColor() }}
              >
                R$ {stakeAmount.toFixed(2)}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!validation.valid || !getFinalLabel()}>
            {editingStake ? 'Atualizar' : 'Criar'} Stake
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
