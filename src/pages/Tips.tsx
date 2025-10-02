import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useExtendedData } from '@/hooks/useExtendedData';
import { useBettingData } from '@/hooks/useBettingData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, ArrowRight, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Tips() {
  const { t } = useTranslation();
  const { tips, addTip, updateTip, deleteTip } = useExtendedData();
  const { addBet } = useBettingData();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    tipster: '',
    match: '',
    market: '',
    odds: '',
    confidence: 'medium' as 'low' | 'medium' | 'high',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTip({
      ...formData,
      date: new Date().toISOString(),
      odds: parseFloat(formData.odds),
      status: 'pending',
    });
    setFormData({ tipster: '', match: '', market: '', odds: '', confidence: 'medium', notes: '' });
    setIsAddDialogOpen(false);
    toast.success(t('common.success'));
  };

  const handleConvertToBet = (tipId: string) => {
    const tip = tips.find(t => t.id === tipId);
    if (!tip) return;

    addBet({
      bookmaker: 'Manual',
      date: new Date().toISOString().split('T')[0],
      betType: 'simple',
      amount: 0,
      odds: tip.odds,
      return: 0,
      profit: 0,
      status: 'pending',
      description: `${tip.match} - ${tip.market}`,
      sourceType: 'tip',
      sourceTipId: tipId,
    });

    updateTip(tipId, { status: 'converted' });
    toast.success(t('tips.convertToBet'));
  };

  const getConfidenceBadge = (confidence: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      low: 'secondary',
      medium: 'default',
      high: 'destructive',
    };
    return <Badge variant={variants[confidence]}>{t(`tips.${confidence}`)}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      pending: 'default',
      converted: 'secondary',
      archived: 'outline',
    };
    return <Badge variant={variants[status]}>{t(`tips.${status}`)}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">{t('tips.title')}</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              {t('tips.addTip')}
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card">
            <DialogHeader>
              <DialogTitle>{t('tips.addTip')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>{t('tips.tipster')}</Label>
                <Input
                  value={formData.tipster}
                  onChange={(e) => setFormData({ ...formData, tipster: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>{t('tips.match')}</Label>
                <Input
                  value={formData.match}
                  onChange={(e) => setFormData({ ...formData, match: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>{t('tips.market')}</Label>
                <Input
                  value={formData.market}
                  onChange={(e) => setFormData({ ...formData, market: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>{t('tips.odds')}</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.odds}
                  onChange={(e) => setFormData({ ...formData, odds: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>{t('tips.confidence')}</Label>
                <Select
                  value={formData.confidence}
                  onValueChange={(value: any) => setFormData({ ...formData, confidence: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{t('tips.low')}</SelectItem>
                    <SelectItem value="medium">{t('tips.medium')}</SelectItem>
                    <SelectItem value="high">{t('tips.high')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">{t('common.save')}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('tips.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('tips.tipster')}</TableHead>
                <TableHead>{t('tips.match')}</TableHead>
                <TableHead>{t('tips.market')}</TableHead>
                <TableHead>{t('tips.odds')}</TableHead>
                <TableHead>{t('tips.confidence')}</TableHead>
                <TableHead>{t('tips.status')}</TableHead>
                <TableHead>{t('bets.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tips.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    {t('common.noData')}
                  </TableCell>
                </TableRow>
              ) : (
                tips.map((tip) => (
                  <TableRow key={tip.id}>
                    <TableCell className="font-medium">{tip.tipster}</TableCell>
                    <TableCell>{tip.match}</TableCell>
                    <TableCell>{tip.market}</TableCell>
                    <TableCell>{tip.odds.toFixed(2)}</TableCell>
                    <TableCell>{getConfidenceBadge(tip.confidence)}</TableCell>
                    <TableCell>{getStatusBadge(tip.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {tip.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleConvertToBet(tip.id)}
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteTip(tip.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
