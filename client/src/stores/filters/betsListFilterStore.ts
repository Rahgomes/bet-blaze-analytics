import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { sessionStorageMiddleware } from '../middleware/sessionStorageMiddleware';

export type PeriodFilter = 'today-games' | 'week-games' | 'month-games' | 'last-10' | 'last-20' | 'last-50' | 'last-100' | 'custom' | 'all';

export interface BetsListFilterState {
  // Filtros básicos
  searchTerm: string;
  filterBookmaker: string;
  filterType: string;
  filterStatus: string;
  filterPeriod: PeriodFilter;
  filterProfit: string;
  filterTeam: string;

  // Filtros de range
  oddsRange: { min: number; max: number };
  amountRange: { min: number; max: number };

  // Filtros por características especiais
  filterHasBoost: boolean;
  filterHasCashout: boolean;
  filterUsedCredits: boolean;
  filterIsProtected: boolean;

  // Ordenação
  sortColumn: string;
  sortDirection: 'asc' | 'desc';

  // Paginação
  currentPage: number;
  itemsPerPage: number;

  // Filtros avançados (toggle)
  showAdvancedFilters: boolean;
}

export interface BetsListFilterActions {
  // Setters básicos
  setSearchTerm: (term: string) => void;
  setFilterBookmaker: (bookmaker: string) => void;
  setFilterType: (type: string) => void;
  setFilterStatus: (status: string) => void;
  setFilterPeriod: (period: PeriodFilter) => void;
  setFilterProfit: (profit: string) => void;
  setFilterTeam: (team: string) => void;

  // Setters de range
  setOddsRange: (range: { min: number; max: number }) => void;
  setAmountRange: (range: { min: number; max: number }) => void;

  // Setters de características
  setFilterHasBoost: (value: boolean) => void;
  setFilterHasCashout: (value: boolean) => void;
  setFilterUsedCredits: (value: boolean) => void;
  setFilterIsProtected: (value: boolean) => void;

  // Setters de ordenação
  setSortColumn: (column: string) => void;
  setSortDirection: (direction: 'asc' | 'desc') => void;

  // Setters de paginação
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;

  // Toggle
  setShowAdvancedFilters: (show: boolean) => void;

  // Reset
  clearFilters: () => void;
}

export type BetsListFilterStore = BetsListFilterState & BetsListFilterActions;

const initialState: BetsListFilterState = {
  searchTerm: '',
  filterBookmaker: 'all',
  filterType: 'all',
  filterStatus: 'all',
  filterPeriod: 'all',
  filterProfit: 'all',
  filterTeam: 'all',
  oddsRange: { min: 1, max: 10 },
  amountRange: { min: 0, max: 1000 },
  filterHasBoost: false,
  filterHasCashout: false,
  filterUsedCredits: false,
  filterIsProtected: false,
  sortColumn: 'date',
  sortDirection: 'desc',
  currentPage: 1,
  itemsPerPage: 50,
  showAdvancedFilters: false,
};

export const useBetsListFilterStore = create<BetsListFilterStore>()(
  devtools(
    sessionStorageMiddleware(
      (set) => ({
        ...initialState,

        // Setters básicos
        setSearchTerm: (searchTerm) => set({ searchTerm }),
        setFilterBookmaker: (filterBookmaker) => set({ filterBookmaker }),
        setFilterType: (filterType) => set({ filterType }),
        setFilterStatus: (filterStatus) => set({ filterStatus }),
        setFilterPeriod: (filterPeriod) => set({ filterPeriod }),
        setFilterProfit: (filterProfit) => set({ filterProfit }),
        setFilterTeam: (filterTeam) => set({ filterTeam }),

        // Setters de range
        setOddsRange: (oddsRange) => set({ oddsRange }),
        setAmountRange: (amountRange) => set({ amountRange }),

        // Setters de características
        setFilterHasBoost: (filterHasBoost) => set({ filterHasBoost }),
        setFilterHasCashout: (filterHasCashout) => set({ filterHasCashout }),
        setFilterUsedCredits: (filterUsedCredits) => set({ filterUsedCredits }),
        setFilterIsProtected: (filterIsProtected) => set({ filterIsProtected }),

        // Setters de ordenação
        setSortColumn: (sortColumn) => set({ sortColumn }),
        setSortDirection: (sortDirection) => set({ sortDirection }),

        // Setters de paginação
        setCurrentPage: (currentPage) => set({ currentPage }),
        setItemsPerPage: (itemsPerPage) => set({ itemsPerPage }),

        // Toggle
        setShowAdvancedFilters: (showAdvancedFilters) => set({ showAdvancedFilters }),

        // Reset
        clearFilters: () => set(initialState),
      }),
      { name: 'bets-list-filters' }
    ),
    { name: 'BetsListFilterStore' }
  )
);
