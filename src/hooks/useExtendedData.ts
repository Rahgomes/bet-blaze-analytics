import { useState, useEffect, useCallback } from 'react';
import { Tip, Team, GlossaryEntry } from '@/types/betting';

const STORAGE_KEYS = {
  TIPS: 'betting_tips',
  TEAMS: 'betting_teams',
  GLOSSARY: 'betting_glossary',
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

export function useExtendedData() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [glossary, setGlossary] = useState<GlossaryEntry[]>(DEFAULT_GLOSSARY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedTips = localStorage.getItem(STORAGE_KEYS.TIPS);
      const storedTeams = localStorage.getItem(STORAGE_KEYS.TEAMS);
      const storedGlossary = localStorage.getItem(STORAGE_KEYS.GLOSSARY);

      if (storedTips) setTips(JSON.parse(storedTips));
      if (storedTeams) setTeams(JSON.parse(storedTeams));
      if (storedGlossary) setGlossary(JSON.parse(storedGlossary));
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

  return {
    tips,
    teams,
    glossary,
    loading,
    addTip,
    updateTip,
    deleteTip,
    addTeam,
    updateTeam,
    deleteTeam,
  };
}
