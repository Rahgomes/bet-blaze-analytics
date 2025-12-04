import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { useBettingStore } from '@/stores/betting';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, Activity, Target } from 'lucide-react';
import TeamsFilters from '@/components/betting/TeamsFilters';
import TeamsTable from '@/components/betting/TeamsTable';

export default function WatchlistTeams() {
  const [, setLocation] = useLocation();
  const bets = useBettingStore(state => state.bets);

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRank, setFilterRank] = useState('all');
  const [filterWinRate, setFilterWinRate] = useState('all');
  const [filterROI, setFilterROI] = useState('all');
  const [filterTotalBets, setFilterTotalBets] = useState('all');
  const [filterCompetition, setFilterCompetition] = useState('all');
  const [sortBy, setSortBy] = useState('winRate-desc');

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Sistema de rating
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

  // Calcular estatísticas dos times a partir das apostas
  const teamsStats = useMemo(() => {
    const teamMap = new Map();

    bets.forEach(bet => {
      const teams = bet.teams || [];
      teams.forEach(teamName => {
        if (!teamMap.has(teamName)) {
          teamMap.set(teamName, {
            id: `team-${teamName}`,
            name: teamName,
            competition: bet.league || bet.competition,
            totalBets: 0,
            wins: 0,
            totalStake: 0,
            totalProfit: 0,
            lastBetDate: bet.date,
          });
        }

        const teamData = teamMap.get(teamName);
        teamData.totalBets += 1;
        if (bet.status === 'won') teamData.wins += 1;
        teamData.totalStake += bet.amount;
        teamData.totalProfit += bet.profit || 0;
        if (bet.date > teamData.lastBetDate) {
          teamData.lastBetDate = bet.date;
          teamData.competition = bet.league || bet.competition || teamData.competition;
        }
      });
    });

    return Array.from(teamMap.values()).map(team => {
      const winRate = team.totalBets ? (team.wins / team.totalBets) * 100 : 0;
      const avgROI = team.totalStake ? (team.totalProfit / team.totalStake) * 100 : 0;
      const rating = calculateRating(winRate, avgROI, team.totalBets);

      return {
        ...team,
        winRate,
        avgROI,
        rating,
      };
    });
  }, [bets]);

  // Extrair competições únicas
  const uniqueCompetitions = useMemo(() => {
    const comps = new Set<string>();
    teamsStats.forEach(team => {
      if (team.competition) comps.add(team.competition);
    });
    return Array.from(comps).sort();
  }, [teamsStats]);

  // Aplicar filtros
  const filteredTeams = useMemo(() => {
    return teamsStats.filter(team => {
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

      // Filtro por ROI
      let matchesROI = true;
      if (filterROI !== 'all') {
        switch (filterROI) {
          case 'negative':
            matchesROI = team.avgROI < 0;
            break;
          case '0-10':
            matchesROI = team.avgROI >= 0 && team.avgROI < 10;
            break;
          case '10-25':
            matchesROI = team.avgROI >= 10 && team.avgROI < 25;
            break;
          case '25+':
            matchesROI = team.avgROI >= 25;
            break;
        }
      }

      // Filtro por total de apostas
      let matchesTotalBets = true;
      if (filterTotalBets !== 'all') {
        switch (filterTotalBets) {
          case '1-5':
            matchesTotalBets = team.totalBets >= 1 && team.totalBets <= 5;
            break;
          case '6-10':
            matchesTotalBets = team.totalBets >= 6 && team.totalBets <= 10;
            break;
          case '11-20':
            matchesTotalBets = team.totalBets >= 11 && team.totalBets <= 20;
            break;
          case '20+':
            matchesTotalBets = team.totalBets > 20;
            break;
        }
      }

      // Filtro por competição
      const matchesCompetition = filterCompetition === 'all' ||
        team.competition === filterCompetition;

      return matchesSearch && matchesRank && matchesWinRate && matchesROI &&
             matchesTotalBets && matchesCompetition;
    });
  }, [teamsStats, searchTerm, filterRank, filterWinRate, filterROI, filterTotalBets, filterCompetition]);

  // Aplicar ordenação
  const sortedTeams = useMemo(() => {
    const sorted = [...filteredTeams];

    sorted.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'winRate-desc':
          comparison = b.winRate - a.winRate;
          break;
        case 'winRate-asc':
          comparison = a.winRate - b.winRate;
          break;
        case 'roi-desc':
          comparison = b.avgROI - a.avgROI;
          break;
        case 'roi-asc':
          comparison = a.avgROI - b.avgROI;
          break;
        case 'totalBets-desc':
          comparison = b.totalBets - a.totalBets;
          break;
        case 'totalBets-asc':
          comparison = a.totalBets - b.totalBets;
          break;
        case 'lastBet-desc':
          comparison = new Date(b.lastBetDate).getTime() - new Date(a.lastBetDate).getTime();
          break;
        case 'lastBet-asc':
          comparison = new Date(a.lastBetDate).getTime() - new Date(b.lastBetDate).getTime();
          break;
      }

      return comparison;
    });

    return sorted;
  }, [filteredTeams, sortBy]);

  // Paginação
  const totalPages = Math.ceil(sortedTeams.length / itemsPerPage);
  const paginatedTeams = sortedTeams.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calcular estatísticas resumidas
  const totalTeams = sortedTeams.length;
  const avgWinRate = totalTeams > 0
    ? sortedTeams.reduce((sum, t) => sum + t.winRate, 0) / totalTeams
    : 0;
  const totalProfit = sortedTeams.reduce((sum, t) => sum + t.totalProfit, 0);
  const totalBetsCount = sortedTeams.reduce((sum, t) => sum + t.totalBets, 0);

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterRank('all');
    setFilterWinRate('all');
    setFilterROI('all');
    setFilterTotalBets('all');
    setFilterCompetition('all');
    setSortBy('winRate-desc');
    setCurrentPage(1);
  };

  const handleViewHistory = (teamName: string) => {
    sessionStorage.setItem('betsReturnPath', '/watchlist/teams');
    sessionStorage.setItem('betsReturnLabel', 'Voltar ao Monitoramento');
    setLocation(`/bets?team=${encodeURIComponent(teamName)}`);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1); // Reset to first page
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header com botão voltar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Monitoramento Completo de Times</h1>
          <p className="text-muted-foreground">Análise detalhada de performance por time</p>
        </div>
        <Button variant="outline" onClick={() => setLocation('/watchlist')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              Total de Times
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTeams}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Taxa de Acerto Média
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{avgWinRate.toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-purple-600" />
              Lucro Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalProfit >= 0 ? '+' : ''}R$ {totalProfit.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Apostas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBetsCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <TeamsFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterRank={filterRank}
            setFilterRank={setFilterRank}
            filterWinRate={filterWinRate}
            setFilterWinRate={setFilterWinRate}
            filterROI={filterROI}
            setFilterROI={setFilterROI}
            filterTotalBets={filterTotalBets}
            setFilterTotalBets={setFilterTotalBets}
            filterCompetition={filterCompetition}
            setFilterCompetition={setFilterCompetition}
            sortBy={sortBy}
            setSortBy={setSortBy}
            onClearFilters={handleClearFilters}
            competitions={uniqueCompetitions}
          />
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Times Monitorados ({sortedTeams.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <TeamsTable
            teams={paginatedTeams}
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={sortedTeams.length}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={handleItemsPerPageChange}
            onViewHistory={handleViewHistory}
          />
        </CardContent>
      </Card>
    </div>
  );
}
