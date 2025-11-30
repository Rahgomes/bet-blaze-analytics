import { CustomStake } from '@/types/betting';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2 } from 'lucide-react';
import { calculateStakeAmount } from '@/utils/stakeUtils';

interface StakeCardProps {
  stake: CustomStake;
  currentBankroll: number;
  onEdit: () => void;
  onDelete: () => void;
  compact?: boolean;
}

export function StakeCard({
  stake,
  currentBankroll,
  onEdit,
  onDelete,
  compact = false,
}: StakeCardProps) {
  const amount = calculateStakeAmount(stake.percentage, currentBankroll);

  return (
    <Card
      className="border-2 transition-all hover:shadow-md"
      style={{
        borderColor: stake.color,
        backgroundColor: `${stake.color}08`
      }}
    >
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div
                className="text-2xl font-bold"
                style={{ color: stake.color }}
              >
                {stake.percentage}%
              </div>
              <div
                className="text-sm font-semibold mt-1"
                style={{ color: stake.color }}
              >
                R$ {amount.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {stake.label}
              </div>
            </div>

            {!compact && (
              <div className="flex flex-col gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onEdit}
                  className="h-8 w-8 p-0"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDelete}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
