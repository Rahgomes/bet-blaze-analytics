import { useState, useMemo } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useExtendedData } from '@/hooks/useExtendedData';
import { useBettingData } from '@/hooks/useBettingData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  PlusCircle, 
  Trash2, 
  AlertTriangle, 
  Target, 
  TrendingUp, 
  TrendingDown,
  Eye,
  Edit3,
  BarChart3,
  Activity,
  Star,
  Shield,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

// Sistema de rating automático
const calculateRating = (winRate: number, avgROI: number, totalBets: number) => {
  // Ajustar para amostra pequena
  const confidenceFactor = Math.min(totalBets / 10, 1);
  const adjustedWinRate = winRate * confidenceFactor;
  const adjustedROI = avgROI * confidenceFactor;
  
  if (adjustedWinRate >= 75 && adjustedROI >= 15 && totalBets >= 5) return 'A++';
  if (adjustedWinRate >= 65 && adjustedROI >= 10 && totalBets >= 3) return 'A+'; 
  if (adjustedWinRate >= 55 && adjustedROI >= 5) return 'A';
  if (adjustedWinRate >= 45 && adjustedROI >= 0) return 'B';
  return 'C';
};

const getRatingColor = (rating: string) => {
  switch (rating) {
    case 'A++': return 'from-yellow-400 via-yellow-500 to-orange-500';
    case 'A+': return 'from-green-400 to-green-600';
    case 'A': return 'from-blue-400 to-blue-600';
    case 'B': return 'from-yellow-400 to-yellow-600';
    case 'C': return 'from-red-400 to-red-600';
    default: return 'from-gray-400 to-gray-600';
  }
};

const getRiskLevel = (rating: string, totalStake: number) => {
  if (totalStake > 500) return 'high';
  if (rating === 'C' || rating === 'B') return 'medium';
  return 'low';
};

// Mock teams data para demonstração com dados de performance
const generateMockTeams = () => [
  { 
    id: 'mock-team-1', 
    name: 'Bayern Munich', 
    competition: 'Bundesliga', 
    notes: 'Strong home form', 
    isWatched: true, 
    createdAt: new Date().toISOString(),
    // Dados de performance mockados
    totalBets: 12,
    wins: 10,
    totalStake: 240.00,
    totalProfit: 68.50,
    lastBetDate: '2024-11-03'
  },
  { 
    id: 'mock-team-2', 
    name: 'Real Madrid', 
    competition: 'La Liga', 
    notes: 'Champions League favorites', 
    isWatched: true, 
    createdAt: new Date().toISOString(),
    totalBets: 15,
    wins: 13,
    totalStake: 375.00,
    totalProfit: 92.30,
    lastBetDate: '2024-11-04'
  },
  { 
    id: 'mock-team-3', 
    name: 'Paris Saint-Germain', 
    competition: 'Ligue 1', 
    notes: 'High scoring matches', 
    isWatched: true, 
    createdAt: new Date().toISOString(),
    totalBets: 8,
    wins: 4,
    totalStake: 160.00,
    totalProfit: -24.50,
    lastBetDate: '2024-10-28'
  },
  { 
    id: 'mock-team-4', 
    name: 'Manchester City', 
    competition: 'Premier League', 
    notes: 'Excellent away record', 
    isWatched: true, 
    createdAt: new Date().toISOString(),
    totalBets: 18,
    wins: 14,
    totalStake: 450.00,
    totalProfit: 123.75,
    lastBetDate: '2024-11-05'
  },
  { 
    id: 'mock-team-5', 
    name: 'Barcelona', 
    competition: 'La Liga', 
    notes: 'Good value in El Clasico', 
    isWatched: true, 
    createdAt: new Date().toISOString(),
    totalBets: 6,
    wins: 3,
    totalStake: 150.00,
    totalProfit: 12.25,
    lastBetDate: '2024-11-01'
  },
  { 
    id: 'mock-team-6', 
    name: 'Liverpool', 
    competition: 'Premier League', 
    notes: 'Strong at Anfield', 
    isWatched: true, 
    createdAt: new Date().toISOString(),
    totalBets: 20,
    wins: 16,
    totalStake: 500.00,
    totalProfit: 145.80,
    lastBetDate: '2024-11-05'
  },
];

export default function Watchlist() {
  const { t } = useTranslation();
  const { teams: realTeams, addTeam, deleteTeam } = useExtendedData();
  const { bets } = useBettingData();

  const [activeTab, setActiveTab] = useState('exposure');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    competition: '',
    notes: '',
  });

  // Calcular métricas de performance baseadas no histórico real
  const teamPerformanceMetrics = useMemo(() => {
    const teamStats = new Map();
    
    // Processar apostas reais
    bets.forEach(bet => {
      if (!bet.description) return;
      
      // Extrair nome do time da descrição (método simples)
      const description = bet.description.toLowerCase();
      const teams = ['flamengo', 'palmeiras', 'real madrid', 'barcelona', 'bayern', 'manchester city', 'liverpool', 'psg'];
      
      teams.forEach(teamName => {
        if (description.includes(teamName)) {
          if (!teamStats.has(teamName)) {
            teamStats.set(teamName, {
              totalBets: 0,
              wins: 0,
              totalStake: 0,
              totalProfit: 0,
              lastBetDate: bet.date
            });
          }
          
          const stats = teamStats.get(teamName);
          stats.totalBets += 1;
          if (bet.status === 'won') stats.wins += 1;
          stats.totalStake += bet.amount;
          stats.totalProfit += bet.profit || 0;
          if (bet.date > stats.lastBetDate) stats.lastBetDate = bet.date;
        }
      });
    });
    
    return teamStats;
  }, [bets]);

  // Merge real teams with mock teams for demonstration
  const allTeams = useMemo(() => {
    const mockTeams = generateMockTeams();
    
    // Enriquecer com dados reais quando disponíveis
    const enrichedTeams = mockTeams.map(team => {
      const teamName = team.name.toLowerCase().replace(/\s+/g, ' ');
      const realStats = teamPerformanceMetrics.get(teamName);
      
      if (realStats) {
        return { ...team, ...realStats };
      }
      
      return team;
    });
    
    return [...realTeams, ...enrichedTeams];
  }, [realTeams, teamPerformanceMetrics]);

  // Calcular ratings automáticos
  const teamsWithRatings = useMemo(() => {
    return allTeams.map(team => {
      const winRate = team.totalBets ? (team.wins / team.totalBets) * 100 : 0;
      const avgROI = team.totalStake ? (team.totalProfit / team.totalStake) * 100 : 0;
      const rating = calculateRating(winRate, avgROI, team.totalBets || 0);
      const riskLevel = getRiskLevel(rating, team.totalStake || 0);
      
      return {
        ...team,
        winRate,
        avgROI,
        rating,
        riskLevel,
        profitability: avgROI > 15 ? 'Excelente' : avgROI > 5 ? 'Boa' : avgROI > 0 ? 'Regular' : 'Ruim'
      };
    }).sort((a, b) => {
      const ratingOrder = { 'A++': 5, 'A+': 4, 'A': 3, 'B': 2, 'C': 1 };
      return (ratingOrder[b.rating] || 0) - (ratingOrder[a.rating] || 0);
    });
  }, [allTeams]);

  // Tipos para exposição ativa
  interface LiveGame {
    match: string;
    time: string;
    activeBets: number;
    totalStake: number;
    potentialReturn: number;
    riskLevel: string;
    status: string;
  }

  interface PendingGame {
    match: string;
    kickoff: string;
    activeBets: number;
    totalStake: number;
    potentialReturn: number;
    riskLevel: string;
  }

  // Análise de exposição ativa
  const activeExposure = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    
    // Jogos ao vivo mockados (simular jogos em andamento)
    const liveGames: LiveGame[] = [
      {
        match: 'Flamengo vs Palmeiras',
        time: '68 min',
        activeBets: 2,
        totalStake: 125.00,
        potentialReturn: 237.50,
        riskLevel: 'medium',
        status: 'live'
      },
      {
        match: 'Real Madrid vs Barcelona',
        time: '45 min',
        activeBets: 1,
        totalStake: 75.00,
        potentialReturn: 142.50,
        riskLevel: 'low',
        status: 'live'
      }
    ];
    
    // Jogos pendentes (apostas para hoje)
    const pendingBets = bets.filter(bet => 
      bet.status === 'pending' && 
      bet.matchTime && 
      bet.matchTime.startsWith(today)
    );
    
    const pendingGamesMap: { [key: string]: PendingGame } = {};
    
    pendingBets.forEach(bet => {
      const key = bet.description || 'Jogo sem descrição';
      if (!pendingGamesMap[key]) {
        pendingGamesMap[key] = {
          match: key,
          kickoff: bet.matchTime ? new Date(bet.matchTime).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'}) : 'N/A',
          activeBets: 0,
          totalStake: 0,
          potentialReturn: 0,
          riskLevel: 'low'
        };
      }
      
      pendingGamesMap[key].activeBets += 1;
      pendingGamesMap[key].totalStake += bet.amount;
      pendingGamesMap[key].potentialReturn += bet.amount * bet.odds;
      
      // Determinar nível de risco baseado no stake total
      if (pendingGamesMap[key].totalStake > 200) pendingGamesMap[key].riskLevel = 'high';
      else if (pendingGamesMap[key].totalStake > 100) pendingGamesMap[key].riskLevel = 'medium';
    });
    
    const pendingGames = Object.values(pendingGamesMap);
    const totalActiveStake = [...liveGames, ...pendingGames].reduce((sum, game) => sum + game.totalStake, 0);
    
    return {
      liveGames,
      pendingGames,
      totalActiveStake
    };
  }, [bets]);

  // Alertas inteligentes
  const intelligentAlerts = useMemo(() => {
    const alerts = [];
    
    // Alertas de alta exposição
    teamsWithRatings.forEach(team => {
      const activeBets = bets.filter(bet => 
        bet.status === 'pending' && 
        bet.description?.toLowerCase().includes(team.name.toLowerCase())
      ).length;
      
      if (activeBets > 3) {
        alerts.push({
          type: 'high_exposure',
          severity: 'warning',
          message: `${team.name}: ${activeBets} apostas ativas - Considere hedge`,
          team: team.name,
          action: 'suggest_hedge'
        });
      }
      
      if (team.rating === 'C' && activeBets > 0) {
        alerts.push({
          type: 'poor_performance',
          severity: 'danger',
          message: `${team.name}: Rating baixo (${team.rating}) - Evitar novas apostas`,
          team: team.name,
          action: 'avoid_betting'
        });
      }
      
      if (team.rating === 'A++' && team.avgROI > 20) {
        alerts.push({
          type: 'high_value',
          severity: 'success',
          message: `${team.name}: Rating excelente (${team.rating}) - Oportunidade identificada`,
          team: team.name,
          action: 'consider_betting'
        });
      }
    });
    
    return alerts;
  }, [teamsWithRatings, bets]);

  const teamExposure = useMemo(() => {
    return teamsWithRatings.filter(t => t.isWatched).map(team => {
      // Calcular exposição real baseada nas apostas
      let teamBets = bets.filter(bet =>
        bet.status === 'pending' &&
        bet.description?.toLowerCase().includes(team.name.toLowerCase())
      );

      // Add mock exposure data for demonstration if no real bets
      if (team.id.startsWith('mock-team-') && teamBets.length === 0) {
        const mockExposure = [
          { team: 'Bayern Munich', activeBets: 3, totalStake: 150.00, potentialReturn: 285.00 },
          { team: 'Real Madrid', activeBets: 5, totalStake: 275.50, potentialReturn: 523.45 },
          { team: 'Paris Saint-Germain', activeBets: 2, totalStake: 85.00, potentialReturn: 161.50 },
          { team: 'Manchester City', activeBets: 4, totalStake: 200.00, potentialReturn: 380.00 },
          { team: 'Barcelona', activeBets: 1, totalStake: 50.00, potentialReturn: 95.00 },
          { team: 'Liverpool', activeBets: 2, totalStake: 120.00, potentialReturn: 228.00 },
        ];
        const mockData = mockExposure.find(m => m.team === team.name);
        if (mockData) {
          return {
            ...team,
            activeBets: mockData.activeBets,
            totalStake: mockData.totalStake,
            potentialReturn: mockData.potentialReturn,
          };
        }
      }

      const totalStake = teamBets.reduce((sum, bet) => sum + bet.amount, 0);
      const potentialReturn = teamBets.reduce((sum, bet) => sum + (bet.amount * bet.odds), 0);
      
      return {
        ...team,
        activeBets: teamBets.length,
        totalStake,
        potentialReturn,
      };
    });
  }, [teamsWithRatings, bets]);

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

  // Componente de Rating Badge
  const RatingBadge = ({ rating }: { rating: string }) => (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-white font-bold text-sm bg-gradient-to-r ${getRatingColor(rating)}`}>
      {rating}
    </div>
  );

  // Componente de Card de Time
  const TeamCard = ({ team }: { team: any }) => (
    <Card className={`hover:shadow-lg transition-shadow border-l-4 ${
      team.riskLevel === 'high' ? 'border-l-red-500' : 
      team.riskLevel === 'medium' ? 'border-l-yellow-500' : 'border-l-green-500'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{team.name}</CardTitle>
            <CardDescription>{team.competition}</CardDescription>
          </div>
          <RatingBadge rating={team.rating} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{team.winRate.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">Taxa de Acerto</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${team.avgROI >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {team.avgROI >= 0 ? '+' : ''}{team.avgROI.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">ROI Médio</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Total de Apostas:</span>
            <span className="font-medium ml-1">{team.totalBets || 0}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Lucro Total:</span>
            <span className={`font-medium ml-1 ${(team.totalProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {(team.totalProfit || 0).toFixed(2)}
            </span>
          </div>
        </div>

        {team.notes && (
          <div className="mt-3 p-2 bg-blue-50 rounded text-xs">
            <strong>Notas:</strong> {team.notes}
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <Button size="sm" variant="outline" className="flex-1">
            <Edit3 className="h-3 w-3 mr-1" />
            Editar
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            <Eye className="h-3 w-3 mr-1" />
            Histórico
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Central de Monitoramento</h1>
          <p className="text-muted-foreground">Análise inteligente de performance e exposição</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Time
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card">
            <DialogHeader>
              <DialogTitle>Adicionar Time ao Monitoramento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Nome do Time</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ex: Flamengo, Palmeiras"
                  required
                />
              </div>
              <div>
                <Label>Competição</Label>
                <Input
                  value={formData.competition}
                  onChange={(e) => setFormData({ ...formData, competition: e.target.value })}
                  placeholder="ex: Brasileirão, Libertadores"
                />
              </div>
              <div>
                <Label>Notas</Label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Observações sobre o time"
                />
              </div>
              <Button type="submit" className="w-full">Salvar</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="exposure" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Exposição Ativa
          </TabsTrigger>
          <TabsTrigger value="ratings" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Rating de Times
          </TabsTrigger>
          <TabsTrigger value="markets" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Análise Mercados
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Alertas & Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="exposure" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Jogos ao Vivo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  Jogos ao Vivo
                </CardTitle>
                <CardDescription>Apostas em jogos que estão acontecendo agora</CardDescription>
              </CardHeader>
              <CardContent>
                {activeExposure.liveGames.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Nenhum jogo ao vivo no momento</p>
                ) : (
                  <div className="space-y-4">
                    {activeExposure.liveGames.map((game, index) => (
                      <div key={index} className="p-4 border rounded-lg bg-red-50/30 border-red-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{game.match}</h4>
                          <Badge variant="destructive" className="animate-pulse">
                            {game.time}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Apostas:</span>
                            <span className="font-medium ml-1">{game.activeBets}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Stake:</span>
                            <span className="font-medium ml-1">R$ {game.totalStake.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Retorno:</span>
                            <span className="font-medium ml-1 text-green-600">R$ {game.potentialReturn.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Jogos Pendentes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Jogos Pendentes Hoje
                </CardTitle>
                <CardDescription>Apostas para jogos que ainda vão começar</CardDescription>
              </CardHeader>
              <CardContent>
                {activeExposure.pendingGames.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Nenhuma aposta pendente para hoje</p>
                ) : (
                  <div className="space-y-4">
                    {activeExposure.pendingGames.map((game, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{game.match}</h4>
                          <Badge variant="outline">
                            {game.kickoff}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Apostas:</span>
                            <span className="font-medium ml-1">{game.activeBets}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Stake:</span>
                            <span className="font-medium ml-1">R$ {game.totalStake.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Retorno:</span>
                            <span className="font-medium ml-1 text-green-600">R$ {game.potentialReturn.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Resumo de Exposição */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo da Exposição</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    R$ {activeExposure.totalActiveStake.toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">Stake Total Ativo</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {activeExposure.liveGames.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Jogos ao Vivo</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {activeExposure.pendingGames.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Jogos Pendentes</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {teamExposure.filter(t => t.activeBets > 0).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Times com Apostas</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ratings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sistema de Rating Automático</CardTitle>
              <CardDescription>
                Classificação baseada em taxa de acerto e ROI médio do seu histórico
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {teamsWithRatings.map((team) => (
                  <TeamCard key={team.id} team={team} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="markets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Mercados</CardTitle>
              <CardDescription>Performance por tipo de aposta e competição</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-12">
                <BarChart3 className="mx-auto h-12 w-12 mb-4" />
                <p>Análise de mercados em desenvolvimento</p>
                <p className="text-sm">Será implementada com mais dados históricos</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Alertas & Insights Inteligentes</CardTitle>
              <CardDescription>Avisos automáticos baseados na sua performance</CardDescription>
            </CardHeader>
            <CardContent>
              {intelligentAlerts.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                  <Shield className="mx-auto h-12 w-12 mb-4" />
                  <p>Nenhum alerta no momento</p>
                  <p className="text-sm">Tudo sob controle!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {intelligentAlerts.map((alert, index) => (
                    <div 
                      key={index} 
                      className={`p-4 border-l-4 rounded-lg ${
                        alert.severity === 'danger' ? 'border-l-red-500 bg-red-50/50' :
                        alert.severity === 'warning' ? 'border-l-yellow-500 bg-yellow-50/50' :
                        'border-l-green-500 bg-green-50/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {alert.severity === 'danger' && <AlertTriangle className="h-5 w-5 text-red-500" />}
                          {alert.severity === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                          {alert.severity === 'success' && <Zap className="h-5 w-5 text-green-500" />}
                        </div>
                        <div className="flex-grow">
                          <p className="font-medium">{alert.message}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Tipo: {alert.type} • Time: {alert.team}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
