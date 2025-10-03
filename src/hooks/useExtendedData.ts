import { useState, useEffect, useCallback } from 'react';
import { Tip, Team, GlossaryEntry, Tipster } from '@/types/betting';

const STORAGE_KEYS = {
  TIPS: 'betting_tips',
  TEAMS: 'betting_teams',
  GLOSSARY: 'betting_glossary',
  TIPSTERS: 'betting_tipsters',
};

const DEFAULT_GLOSSARY: GlossaryEntry[] = [
  { id: '1', term: 'ROI', definition: 'Return on Investment - measures profitability', category: 'general', language: 'en' },
  { id: '2', term: 'DC', definition: 'Double Chance - bet covers two outcomes', category: 'betTypes', language: 'en' },
  { id: '3', term: 'DNB', definition: 'Draw No Bet - stake returned if draw', category: 'betTypes', language: 'en' },
  { id: '4', term: 'BTTS', definition: 'Both Teams To Score', category: 'markets', language: 'en' },
  { id: '5', term: 'ROI', definition: 'Retorno sobre Investimento - mede lucratividade', category: 'general', language: 'pt-br' },
  { id: '6', term: 'DC', definition: 'Dupla Chance - aposta cobre dois resultados', category: 'betTypes', language: 'pt-br' },
  { id: '7', term: 'DNB', definition: 'Empate Anula - stake devolvida em empate', category: 'betTypes', language: 'pt-br' },
  { id: '8', term: 'BTTS', definition: 'Ambos Marcam', category: 'markets', language: 'pt-br' },
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
