import { Bet, Tip } from '@/types/betting';

export function generateMockBets(): Bet[] {
  const mockBets: Bet[] = [];
  const bookmakers = ['Bet365', '1xBet', 'Betfair', 'Betano'];
  const betTypes = ['simple', 'multiple', 'live', 'system'];
  const statuses = ['won', 'lost', 'pending', 'void'];
  const leagues = ['Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1', 'Champions League'];
  const markets = ['Match Winner', 'Over/Under 2.5', 'BTTS', 'Asian Handicap', 'Double Chance'];
  const strategiesList = ['DC', 'DNB', 'Asian Handicap', 'Kelly Criterion', 'Martingale'];
  const descriptions = [
    'Arsenal vs Chelsea - Over 2.5 goals',
    'Manchester United Win',
    'Liverpool vs City - BTTS',
    'Real Madrid -1.5 Handicap',
    'PSG Win & Over 1.5'
  ];

  for (let i = 0; i < 15; i++) {
    const bookmaker = bookmakers[Math.floor(Math.random() * bookmakers.length)];
    const betType = betTypes[Math.floor(Math.random() * betTypes.length)] as any;
    const status = statuses[Math.floor(Math.random() * statuses.length)] as any;
    const amount = 10 + Math.random() * 90;
    const odds = 1.5 + Math.random() * 3.5;
    const description = descriptions[Math.floor(Math.random() * descriptions.length)];
    const league = leagues[Math.floor(Math.random() * leagues.length)];
    const market = markets[Math.floor(Math.random() * markets.length)];
    
    // Random strategies (0-3 strategies per bet)
    const numStrategies = Math.floor(Math.random() * 4);
    const strategies = Array.from({ length: numStrategies }, () => 
      strategiesList[Math.floor(Math.random() * strategiesList.length)]
    );
    
    const daysAgo = Math.floor(Math.random() * 60);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    
    // Some bets are today with specific match times
    const isToday = Math.random() > 0.7;
    if (isToday) {
      date.setDate(new Date().getDate());
    }
    
    const hours = Math.floor(Math.random() * 24);
    const minutes = Math.floor(Math.random() * 60);
    const matchTime = `${date.toISOString().split('T')[0]}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
    
    let return_ = 0;
    let profit = -amount;
    
    if (status === 'won') {
      return_ = amount * odds;
      profit = return_ - amount;
    } else if (status === 'void') {
      return_ = amount;
      profit = 0;
    }

    mockBets.push({
      id: `mock-bet-${i}`,
      operationNumber: 1000 + i,
      bookmaker,
      date: date.toISOString().split('T')[0],
      betType,
      amount,
      odds,
      return: return_,
      profit,
      status,
      description,
      league,
      market,
      strategies: strategies.length > 0 ? strategies : undefined,
      matchTime,
      stakeLogic: Math.random() > 0.5 ? 'Kelly Criterion' : 'Fixed',
      isProtected: Math.random() > 0.5,
      isLive: isToday && status === 'pending' && Math.random() > 0.5,
      sourceType: 'manual',
      createdAt: date.toISOString(),
      updatedAt: date.toISOString(),
    });
  }

  return mockBets.sort((a, b) => 
    new Date(b.matchTime || b.date).getTime() - new Date(a.matchTime || a.date).getTime()
  );
}

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
    betType: ['simple', 'simple', 'multiple', 'simple', 'live'][i] as any,
    confidence: ['high', 'medium', 'high', 'medium', 'low'][i] as 'low' | 'medium' | 'high',
    status: ['pending', 'pending', 'converted', 'pending', 'archived'][i] as 'pending' | 'converted' | 'archived',
    date: new Date(Date.now() + i * 86400000).toISOString(),
    notes: i % 2 === 0 ? 'Wait for team news before placing' : undefined,
    createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - i * 86400000).toISOString(),
  }));
};
