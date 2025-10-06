import { Bet, Tip, BetType, BetStatus } from '@/types/betting';

export const generateMockBets = (): Bet[] => {
  const bookmakers = ['Bet365', 'Betano', '1xBet', 'Betway', 'Bwin'];
  const betTypes: BetType[] = ['simple', 'multiple', 'live', 'system'];
  const statuses: BetStatus[] = ['won', 'lost', 'pending', 'void'];
  const descriptions = [
    'Manchester United vs Chelsea - Home Win',
    'Real Madrid vs Barcelona - Over 2.5 Goals',
    'Liverpool vs Arsenal - Both Teams to Score',
    'Bayern Munich vs Dortmund - Asian Handicap -1',
    'PSG vs Lyon - Draw No Bet',
    'Inter Milan vs AC Milan - Double Chance',
    'Atletico Madrid vs Valencia - Under 3.5',
    'Juventus vs Napoli - Match Result',
    'Sevilla vs Real Betis - BTTS Yes',
    'Tottenham vs West Ham - Over 1.5 Goals',
  ];

  const bets: Bet[] = [];
  const today = new Date();

  for (let i = 0; i < 10; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - Math.floor(Math.random() * 60)); // Random date within last 60 days
    
    const amount = Math.round((Math.random() * 50 + 10) * 100) / 100;
    const odds = Math.round((Math.random() * 3 + 1.5) * 100) / 100;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const return_ = status === 'won' ? amount * odds : 0;
    const profit = return_ - amount;

    bets.push({
      id: `mock-${i + 1}`,
      operationNumber: i + 1,
      bookmaker: bookmakers[Math.floor(Math.random() * bookmakers.length)],
      date: date.toISOString(),
      betType: betTypes[Math.floor(Math.random() * betTypes.length)],
      amount,
      odds,
      return: return_,
      profit,
      status,
      description: descriptions[i],
      stakeLogic: i % 3 === 0 ? 'Kelly Criterion - 2% bankroll' : undefined,
      isProtected: i % 4 === 0,
      isLive: i % 5 === 0,
      sourceType: 'manual',
      createdAt: date.toISOString(),
      updatedAt: date.toISOString(),
    });
  }

  return bets.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const generateMockTips = (): Tip[] => {
  const tipsters = ['John ProTips', 'BetMaster', 'SoccerGuru', 'ValueBets', 'SharpLine'];
  const matches = [
    'Chelsea vs Manchester City',
    'Real Madrid vs Atletico Madrid',
    'Barcelona vs Valencia',
    'Liverpool vs Everton',
    'Bayern Munich vs RB Leipzig',
  ];
  const markets = ['Match Result', 'Over/Under 2.5', 'Both Teams to Score', 'Asian Handicap', 'Draw No Bet'];
  
  return Array.from({ length: 5 }, (_, i) => ({
    id: `mock-tip-${i + 1}`,
    tipsterId: `tipster-${(i % 5) + 1}`,
    title: `${matches[i]} Prediction`,
    description: `Strong value bet based on recent form analysis. Home team has won 4 of last 5 matches.`,
    match: matches[i],
    market: markets[i],
    suggestedStake: 20 + (i * 5),
    suggestedOdds: 1.8 + (i * 0.2),
    betType: ['simple', 'simple', 'multiple', 'simple', 'live'][i] as BetType,
    confidence: ['high', 'medium', 'high', 'medium', 'low'][i] as 'low' | 'medium' | 'high',
    status: ['pending', 'pending', 'converted', 'pending', 'archived'][i] as 'pending' | 'converted' | 'archived',
    date: new Date(Date.now() + i * 86400000).toISOString(),
    notes: i % 2 === 0 ? 'Wait for team news before placing' : undefined,
    createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - i * 86400000).toISOString(),
  }));
};
