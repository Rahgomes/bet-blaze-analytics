import { StateCreator } from 'zustand';
import { Team } from '@/types/betting';

export interface TeamsSlice {
  teams: Team[];

  addTeam: (team: Omit<Team, 'id' | 'createdAt'>) => void;
  updateTeam: (id: string, updates: Partial<Team>) => void;
  deleteTeam: (id: string) => void;
  setTeams: (teams: Team[]) => void;
}

const STORAGE_KEY = 'betting_teams';

export const createTeamsSlice: StateCreator<
  TeamsSlice,
  [],
  [],
  TeamsSlice
> = (set, get) => ({
  teams: [],

  addTeam: (teamData) => {
    const newTeam: Team = {
      ...teamData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    const teams = [...get().teams, newTeam];
    set({ teams });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
  },

  updateTeam: (id, updates) => {
    const teams = get().teams.map(team =>
      team.id === id ? { ...team, ...updates } : team
    );
    set({ teams });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
  },

  deleteTeam: (id) => {
    const teams = get().teams.filter(t => t.id !== id);
    set({ teams });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
  },

  setTeams: (teams) => set({ teams }),
});
