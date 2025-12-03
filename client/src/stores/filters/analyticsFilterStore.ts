import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { sessionStorageMiddleware } from '../middleware/sessionStorageMiddleware';

export interface AnalyticsFilterState {
  period: string;
  selectedBookmakers: string[];
  selectedLeagues: string[];
  selectedBetTypes: string[];
  selectedMarkets: string[];
  oddsRange: { min: number; max: number };
  selectedStatuses: string[];
  selectedTeams: string[];
}

export interface AnalyticsFilterActions {
  setPeriod: (period: string) => void;
  setSelectedBookmakers: (bookmakers: string[]) => void;
  setSelectedLeagues: (leagues: string[]) => void;
  setSelectedBetTypes: (types: string[]) => void;
  setSelectedMarkets: (markets: string[]) => void;
  setOddsRange: (range: { min: number; max: number }) => void;
  setSelectedStatuses: (statuses: string[]) => void;
  setSelectedTeams: (teams: string[]) => void;
  clearFilters: () => void;
}

export type AnalyticsFilterStore = AnalyticsFilterState & AnalyticsFilterActions;

const initialState: AnalyticsFilterState = {
  period: '30days',
  selectedBookmakers: [],
  selectedLeagues: [],
  selectedBetTypes: [],
  selectedMarkets: [],
  oddsRange: { min: 1.01, max: 10 },
  selectedStatuses: [],
  selectedTeams: [],
};

export const useAnalyticsFilterStore = create<AnalyticsFilterStore>()(
  devtools(
    sessionStorageMiddleware(
      (set) => ({
        ...initialState,

        setPeriod: (period) => set({ period }),
        setSelectedBookmakers: (selectedBookmakers) => set({ selectedBookmakers }),
        setSelectedLeagues: (selectedLeagues) => set({ selectedLeagues }),
        setSelectedBetTypes: (selectedBetTypes) => set({ selectedBetTypes }),
        setSelectedMarkets: (selectedMarkets) => set({ selectedMarkets }),
        setOddsRange: (oddsRange) => set({ oddsRange }),
        setSelectedStatuses: (selectedStatuses) => set({ selectedStatuses }),
        setSelectedTeams: (selectedTeams) => set({ selectedTeams }),

        clearFilters: () => set(initialState),
      }),
      { name: 'analytics-filters' }
    ),
    { name: 'AnalyticsFilterStore' }
  )
);
