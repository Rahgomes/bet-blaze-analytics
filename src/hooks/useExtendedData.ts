import { useState, useEffect, useCallback } from 'react';
import { Tip, Team, GlossaryEntry, Tipster } from '@/types/betting';

const STORAGE_KEYS = {
  TIPS: 'betting_tips',
  TEAMS: 'betting_teams',
  GLOSSARY: 'betting_glossary',
  TIPSTERS: 'betting_tipsters',
};

const DEFAULT_GLOSSARY: GlossaryEntry[] = [
  // ENGLISH - General
  { id: '1', term: 'ROI', definition: 'Return on Investment - Percentage that measures overall profitability of your betting activity. Calculated as (Total Profit / Total Stake) × 100.', category: 'general', language: 'en' },
  { id: '2', term: 'Bankroll', definition: 'The total amount of money dedicated exclusively to betting. Should be money you can afford to lose.', category: 'general', language: 'en' },
  { id: '3', term: 'Stake', definition: 'The amount of money placed on a single bet. Usually expressed as a percentage of your total bankroll.', category: 'general', language: 'en' },
  { id: '4', term: 'Odds', definition: 'The numerical representation of probability and potential payout. Higher odds mean lower probability but higher potential return.', category: 'general', language: 'en' },
  { id: '5', term: 'Value Bet', definition: 'A bet where the odds offered are higher than the true probability of the outcome, giving you an edge over the bookmaker.', category: 'general', language: 'en' },
  { id: '6', term: 'Edge', definition: 'Your advantage over the bookmaker. The difference between true probability and bookmaker\'s implied probability.', category: 'general', language: 'en' },
  { id: '7', term: 'Variance', definition: 'Statistical measure of short-term unpredictability in betting results. High variance means more swings in your bankroll.', category: 'general', language: 'en' },
  { id: '8', term: 'Expected Value (EV)', definition: 'The average amount you can expect to win or lose per bet over the long run. Positive EV means profitable over time.', category: 'general', language: 'en' },
  
  // ENGLISH - Bet Types
  { id: '9', term: 'Single Bet', definition: 'A bet on one selection only. The simplest form of betting where you wager on a single outcome.', category: 'betTypes', language: 'en' },
  { id: '10', term: 'Multiple / Accumulator', definition: 'A bet combining multiple selections. All selections must win for the bet to pay out. Odds are multiplied together.', category: 'betTypes', language: 'en' },
  { id: '11', term: 'DC (Double Chance)', definition: 'A bet covering two of three possible outcomes in a match (e.g., Home Win or Draw). Reduces risk but lowers odds.', category: 'betTypes', language: 'en' },
  { id: '12', term: 'DNB (Draw No Bet)', definition: 'Bet on team to win. If the match ends in a draw, your stake is returned. No loss, no win.', category: 'betTypes', language: 'en' },
  { id: '13', term: 'System Bet', definition: 'Multiple combinations of accumulators within one bet. Some selections can lose and you still get a return.', category: 'betTypes', language: 'en' },
  { id: '14', term: 'Each Way', definition: 'Two bets in one: one for the selection to win, one for it to place (finish in top positions). Common in racing.', category: 'betTypes', language: 'en' },
  { id: '15', term: 'Live / In-Play Bet', definition: 'Betting on an event while it is happening. Odds change dynamically based on what\'s occurring in the game.', category: 'betTypes', language: 'en' },
  
  // ENGLISH - Markets
  { id: '16', term: 'ML (Moneyline)', definition: 'Straight bet on which team/player will win the match. No handicaps or spreads involved. Common in American sports.', category: 'markets', language: 'en' },
  { id: '17', term: '1X2', definition: 'Three-way market: 1 (Home Win), X (Draw), 2 (Away Win). Most common market in football betting.', category: 'markets', language: 'en' },
  { id: '18', term: 'Over/Under (O/U)', definition: 'Bet on whether total goals/points will be over or under a specified number (e.g., Over 2.5 goals means 3+ goals needed).', category: 'markets', language: 'en' },
  { id: '19', term: 'BTTS (Both Teams To Score)', definition: 'Bet on whether both teams will score at least one goal each during the match. Yes or No options.', category: 'markets', language: 'en' },
  { id: '20', term: 'Asian Handicap', definition: 'Handicap betting that eliminates the draw option. Can include quarter-goal handicaps (e.g., -0.25, -0.75) for split outcomes.', category: 'markets', language: 'en' },
  { id: '21', term: 'European Handicap', definition: 'Handicap betting with three possible outcomes including draw. Team starts with virtual goal advantage/disadvantage.', category: 'markets', language: 'en' },
  { id: '22', term: 'Correct Score', definition: 'Bet on the exact final score of a match. High odds due to difficulty, but very specific prediction required.', category: 'markets', language: 'en' },
  { id: '23', term: 'HT/FT (Half Time / Full Time)', definition: 'Predict the result at both half-time and full-time (e.g., Draw/Home means draw at HT, home win at FT).', category: 'markets', language: 'en' },
  { id: '24', term: 'Total Corners', definition: 'Bet on the total number of corner kicks in a match, similar to Over/Under for goals.', category: 'markets', language: 'en' },
  { id: '25', term: 'First Goalscorer', definition: 'Bet on which player will score the first goal in the match. Popular in football betting.', category: 'markets', language: 'en' },
  
  // ENGLISH - Strategies
  { id: '26', term: 'Flat Betting', definition: 'Staking the same amount on every bet, regardless of confidence or odds. Simple and reduces risk of ruin.', category: 'strategies', language: 'en' },
  { id: '27', term: 'Percentage Staking', definition: 'Betting a fixed percentage of your current bankroll on each bet (e.g., 2%). Adjusts stake as bankroll grows/shrinks.', category: 'strategies', language: 'en' },
  { id: '28', term: 'Kelly Criterion', definition: 'Mathematical formula to calculate optimal stake size based on your edge and odds. Maximizes long-term growth.', category: 'strategies', language: 'en' },
  { id: '29', term: 'Martingale', definition: 'Doubling your stake after each loss to recover losses. Very risky - can quickly deplete bankroll during losing streaks.', category: 'strategies', language: 'en' },
  { id: '30', term: 'Fibonacci System', definition: 'Progressive staking following Fibonacci sequence. Increase stakes based on sequence after losses, less aggressive than Martingale.', category: 'strategies', language: 'en' },
  { id: '31', term: 'Arbitrage Betting', definition: 'Placing bets on all outcomes across different bookmakers to guarantee profit regardless of result. Requires odds discrepancies.', category: 'strategies', language: 'en' },
  { id: '32', term: 'Hedging', definition: 'Placing bets on opposite outcomes to lock in profit or minimize loss, often done when first bet is looking good.', category: 'strategies', language: 'en' },
  { id: '33', term: 'Matched Betting', definition: 'Using free bets and promotions from bookmakers with lay bets on exchanges to guarantee profit. Risk-free method.', category: 'strategies', language: 'en' },
  { id: '34', term: 'Stop Loss', definition: 'Predetermined limit on losses per day/week/month. Once reached, you stop betting to protect bankroll.', category: 'strategies', language: 'en' },
  { id: '35', term: 'Stop Gain', definition: 'Predetermined profit target. Once reached, you stop betting to lock in profits and avoid giving them back.', category: 'strategies', language: 'en' },
  
  // PORTUGUESE-BR - Geral
  { id: '51', term: 'ROI', definition: 'Retorno sobre Investimento - Porcentagem que mede a lucratividade geral de sua atividade de apostas. Calculado como (Lucro Total / Stake Total) × 100.', category: 'general', language: 'pt-br' },
  { id: '52', term: 'Banca', definition: 'Quantia total de dinheiro dedicada exclusivamente para apostas. Deve ser dinheiro que você pode perder.', category: 'general', language: 'pt-br' },
  { id: '53', term: 'Stake', definition: 'Valor apostado em uma única aposta. Geralmente expresso como porcentagem de sua banca total.', category: 'general', language: 'pt-br' },
  { id: '54', term: 'Odd', definition: 'Representação numérica da probabilidade e retorno potencial. Odds mais altas significam menor probabilidade mas maior retorno potencial.', category: 'general', language: 'pt-br' },
  { id: '55', term: 'Value Bet', definition: 'Aposta onde as odds oferecidas são maiores que a probabilidade real do resultado, dando vantagem sobre a casa.', category: 'general', language: 'pt-br' },
  { id: '56', term: 'Edge', definition: 'Sua vantagem sobre a casa de apostas. A diferença entre probabilidade real e probabilidade implícita da casa.', category: 'general', language: 'pt-br' },
  { id: '57', term: 'Variância', definition: 'Medida estatística de imprevisibilidade de curto prazo nos resultados. Alta variância significa mais oscilações na banca.', category: 'general', language: 'pt-br' },
  { id: '58', term: 'Valor Esperado (EV)', definition: 'Valor médio que você pode esperar ganhar ou perder por aposta no longo prazo. EV positivo significa lucrativo ao longo do tempo.', category: 'general', language: 'pt-br' },
  
  // PORTUGUESE-BR - Tipos de Aposta
  { id: '59', term: 'Aposta Simples', definition: 'Aposta em apenas uma seleção. A forma mais simples de apostar onde você aposta em um único resultado.', category: 'betTypes', language: 'pt-br' },
  { id: '60', term: 'Múltipla / Acumulada', definition: 'Aposta combinando múltiplas seleções. Todas as seleções devem ganhar para a aposta pagar. As odds são multiplicadas.', category: 'betTypes', language: 'pt-br' },
  { id: '61', term: 'DC (Dupla Chance)', definition: 'Aposta cobrindo dois dos três resultados possíveis em uma partida (ex: Vitória Casa ou Empate). Reduz risco mas diminui odds.', category: 'betTypes', language: 'pt-br' },
  { id: '62', term: 'DNB (Empate Anula)', definition: 'Aposta na vitória de um time. Se a partida terminar empatada, sua stake é devolvida. Sem perda, sem ganho.', category: 'betTypes', language: 'pt-br' },
  { id: '63', term: 'Aposta Sistema', definition: 'Múltiplas combinações de acumuladas em uma aposta. Algumas seleções podem perder e você ainda recebe retorno.', category: 'betTypes', language: 'pt-br' },
  { id: '64', term: 'Each Way', definition: 'Duas apostas em uma: uma para vitória, outra para colocação (terminar nas primeiras posições). Comum em corridas.', category: 'betTypes', language: 'pt-br' },
  { id: '65', term: 'Aposta Ao Vivo', definition: 'Apostar em um evento enquanto está acontecendo. Odds mudam dinamicamente baseado no que ocorre no jogo.', category: 'betTypes', language: 'pt-br' },
  
  // PORTUGUESE-BR - Mercados
  { id: '66', term: 'ML (Moneyline)', definition: 'Aposta direta em qual time/jogador vencerá a partida. Sem handicaps ou spreads. Comum em esportes americanos.', category: 'markets', language: 'pt-br' },
  { id: '67', term: '1X2', definition: 'Mercado três vias: 1 (Vitória Casa), X (Empate), 2 (Vitória Fora). Mercado mais comum em apostas de futebol.', category: 'markets', language: 'pt-br' },
  { id: '68', term: 'Over/Under (Acima/Abaixo)', definition: 'Aposta se total de gols/pontos será acima ou abaixo de número especificado (ex: Acima 2.5 gols precisa 3+ gols).', category: 'markets', language: 'pt-br' },
  { id: '69', term: 'BTTS (Ambos Marcam)', definition: 'Aposta se ambos os times marcarão pelo menos um gol durante a partida. Opções Sim ou Não.', category: 'markets', language: 'pt-br' },
  { id: '70', term: 'Handicap Asiático', definition: 'Aposta com handicap que elimina opção de empate. Pode incluir handicaps de quarto de gol (ex: -0.25, -0.75) para resultados divididos.', category: 'markets', language: 'pt-br' },
  { id: '71', term: 'Handicap Europeu', definition: 'Aposta com handicap incluindo três resultados possíveis com empate. Time começa com vantagem/desvantagem virtual de gols.', category: 'markets', language: 'pt-br' },
  { id: '72', term: 'Placar Correto', definition: 'Aposta no placar final exato da partida. Odds altas devido dificuldade, mas previsão muito específica necessária.', category: 'markets', language: 'pt-br' },
  { id: '73', term: 'Intervalo/Final', definition: 'Prever resultado no intervalo e tempo final (ex: Empate/Casa significa empate no intervalo, vitória casa no final).', category: 'markets', language: 'pt-br' },
  { id: '74', term: 'Total de Escanteios', definition: 'Aposta no número total de escanteios na partida, similar a Over/Under para gols.', category: 'markets', language: 'pt-br' },
  { id: '75', term: 'Primeiro Goleador', definition: 'Aposta em qual jogador marcará o primeiro gol da partida. Popular em apostas de futebol.', category: 'markets', language: 'pt-br' },
  
  // PORTUGUESE-BR - Estratégias
  { id: '76', term: 'Flat Betting', definition: 'Apostar o mesmo valor em todas as apostas, independente de confiança ou odds. Simples e reduz risco de ruína.', category: 'strategies', language: 'pt-br' },
  { id: '77', term: 'Stake Percentual', definition: 'Apostar porcentagem fixa de sua banca atual em cada aposta (ex: 2%). Ajusta stake conforme banca cresce/diminui.', category: 'strategies', language: 'pt-br' },
  { id: '78', term: 'Critério de Kelly', definition: 'Fórmula matemática para calcular tamanho ótimo de stake baseado em sua vantagem e odds. Maximiza crescimento a longo prazo.', category: 'strategies', language: 'pt-br' },
  { id: '79', term: 'Martingale', definition: 'Dobrar sua stake após cada perda para recuperar perdas. Muito arriscado - pode esgotar banca rapidamente em sequências perdedoras.', category: 'strategies', language: 'pt-br' },
  { id: '80', term: 'Sistema Fibonacci', definition: 'Staking progressivo seguindo sequência Fibonacci. Aumentar stakes baseado na sequência após perdas, menos agressivo que Martingale.', category: 'strategies', language: 'pt-br' },
  { id: '81', term: 'Arbitragem', definition: 'Fazer apostas em todos os resultados através de diferentes casas para garantir lucro independente do resultado. Requer discrepâncias nas odds.', category: 'strategies', language: 'pt-br' },
  { id: '82', term: 'Hedge', definition: 'Fazer apostas em resultados opostos para garantir lucro ou minimizar perda, frequentemente feito quando primeira aposta está indo bem.', category: 'strategies', language: 'pt-br' },
  { id: '83', term: 'Matched Betting', definition: 'Usar apostas grátis e promoções de casas com apostas lay em exchanges para garantir lucro. Método sem risco.', category: 'strategies', language: 'pt-br' },
  { id: '84', term: 'Stop Loss', definition: 'Limite predeterminado de perdas por dia/semana/mês. Uma vez atingido, você para de apostar para proteger banca.', category: 'strategies', language: 'pt-br' },
  { id: '85', term: 'Stop Gain', definition: 'Meta de lucro predeterminada. Uma vez atingida, você para de apostar para garantir lucros e evitar devolvê-los.', category: 'strategies', language: 'pt-br' },
];

const DEFAULT_TIPSTERS: Tipster[] = [
  { id: '1', name: 'ProTipster', bio: 'Professional sports analyst', rating: 4.5, totalTips: 120, successRate: 68, createdAt: new Date().toISOString() },
  { id: '2', name: 'BetGuru', bio: 'Expert in football betting', rating: 4.2, totalTips: 95, successRate: 65, createdAt: new Date().toISOString() },
];

export function useExtendedData() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [glossary, setGlossary] = useState<GlossaryEntry[]>(DEFAULT_GLOSSARY);
  const [tipsters, setTipsters] = useState<Tipster[]>(DEFAULT_TIPSTERS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedTips = localStorage.getItem(STORAGE_KEYS.TIPS);
      const storedTeams = localStorage.getItem(STORAGE_KEYS.TEAMS);
      const storedGlossary = localStorage.getItem(STORAGE_KEYS.GLOSSARY);
      const storedTipsters = localStorage.getItem(STORAGE_KEYS.TIPSTERS);

      if (storedTips) setTips(JSON.parse(storedTips));
      if (storedTeams) setTeams(JSON.parse(storedTeams));
      if (storedGlossary) setGlossary(JSON.parse(storedGlossary));
      if (storedTipsters) setTipsters(JSON.parse(storedTipsters));
    } catch (error) {
      console.error('Error loading extended data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveTips = useCallback((newTips: Tip[]) => {
    setTips(newTips);
    localStorage.setItem(STORAGE_KEYS.TIPS, JSON.stringify(newTips));
  }, []);

  const saveTeams = useCallback((newTeams: Team[]) => {
    setTeams(newTeams);
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(newTeams));
  }, []);

  const addTip = useCallback((tip: Omit<Tip, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTip: Tip = {
      ...tip,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveTips([...tips, newTip]);
  }, [tips, saveTips]);

  const updateTip = useCallback((id: string, updates: Partial<Tip>) => {
    const updatedTips = tips.map(tip =>
      tip.id === id ? { ...tip, ...updates, updatedAt: new Date().toISOString() } : tip
    );
    saveTips(updatedTips);
  }, [tips, saveTips]);

  const deleteTip = useCallback((id: string) => {
    saveTips(tips.filter(t => t.id !== id));
  }, [tips, saveTips]);

  const addTeam = useCallback((team: Omit<Team, 'id' | 'createdAt'>) => {
    const newTeam: Team = {
      ...team,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    saveTeams([...teams, newTeam]);
  }, [teams, saveTeams]);

  const updateTeam = useCallback((id: string, updates: Partial<Team>) => {
    const updatedTeams = teams.map(team =>
      team.id === id ? { ...team, ...updates } : team
    );
    saveTeams(updatedTeams);
  }, [teams, saveTeams]);

  const deleteTeam = useCallback((id: string) => {
    saveTeams(teams.filter(t => t.id !== id));
  }, [teams, saveTeams]);

  const saveTipsters = useCallback((newTipsters: Tipster[]) => {
    setTipsters(newTipsters);
    localStorage.setItem(STORAGE_KEYS.TIPSTERS, JSON.stringify(newTipsters));
  }, []);

  const addTipster = useCallback((tipster: Omit<Tipster, 'id' | 'createdAt'>) => {
    const newTipster: Tipster = {
      ...tipster,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    saveTipsters([...tipsters, newTipster]);
  }, [tipsters, saveTipsters]);

  return {
    tips,
    teams,
    glossary,
    tipsters,
    loading,
    addTip,
    updateTip,
    deleteTip,
    addTeam,
    updateTeam,
    deleteTeam,
    addTipster,
  };
}
