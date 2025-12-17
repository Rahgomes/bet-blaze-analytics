import { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from '@/hooks/useTranslation';
import { useBettingStore } from '@/stores/betting';
import { Bet } from '@/types/betting';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Activity,
  Star,
  Eye,
  Clock,
  Table,
} from 'lucide-react';
import { toast } from 'sonner';

// Import new components
import BetDetailModal from '@/components/betting/BetDetailModal';
import LiveGameCard from '@/components/betting/LiveGameCard';
import PendingGamesTable from '@/components/betting/PendingGamesTable';
import ExposureSummaryGrid from '@/components/betting/ExposureSummaryGrid';
import TeamConcentrationCard from '@/components/betting/TeamConcentrationCard';
import ActivePLScenarios from '@/components/betting/ActivePLScenarios';
import MarketDistributionChart from '@/components/betting/MarketDistributionChart';
import TeamRatingFilters from '@/components/betting/TeamRatingFilters';

// Import calculation utilities
import {
  groupLiveBetsByGame,
  getPendingGamesToday,
  calculateExposureMetrics,
  calculatePLScenarios,
} from '@/utils/exposureCalculations';

// Sistema de rating automático
const calculateRating = (winRate: number, avgROI: number, totalBets: number) => {
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

// Mock bets data para demonstração visual
const generateMockBets = (): Bet[] => {
  const now = new Date();
  const mockBets: Bet[] = [];
  let operationNum = 1;

  // 5 Jogos ao vivo
  const liveGames = [
    { home: 'Flamengo', away: 'Palmeiras', league: 'Brasileirão', minutesAgo: 35 },
    { home: 'Real Madrid', away: 'Barcelona', league: 'La Liga', minutesAgo: 52 },
    { home: 'Bayern Munich', away: 'Borussia Dortmund', league: 'Bundesliga', minutesAgo: 18 },
    { home: 'Manchester City', away: 'Liverpool', league: 'Premier League', minutesAgo: 67 },
    { home: 'PSG', away: 'Marseille', league: 'Ligue 1', minutesAgo: 41 },
  ];

  liveGames.forEach((game, idx) => {
    const gameTime = new Date(now.getTime() - game.minutesAgo * 60000);
    // 2-3 apostas por jogo ao vivo
    const betCount = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < betCount; i++) {
      const markets = ['Resultado Final', 'Ambas Marcam', 'Total de Gols', 'Escanteios'];
      const amount = 50 + Math.random() * 100;
      const odds = 1.5 + Math.random() * 2;
      mockBets.push({
        id: `mock-live-${idx}-${i}`,
        operationNumber: operationNum++,
        bookmaker: 'Bet365',
        date: gameTime.toISOString().split('T')[0],
        betType: 'simple',
        matchTime: gameTime.toISOString(),
        teams: [game.home, game.away],
        description: `${game.home} vs ${game.away}`,
        league: game.league,
        market: markets[i % markets.length],
        amount: parseFloat(amount.toFixed(2)),
        odds: parseFloat(odds.toFixed(2)),
        return: parseFloat((amount * odds).toFixed(2)),
        status: 'pending',
        profit: 0,
        createdAt: gameTime.toISOString(),
        updatedAt: gameTime.toISOString(),
      });
    }
  });

  // 10 Jogos pendentes
  const pendingGames = [
    { home: 'Corinthians', away: 'São Paulo', league: 'Brasileirão', hoursAhead: 1.5 },
    { home: 'Internacional', away: 'Grêmio', league: 'Brasileirão', hoursAhead: 2 },
    { home: 'Atlético Madrid', away: 'Sevilla', league: 'La Liga', hoursAhead: 3 },
    { home: 'Chelsea', away: 'Arsenal', league: 'Premier League', hoursAhead: 4 },
    { home: 'Juventus', away: 'Inter Milan', league: 'Serie A', hoursAhead: 5 },
    { home: 'Benfica', away: 'Porto', league: 'Primeira Liga', hoursAhead: 6 },
    { home: 'Ajax', away: 'PSV', league: 'Eredivisie', hoursAhead: 7 },
    { home: 'Napoli', away: 'Roma', league: 'Serie A', hoursAhead: 8 },
    { home: 'Tottenham', away: 'Manchester United', league: 'Premier League', hoursAhead: 9 },
    { home: 'Atlético Mineiro', away: 'Cruzeiro', league: 'Brasileirão', hoursAhead: 10 },
  ];

  pendingGames.forEach((game, idx) => {
    const gameTime = new Date(now.getTime() + game.hoursAhead * 3600000);
    // 1-2 apostas por jogo pendente
    const betCount = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < betCount; i++) {
      const markets = ['Resultado Final', 'Ambas Marcam', 'Total de Gols', 'Handicap Asiático'];
      const amount = 30 + Math.random() * 80;
      const odds = 1.6 + Math.random() * 2.5;
      mockBets.push({
        id: `mock-pending-${idx}-${i}`,
        operationNumber: operationNum++,
        bookmaker: 'Bet365',
        date: gameTime.toISOString().split('T')[0],
        betType: 'simple',
        matchTime: gameTime.toISOString(),
        teams: [game.home, game.away],
        description: `${game.home} vs ${game.away}`,
        league: game.league,
        market: markets[i % markets.length],
        amount: parseFloat(amount.toFixed(2)),
        odds: parseFloat(odds.toFixed(2)),
        return: parseFloat((amount * odds).toFixed(2)),
        status: 'pending',
        profit: 0,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      });
    }
  });

  return mockBets;
};

// Mock teams data para demonstração com dados de performance
// Note: This function needs to be called inside the component to access translations
const generateMockTeamsData = (t: any) => [
  {
    id: 'mock-team-1',
    name: 'Bayern Munich',
    competition: 'Bundesliga',
    notes: t('watchlist.mockNotes.bayernMunich'),
    isWatched: true,
    createdAt: new Date().toISOString(),
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
    notes: t('watchlist.mockNotes.realMadrid'),
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
    notes: t('watchlist.mockNotes.psg'),
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
    notes: t('watchlist.mockNotes.manchesterCity'),
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
    notes: t('watchlist.mockNotes.barcelona'),
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
    notes: t('watchlist.mockNotes.liverpool'),
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
  const realTeams = useBettingStore(state => state.teams);
  const addTeam = useBettingStore(state => state.addTeam);
  const deleteTeam = useBettingStore(state => state.deleteTeam);
  const bets = useBettingStore(state => state.bets);
  const bankroll = useBettingStore(state => state.bankroll);
  const [, setLocation] = useLocation();

  const [activeTab, setActiveTab] = useState('exposure');
  const [selectedBet, setSelectedBet] = useState<Bet | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Filtros de rating de times
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRank, setFilterRank] = useState<string>('all');
  const [filterWinRate, setFilterWinRate] = useState<string>('all');

  // Paginação de times
  const [visibleTeams, setVisibleTeams] = useState(6);

  // Auto-refresh para jogos ao vivo (60 segundos)
  useEffect(() => {
    const liveGames = groupLiveBetsByGame(bets);
    if (liveGames.length === 0) return;

    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 60000); // 60 segundos

    return () => clearInterval(interval);
  }, [bets]);

  // Calcular métricas de exposição ativa
  const activeExposure = useMemo(() => {
    // Se não houver apostas reais, usar mock para visualização
    const mockBets = generateMockBets();
    const allBets = bets.length === 0 ? mockBets : bets;

    const liveGames = groupLiveBetsByGame(allBets);
    const pendingGames = getPendingGamesToday(allBets);
    const metrics = calculateExposureMetrics(allBets, bankroll.currentBankroll || 1000);

    return { liveGames, pendingGames, metrics, usingMockData: bets.length === 0 };
  }, [bets, bankroll.currentBankroll, lastUpdate]);

  // Calcular cenários de P&L
  const plScenarios = useMemo(() => {
    // Usar os mesmos dados que activeExposure
    const mockBets = generateMockBets();
    const allBets = bets.length === 0 ? mockBets : bets;

    const wonBets = allBets.filter(b => b.status === 'won').length;
    const totalFinished = allBets.filter(b => b.status !== 'pending').length;
    // Se usar mock, assumir 55% de win rate histórico
    const historicalWinRate = bets.length === 0 ? 55 : (totalFinished > 0 ? (wonBets / totalFinished) * 100 : 50);

    return {
      scenarios: calculatePLScenarios(allBets, historicalWinRate),
      historicalWinRate,
    };
  }, [bets]);

  // Calcular métricas de performance baseadas no histórico real
  const teamPerformanceMetrics = useMemo(() => {
    const teamStats = new Map();

    bets.forEach(bet => {
      if (!bet.description) return;

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
    const mockTeams = generateMockTeamsData(t);

    const enrichedTeams = mockTeams.map(team => {
      const teamName = team.name.toLowerCase().replace(/\s+/g, ' ');
      const realStats = teamPerformanceMetrics.get(teamName);

      if (realStats) {
        return { ...team, ...realStats };
      }

      return team;
    });

    return [...realTeams, ...enrichedTeams];
  }, [realTeams, teamPerformanceMetrics, t]);

  // Calcular ratings automáticos
  const teamsWithRatings = useMemo(() => {
    return allTeams.map(team => {
      const winRate = team.totalBets ? (team.wins / team.totalBets) * 100 : 0;
      const avgROI = team.totalStake ? (team.totalProfit / team.totalStake) * 100 : 0;
      const rating = calculateRating(winRate, avgROI, team.totalBets || 0);
      const riskLevel = getRiskLevel(rating, team.totalStake || 0);

      // Profitability will be translated in the component
      let profitabilityKey = 'poor';
      if (avgROI > 15) profitabilityKey = 'excellent';
      else if (avgROI > 5) profitabilityKey = 'good';
      else if (avgROI > 0) profitabilityKey = 'regular';

      return {
        ...team,
        winRate,
        avgROI,
        rating,
        riskLevel,
        profitabilityKey
      };
    }).sort((a, b) => {
      const ratingOrder = { 'A++': 5, 'A+': 4, 'A': 3, 'B': 2, 'C': 1 };
      return (ratingOrder[b.rating] || 0) - (ratingOrder[a.rating] || 0);
    });
  }, [allTeams]);

  // Aplicar filtros aos times
  const filteredTeams = useMemo(() => {
    return teamsWithRatings.filter(team => {
      // Filtro por nome
      const matchesSearch = searchTerm === '' ||
        team.name.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro por rank
      const matchesRank = filterRank === 'all' || team.rating === filterRank;

      // Filtro por taxa de acerto
      let matchesWinRate = true;
      if (filterWinRate !== 'all') {
        switch (filterWinRate) {
          case '0-25':
            matchesWinRate = team.winRate >= 0 && team.winRate < 25;
            break;
          case '25-50':
            matchesWinRate = team.winRate >= 25 && team.winRate < 50;
            break;
          case '50-75':
            matchesWinRate = team.winRate >= 50 && team.winRate < 75;
            break;
          case '75-100':
            matchesWinRate = team.winRate >= 75 && team.winRate <= 100;
            break;
        }
      }

      return matchesSearch && matchesRank && matchesWinRate;
    });
  }, [teamsWithRatings, searchTerm, filterRank, filterWinRate]);

  // Paginação - times exibidos
  const displayedTeams = filteredTeams.slice(0, visibleTeams);
  const hasMore = visibleTeams < filteredTeams.length;

  const teamExposure = useMemo(() => {
    return teamsWithRatings.filter(t => t.isWatched).map(team => {
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

  const handleDelete = (id: string) => {
    if (id.startsWith('mock-team-')) {
      toast.error(t('watchlist.cannotDeleteDemo'));
      return;
    }
    if (window.confirm(t('watchlist.confirmRemoveTeam'))) {
      deleteTeam(id);
      toast.success(t('watchlist.teamRemovedSuccess'));
    }
  };

  const handleViewBet = (bet: Bet) => {
    setSelectedBet(bet);
    setModalOpen(true);
  };

  const handleViewTeamHistory = (teamName: string) => {
    // Salvar origem no sessionStorage para exibir botão "Voltar"
    sessionStorage.setItem('betsReturnPath', '/watchlist');
    sessionStorage.setItem('betsReturnLabel', t('watchlist.returnToMonitoring'));

    // Navegar para /bets com query param
    setLocation(`/bets?team=${encodeURIComponent(teamName)}`);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterRank('all');
    setFilterWinRate('all');
    setVisibleTeams(6);
  };

  // Função para obter cor da borda por rank
  const getRatingBorderColor = (rating: string) => {
    switch (rating) {
      case 'A++':
      case 'A+':
      case 'A':
        return 'border-l-green-500';
      case 'B':
        return 'border-l-orange-500';
      case 'C':
        return 'border-l-red-500';
      default:
        return 'border-l-gray-400';
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
    <Card className={`hover:shadow-lg transition-shadow border-l-4 ${getRatingBorderColor(team.rating)}`}>
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
            <div className="text-xs text-muted-foreground">{t('watchlist.winRateLabel')}</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${team.avgROI >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {team.avgROI >= 0 ? '+' : ''}{team.avgROI.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">{t('watchlist.avgRoiLabel')}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">{t('watchlist.totalBetsLabel')}:</span>
            <span className="font-medium ml-1">{team.totalBets || 0}</span>
          </div>
          <div>
            <span className="text-muted-foreground">{t('watchlist.totalProfitLabel')}:</span>
            <span className={`font-medium ml-1 ${(team.totalProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {(team.totalProfit || 0).toFixed(2)}
            </span>
          </div>
        </div>

        {team.notes && (
          <div className="mt-3 p-2 bg-blue-50 rounded text-xs">
            <strong>{t('watchlist.notesLabel')}:</strong> {team.notes}
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => handleViewTeamHistory(team.name)}
          >
            <Eye className="h-3 w-3 mr-1" />
            {t('watchlist.historyButton')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t('watchlist.monitoringCenter')}</h1>
        <p className="text-muted-foreground">{t('watchlist.intelligentAnalysis')}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="exposure" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            {t('watchlist.activeExposure')}
          </TabsTrigger>
          <TabsTrigger value="ratings" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            {t('watchlist.teamRanking')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="exposure" className="space-y-6">
          {/* Resumo de Exposição */}
          <ExposureSummaryGrid
            metrics={activeExposure.metrics}
            currentBankroll={bankroll.currentBankroll}
          />

          {/* Jogos ao Vivo */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      {t('watchlist.liveGames')}
                    </CardTitle>
                    <CardDescription>{t('watchlist.liveGamesDesc')}</CardDescription>
                  </div>
                  {activeExposure.usingMockData && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                      {t('watchlist.demoData')}
                    </Badge>
                  )}
                </div>
                {activeExposure.liveGames.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {t('watchlist.updatedAt')}: {lastUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {activeExposure.liveGames.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">{t('watchlist.noLiveGames')}</p>
              ) : (
                <div className="max-h-[500px] overflow-y-auto space-y-4 pr-2">
                  {activeExposure.liveGames.map((game) => (
                    <LiveGameCard
                      key={game.gameId}
                      game={game}
                      onViewBet={handleViewBet}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Jogos Pendentes */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div>
                  <CardTitle>{t('watchlist.pendingGamesToday')}</CardTitle>
                  <CardDescription>{t('watchlist.pendingGamesDesc')}</CardDescription>
                </div>
                {activeExposure.usingMockData && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                    {t('watchlist.demoData')}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <PendingGamesTable
                games={activeExposure.pendingGames}
                onViewBet={handleViewBet}
              />
            </CardContent>
          </Card>

          {/* Análises Avançadas */}
          <div className="grid gap-6 md:grid-cols-2">
            <TeamConcentrationCard teamExposure={activeExposure.metrics.teamConcentration} />
            <MarketDistributionChart distribution={activeExposure.metrics.marketDistribution} />
          </div>

          {/* Cenários de Resultado - Full Width */}
          <ActivePLScenarios
            scenarios={plScenarios.scenarios}
            historicalWinRate={plScenarios.historicalWinRate}
          />
        </TabsContent>

        <TabsContent value="ratings" className="space-y-6">
          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle>{t('watchlist.filters')}</CardTitle>
            </CardHeader>
            <CardContent>
              <TeamRatingFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filterRank={filterRank}
                setFilterRank={setFilterRank}
                filterWinRate={filterWinRate}
                setFilterWinRate={setFilterWinRate}
                onClearFilters={handleClearFilters}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('watchlist.automaticRankingSystem')}</CardTitle>
              <CardDescription>
                {t('watchlist.rankingBasedOnHistory')}
                {filteredTeams.length !== teamsWithRatings.length && (
                  <span className="ml-2 text-blue-600">
                    {t('watchlist.teamsOfTotal', { count: filteredTeams.length, total: teamsWithRatings.length })}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredTeams.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Star className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>{t('watchlist.noTeamsFound')}</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={handleClearFilters}
                  >
                    {t('watchlist.clearFilters')}
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {displayedTeams.map((team) => (
                      <TeamCard key={team.id} team={team} />
                    ))}
                  </div>

                  {/* Botões de ação */}
                  <div className="flex gap-3 justify-center mt-6">
                    {hasMore && (
                      <Button
                        variant="outline"
                        onClick={() => setVisibleTeams(prev => prev + 3)}
                      >
                        {t('watchlist.loadMoreTeams', { count: filteredTeams.length - visibleTeams })}
                      </Button>
                    )}

                    <Button
                      onClick={() => setLocation('/watchlist/teams')}
                    >
                      <Table className="h-4 w-4 mr-2" />
                      {t('watchlist.viewFullMonitoring')}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Detalhes da Aposta */}
      <BetDetailModal
        bet={selectedBet}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
