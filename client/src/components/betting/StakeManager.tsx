import { useState } from 'react';
import { CustomStake } from '@/types/betting';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { StakeCard } from './StakeCard';
import { StakeFormModal } from './StakeFormModal';
import { sortStakesByPercentage } from '@/utils/stakeUtils';
import { Plus, HelpCircle, AlertTriangle } from 'lucide-react';

interface StakeManagerProps {
  stakes: CustomStake[];
  maxRecommended: number;
  onAddStake: (stake: Omit<CustomStake, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateStake: (id: string, updates: Partial<CustomStake>) => void;
  onDeleteStake: (id: string) => void;
  currentBankroll: number;
}

export function StakeManager({
  stakes,
  maxRecommended,
  onAddStake,
  onUpdateStake,
  onDeleteStake,
  currentBankroll,
}: StakeManagerProps) {
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingStake, setEditingStake] = useState<CustomStake | undefined>();
  const [deletingStake, setDeletingStake] = useState<CustomStake | null>(null);

  const sortedStakes = sortStakesByPercentage(stakes);
  const exceedsRecommended = stakes.length > maxRecommended;

  const handleEdit = (stake: CustomStake) => {
    setEditingStake(stake);
    setShowFormModal(true);
  };

  const handleFormSubmit = (stakeData: Omit<CustomStake, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingStake) {
      onUpdateStake(editingStake.id, stakeData);
    } else {
      onAddStake(stakeData);
    }
    setShowFormModal(false);
    setEditingStake(undefined);
  };

  const handleDeleteConfirm = () => {
    if (deletingStake) {
      onDeleteStake(deletingStake.id);
      setDeletingStake(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Stakes Personalizados
                {exceedsRecommended && (
                  <Badge variant="destructive" className="ml-2">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {stakes.length - maxRecommended} acima
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Configure percentuais da banca para gestão de risco
                {' '}
                <span className="font-medium">
                  ({stakes.length}/{maxRecommended} recomendados)
                </span>
              </CardDescription>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-5 w-5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="font-semibold mb-2">Limite Recomendado</p>
                  <p className="text-xs">
                    Manter {maxRecommended} stakes ou menos facilita a tomada de decisão e
                    evita confusão na hora de escolher o valor da aposta.
                  </p>
                  <p className="text-xs mt-2">
                    Você pode criar mais stakes, mas considere simplificar sua estratégia.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent>
          {stakes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-2">Nenhum stake configurado</p>
              <p className="text-sm">Clique em "Adicionar Stake" para começar</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {sortedStakes.map((stake) => (
                <StakeCard
                  key={stake.id}
                  stake={stake}
                  currentBankroll={currentBankroll}
                  onEdit={() => handleEdit(stake)}
                  onDelete={() => setDeletingStake(stake)}
                />
              ))}
            </div>
          )}

          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setEditingStake(undefined);
              setShowFormModal(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Stake
          </Button>
        </CardContent>
      </Card>

      <StakeFormModal
        open={showFormModal}
        onOpenChange={(open) => {
          setShowFormModal(open);
          if (!open) setEditingStake(undefined);
        }}
        onSubmit={handleFormSubmit}
        existingStakes={stakes}
        editingStake={editingStake}
        currentBankroll={currentBankroll}
      />

      <AlertDialog open={!!deletingStake} onOpenChange={() => setDeletingStake(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir stake?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este stake?
              {deletingStake && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="font-medium">{deletingStake.label}</p>
                  <p className="text-sm">{deletingStake.percentage}% da banca</p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Sim, Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
