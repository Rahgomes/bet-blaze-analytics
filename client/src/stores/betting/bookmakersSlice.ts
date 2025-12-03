import { StateCreator } from 'zustand';
import { Bookmaker } from '@/types/betting';

export interface BookmakersSlice {
  bookmakers: Bookmaker[];

  // Actions
  addBookmaker: (bookmaker: Omit<Bookmaker, 'id'>) => void;
  updateBookmaker: (id: string, updates: Partial<Bookmaker>) => void;
  deleteBookmaker: (id: string) => void;
  setBookmakers: (bookmakers: Bookmaker[]) => void;
}

export const createBookmakersSlice: StateCreator<
  BookmakersSlice,
  [],
  [],
  BookmakersSlice
> = (set, get) => ({
  bookmakers: [],

  addBookmaker: (bookmakerData) => {
    const newBookmaker: Bookmaker = {
      ...bookmakerData,
      id: crypto.randomUUID(),
    };

    set(state => ({
      bookmakers: [...state.bookmakers, newBookmaker]
    }));

    const updated = get().bookmakers;
    localStorage.setItem('betting_bookmakers', JSON.stringify(updated));
  },

  updateBookmaker: (id, updates) => {
    set(state => ({
      bookmakers: state.bookmakers.map(b =>
        b.id === id ? { ...b, ...updates } : b
      )
    }));

    const updated = get().bookmakers;
    localStorage.setItem('betting_bookmakers', JSON.stringify(updated));
  },

  deleteBookmaker: (id) => {
    set(state => ({
      bookmakers: state.bookmakers.filter(b => b.id !== id)
    }));

    const updated = get().bookmakers;
    localStorage.setItem('betting_bookmakers', JSON.stringify(updated));
  },

  setBookmakers: (bookmakers) => set({ bookmakers }),
});
