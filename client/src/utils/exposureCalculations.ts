import { Bet } from '@/types/betting';

// Interfaces para dados agregados
export interface LiveGame {
  gameId: string;
  match: string;
  matchTime: string;
  league?: string;
  bets: Bet[];
  totalBets: number;
  totalStake: number;
  potentialReturn: number;
  potentialProfit: number;
  markets: string[];
  averageOdds: number;
  elapsedMinutes: number;
}

export interface PendingGame {
  gameId: string;
  match: string;
  matchTime: string;
  league?: string;
  bets: Bet[];
  totalBets: number;
  totalStake: number;
  potentialReturn: number;
  potentialProfit: number;
  markets: string[];
  timeUntilStart: string;
  startsInNextHour: boolean;
}

export interface TeamExposure {
  team: string;
  totalStake: number;
  betCount: number;
  gameCount: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface MarketDistribution {
  market: string;
  totalStake: number;
  betCount: number;
  percentage: number;
}

export interface ExposureMetrics {
  totalActiveStake: number;
  liveGamesCount: number;
  pendingGamesTodayCount: number;
  totalActiveGames: number;
  potentialReturn: number;
  potentialProfit: number;
  averageOdds: number;
  maxSingleGameExposure: number;
  teamConcentration: TeamExposure[];
  marketDistribution: MarketDistribution[];
  nextGameTime: string | null;
  gamesInNextHour: number;
  teamsWithBets: number;
}

/**
 * Verifica se um jogo está acontecendo ao vivo agora
 */
export const isGameLive = (bet: Bet): boolean => {
  if (!bet.matchTime || bet.status !== 'pending') return false;

  const now = new Date();
  const matchTime = new Date(bet.matchTime);
  const timeSinceStart = now.getTime() - matchTime.getTime();

  // Jogo está ao vivo se começou e não passou 2 horas (tempo médio de um jogo)
  const isStarted = timeSinceStart > 0;
  const isNotFinished = timeSinceStart < (2 * 60 * 60 * 1000); // 2 horas

  return isStarted && isNotFinished;
};

/**
 * Calcula quantos minutos se passaram desde o início do jogo
 */
export const calculateElapsedMinutes = (matchTime: string): number => {
  const now = new Date();
  const match = new Date(matchTime);
  const elapsed = (now.getTime() - match.getTime()) / 1000 / 60;
  return Math.max(0, Math.floor(elapsed));
};

/**
 * Calcula quanto tempo falta para o jogo começar (formato amigável)
 */
export const calculateTimeUntilStart = (matchTime: string): string => {
  const now = new Date();
  const match = new Date(matchTime);
  const diff = match.getTime() - now.getTime();

  if (diff < 0) return 'Começou';

  const minutes = Math.floor(diff / 1000 / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `em ${days}d`;
  if (hours > 0) return `em ${hours}h ${minutes % 60}min`;
  return `em ${minutes}min`;
};

/**
 * Agrupa apostas ao vivo por jogo
 */
export const groupLiveBetsByGame = (bets: Bet[]): LiveGame[] => {
  const liveBets = bets.filter(isGameLive);
  const gameMap = new Map<string, Bet[]>();

  liveBets.forEach(bet => {
    // Criar chave única para o jogo
    const teamsKey = bet.teams?.sort().join(' vs ') || bet.description;
    const gameKey = `${bet.matchTime}-${teamsKey}`;

    if (!gameMap.has(gameKey)) {
      gameMap.set(gameKey, []);
    }
    gameMap.get(gameKey)!.push(bet);
  });

  return Array.from(gameMap.entries()).map(([key, gameBets]) => {
    const firstBet = gameBets[0];
    const totalStake = gameBets.reduce((sum, b) => sum + b.amount, 0);
    const potentialReturn = gameBets.reduce((sum, b) => sum + (b.amount * b.odds), 0);
    const markets = [...new Set(gameBets.map(b => b.market).filter(Boolean))] as string[];

    return {
      gameId: key,
      match: firstBet.teams?.join(' vs ') || firstBet.description,
      matchTime: firstBet.matchTime!,
      league: firstBet.league,
      bets: gameBets,
      totalBets: gameBets.length,
      totalStake,
      potentialReturn,
      potentialProfit: potentialReturn - totalStake,
      markets,
      averageOdds: gameBets.reduce((sum, b) => sum + b.odds, 0) / gameBets.length,
      elapsedMinutes: calculateElapsedMinutes(firstBet.matchTime!),
    };
  });
};

/**
 * Filtra e agrupa jogos pendentes de hoje
 */
export const getPendingGamesToday = (bets: Bet[]): PendingGame[] => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const pendingBets = bets.filter(bet => {
    if (bet.status !== 'pending' || !bet.matchTime) return false;
    const matchTime = new Date(bet.matchTime);
    return matchTime >= todayStart && matchTime < todayEnd && !isGameLive(bet);
  });

  const gameMap = new Map<string, Bet[]>();

  pendingBets.forEach(bet => {
    const teamsKey = bet.teams?.sort().join(' vs ') || bet.description;
    const gameKey = `${bet.matchTime}-${teamsKey}`;

    if (!gameMap.has(gameKey)) {
      gameMap.set(gameKey, []);
    }
    gameMap.get(gameKey)!.push(bet);
  });

  return Array.from(gameMap.entries())
    .map(([key, gameBets]) => {
      const firstBet = gameBets[0];
      const totalStake = gameBets.reduce((sum, b) => sum + b.amount, 0);
      const potentialReturn = gameBets.reduce((sum, b) => sum + (b.amount * b.odds), 0);
      const markets = [...new Set(gameBets.map(b => b.market).filter(Boolean))] as string[];
      const matchTime = new Date(firstBet.matchTime!);
      const timeUntil = matchTime.getTime() - now.getTime();

      return {
        gameId: key,
        match: firstBet.teams?.join(' vs ') || firstBet.description,
        matchTime: firstBet.matchTime!,
        league: firstBet.league,
        bets: gameBets,
        totalBets: gameBets.length,
        totalStake,
        potentialReturn,
        potentialProfit: potentialReturn - totalStake,
        markets,
        timeUntilStart: calculateTimeUntilStart(firstBet.matchTime!),
        startsInNextHour: timeUntil > 0 && timeUntil < (60 * 60 * 1000),
      };
    })
    .sort((a, b) => new Date(a.matchTime).getTime() - new Date(b.matchTime).getTime());
};

/**
 * Calcula concentração de stake por time
 */
export const calculateTeamConcentration = (bets: Bet[], currentBankroll: number): TeamExposure[] => {
  const activeBets = bets.filter(b => b.status === 'pending');
  const teamMap = new Map<string, { stake: number; bets: number; games: Set<string> }>();

  activeBets.forEach(bet => {
    const teams = bet.teams || [];
    teams.forEach(team => {
      if (!teamMap.has(team)) {
        teamMap.set(team, { stake: 0, bets: 0, games: new Set() });
      }
      const data = teamMap.get(team)!;
      data.stake += bet.amount;
      data.bets += 1;
      data.games.add(bet.matchTime || bet.date);
    });
  });

  return Array.from(teamMap.entries())
    .map(([team, data]) => {
      const stakePercent = (data.stake / currentBankroll) * 100;
      let riskLevel: 'low' | 'medium' | 'high' = 'low';

      if (stakePercent > 15) riskLevel = 'high';
      else if (stakePercent > 8) riskLevel = 'medium';

      return {
        team,
        totalStake: data.stake,
        betCount: data.bets,
        gameCount: data.games.size,
        riskLevel,
      };
    })
    .sort((a, b) => b.totalStake - a.totalStake);
};

/**
 * Calcula distribuição de stake por mercado
 */
export const calculateMarketDistribution = (bets: Bet[]): MarketDistribution[] => {
  const activeBets = bets.filter(b => b.status === 'pending');
  const marketMap = new Map<string, { stake: number; bets: number }>();

  activeBets.forEach(bet => {
    const market = bet.market || 'Sem mercado';
    if (!marketMap.has(market)) {
      marketMap.set(market, { stake: 0, bets: 0 });
    }
    const data = marketMap.get(market)!;
    data.stake += bet.amount;
    data.bets += 1;
  });

  const totalStake = activeBets.reduce((sum, b) => sum + b.amount, 0);

  return Array.from(marketMap.entries())
    .map(([market, data]) => ({
      market,
      totalStake: data.stake,
      betCount: data.bets,
      percentage: totalStake > 0 ? (data.stake / totalStake) * 100 : 0,
    }))
    .sort((a, b) => b.totalStake - a.totalStake);
};

/**
 * Calcula todas as métricas de exposição
 */
export const calculateExposureMetrics = (
  bets: Bet[],
  currentBankroll: number
): ExposureMetrics => {
  const activeBets = bets.filter(b => b.status === 'pending');
  const liveGames = groupLiveBetsByGame(bets);
  const pendingGames = getPendingGamesToday(bets);

  const totalActiveStake = activeBets.reduce((sum, b) => sum + b.amount, 0);
  const potentialReturn = activeBets.reduce((sum, b) => sum + (b.amount * b.odds), 0);
  const potentialProfit = potentialReturn - totalActiveStake;

  const teamConcentration = calculateTeamConcentration(bets, currentBankroll);
  const marketDistribution = calculateMarketDistribution(bets);

  // Encontrar máxima exposição em um único jogo
  const allGames = [...liveGames, ...pendingGames];
  const maxSingleGameExposure = allGames.length > 0
    ? Math.max(...allGames.map(g => g.totalStake))
    : 0;

  // Próximo jogo e jogos na próxima hora
  const sortedPending = [...pendingGames].sort(
    (a, b) => new Date(a.matchTime).getTime() - new Date(b.matchTime).getTime()
  );
  const nextGameTime = sortedPending[0]?.matchTime || null;
  const gamesInNextHour = pendingGames.filter(g => g.startsInNextHour).length;

  // Contar times únicos com apostas
  const uniqueTeams = new Set<string>();
  activeBets.forEach(bet => {
    bet.teams?.forEach(team => uniqueTeams.add(team));
  });

  return {
    totalActiveStake,
    liveGamesCount: liveGames.length,
    pendingGamesTodayCount: pendingGames.length,
    totalActiveGames: liveGames.length + pendingGames.length,
    potentialReturn,
    potentialProfit,
    averageOdds: activeBets.length > 0
      ? activeBets.reduce((sum, b) => sum + b.odds, 0) / activeBets.length
      : 0,
    maxSingleGameExposure,
    teamConcentration: teamConcentration.slice(0, 10),
    marketDistribution,
    nextGameTime,
    gamesInNextHour,
    teamsWithBets: uniqueTeams.size,
  };
};

/**
 * Calcula cenários de P&L
 */
export interface PLScenarios {
  bestCase: number;
  worstCase: number;
  expectedValue: number;
}

export const calculatePLScenarios = (bets: Bet[], historicalWinRate: number): PLScenarios => {
  const activeBets = bets.filter(b => b.status === 'pending');

  const bestCase = activeBets.reduce((sum, b) => sum + ((b.amount * b.odds) - b.amount), 0);
  const worstCase = -activeBets.reduce((sum, b) => sum + b.amount, 0);

  // Valor esperado baseado na win rate histórica
  const expectedValue = (bestCase * (historicalWinRate / 100)) + (worstCase * (1 - historicalWinRate / 100));

  return {
    bestCase,
    worstCase,
    expectedValue,
  };
};
