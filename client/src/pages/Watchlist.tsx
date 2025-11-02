import { useState, useMemo } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useExtendedData } from '@/hooks/useExtendedData';
import { useBettingData } from '@/hooks/useBettingData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function Watchlist() {
  const { t } = useTranslation();
  const { teams, addTeam, deleteTeam } = useExtendedData();
  const { bets } = useBettingData();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    competition: '',
    notes: '',
  });

  const teamExposure = useMemo(() => {
    return teams.filter(t => t.isWatched).map(team => {
      const teamBets = bets.filter(bet => 
        bet.status === 'pending' && 
        bet.teams?.some(t => t.toLowerCase().includes(team.name.toLowerCase()))
      );
      const totalStake = teamBets.reduce((sum, bet) => sum + bet.amount, 0);
      return {
        ...team,
        activeBets: teamBets.length,
        totalStake,
      };
    });
  }, [teams, bets]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTeam({ ...formData, isWatched: true });
    setFormData({ name: '', competition: '', notes: '' });
    setIsAddDialogOpen(false);
    toast.success(t('common.success'));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">{t('watchlist.title')}</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              {t('watchlist.addTeam')}
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card">
            <DialogHeader>
              <DialogTitle>{t('watchlist.addTeam')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>{t('watchlist.team')}</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>{t('watchlist.competition')}</Label>
                <Input
                  value={formData.competition}
                  onChange={(e) => setFormData({ ...formData, competition: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full">{t('common.save')}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('watchlist.exposure')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('watchlist.team')}</TableHead>
                <TableHead>{t('watchlist.competition')}</TableHead>
                <TableHead>{t('watchlist.activeBets')}</TableHead>
                <TableHead>{t('watchlist.totalStake')}</TableHead>
                <TableHead>{t('watchlist.alerts')}</TableHead>
                <TableHead>{t('bets.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamExposure.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    {t('common.noData')}
                  </TableCell>
                </TableRow>
              ) : (
                teamExposure.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.competition || '-'}</TableCell>
                    <TableCell>{item.activeBets}</TableCell>
                    <TableCell>€{item.totalStake.toFixed(2)}</TableCell>
                    <TableCell>
                      {item.activeBets > 3 && (
                        <Badge variant="destructive">
                          <AlertTriangle className="mr-1 h-3 w-3" />
                          High Exposure
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteTeam(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
