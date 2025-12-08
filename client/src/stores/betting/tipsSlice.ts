import { StateCreator } from 'zustand';
import { Tip, Tipster } from '@/types/betting';

export interface TipsSlice {
  tips: Tip[];
  tipsters: Tipster[];
  addTip: (tip: Omit<Tip, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTip: (id: string, updates: Partial<Tip>) => void;
  deleteTip: (id: string) => void;
  addTipster: (tipster: Omit<Tipster, 'id' | 'createdAt'>) => void;
}

const STORAGE_KEY = 'betting_tips';
const TIPSTERS_KEY = 'betting_tipsters';

const DEFAULT_TIPSTERS: Tipster[] = [
  { id: '1', name: 'ProTipster', bio: 'Professional sports analyst', rating: 4.5, totalTips: 120, successRate: 68, createdAt: new Date().toISOString() },
  { id: '2', name: 'BetGuru', bio: 'Expert in football betting', rating: 4.2, totalTips: 95, successRate: 65, createdAt: new Date().toISOString() },
];

export const createTipsSlice: StateCreator<TipsSlice> = (set) => ({
  tips: [],
  tipsters: DEFAULT_TIPSTERS,

  addTip: (tip) => set((state) => {
    const newTip: Tip = {
      ...tip,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const newTips = [...state.tips, newTip];
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newTips));
    return { tips: newTips };
  }),

  updateTip: (id, updates) => set((state) => {
    const updatedTips = state.tips.map(tip =>
      tip.id === id ? { ...tip, ...updates, updatedAt: new Date().toISOString() } : tip
    );
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTips));
    return { tips: updatedTips };
  }),

  deleteTip: (id) => set((state) => {
    const filteredTips = state.tips.filter(t => t.id !== id);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(filteredTips));
    return { tips: filteredTips };
  }),

  addTipster: (tipster) => set((state) => {
    const newTipster: Tipster = {
      ...tipster,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    const newTipsters = [...state.tipsters, newTipster];
    sessionStorage.setItem(TIPSTERS_KEY, JSON.stringify(newTipsters));
    return { tipsters: newTipsters };
  }),
});
