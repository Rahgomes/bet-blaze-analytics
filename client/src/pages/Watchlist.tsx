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

// Mock teams data for demonstration
const generateMockTeams = () => [
  { id: 'mock-team-1', name: 'Bayern Munich', competition: 'Bundesliga', notes: 'Strong home form', isWatched: true, createdAt: new Date().toISOString() },
  { id: 'mock-team-2', name: 'Real Madrid', competition: 'La Liga', notes: 'Champions League favorites', isWatched: true, createdAt: new Date().toISOString() },
  { id: 'mock-team-3', name: 'Paris Saint-Germain', competition: 'Ligue 1', notes: 'High scoring matches', isWatched: true, createdAt: new Date().toISOString() },
  { id: 'mock-team-4', name: 'Manchester City', competition: 'Premier League', notes: 'Excellent away record', isWatched: true, createdAt: new Date().toISOString() },
  { id: 'mock-team-5', name: 'Barcelona', competition: 'La Liga', notes: 'Good value in El Clasico', isWatched: true, createdAt: new Date().toISOString() },
  { id: 'mock-team-6', name: 'Liverpool', competition: 'Premier League', notes: 'Strong at Anfield', isWatched: true, createdAt: new Date().toISOString() },
];

export default function Watchlist() {
  const { t } = useTranslation();
  const { teams: realTeams, addTeam, deleteTeam } = useExtendedData();
  const { bets } = useBettingData();

  // Merge real teams with mock teams for demonstration
  const allTeams = useMemo(() => {
    const mockTeams = realTeams.length === 0 ? generateMockTeams() : [];
    return [...realTeams, ...mockTeams];
  }, [realTeams]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    competition: '',
    notes: '',
  });

  const teamExposure = useMemo(() => {
    return allTeams.filter(t => t.isWatched).map(team => {
      // For mock teams, generate some exposure data
      let teamBets = bets.filter(bet =>
        bet.status === 'pending' &&
        bet.description?.toLowerCase().includes(team.name.toLowerCase())
      );

      // Add mock exposure data for demonstration
      if (team.id.startsWith('mock-team-') && teamBets.length === 0) {
        const mockExposure = [
          { team: 'Bayern Munich', activeBets: 3, totalStake: 150.00 },
          { team: 'Real Madrid', activeBets: 5, totalStake: 275.50 },
          { team: 'Paris Saint-Germain', activeBets: 2, totalStake: 85.00 },
          { team: 'Manchester City', activeBets: 4, totalStake: 200.00 },
          { team: 'Barcelona', activeBets: 1, totalStake: 50.00 },
          { team: 'Liverpool', activeBets: 2, totalStake: 120.00 },
        ];
        const mockData = mockExposure.find(m => m.team === team.name);
        if (mockData) {
          return {
            ...team,
            activeBets: mockData.activeBets,
            totalStake: mockData.totalStake,
          };
        }
      }

      const totalStake = teamBets.reduce((sum, bet) => sum + bet.amount, 0);
      return {
        ...team,
        activeBets: teamBets.length,
        totalStake,
      };
    });
  }, [allTeams, bets]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTeam({ ...formData, isWatched: true });
    setFormData({ name: '', competition: '', notes: '' });
    setIsAddDialogOpen(false);
    toast.success(t('common.success'));
  };

  const handleDelete = (id: string) => {
    if (id.startsWith('mock-team-')) {
      toast.error('Não é possível excluir dados de demonstração. Adicione times reais para gerenciá-los.');
      return;
    }
    if (window.confirm('Tem certeza que deseja remover este time do monitoramento?')) {
      deleteTeam(id);
      toast.success('Time removido com sucesso');
    }
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
                  placeholder="ex: Flamengo, Palmeiras"
                  required
                />
              </div>
              <div>
                <Label>{t('watchlist.competition')}</Label>
                <Input
                  value={formData.competition}
                  onChange={(e) => setFormData({ ...formData, competition: e.target.value })}
                  placeholder="ex: Brasileirão, Libertadores"
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
                    <TableCell>R$ {item.totalStake.toFixed(2)}</TableCell>
                    <TableCell>
                      {item.activeBets > 3 && (
                        <Badge variant="destructive">
                          <AlertTriangle className="mr-1 h-3 w-3" />
                          Alta Exposição
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(item.id)}
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
