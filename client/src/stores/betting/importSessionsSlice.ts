import { StateCreator } from 'zustand';
import { ImportSession } from '@/types/import';

export interface ImportSessionsSlice {
  importSessions: ImportSession[];

  addImportSession: (session: ImportSession) => void;
  getImportSessions: () => ImportSession[];
  getImportSessionById: (id: string) => ImportSession | null;
  deleteImportSession: (id: string) => void;
  setImportSessions: (sessions: ImportSession[]) => void;
}

const STORAGE_KEY = 'betting_import_sessions';

export const createImportSessionsSlice: StateCreator<
  ImportSessionsSlice,
  [],
  [],
  ImportSessionsSlice
> = (set, get) => ({
  importSessions: [],

  addImportSession: (session) => {
    const sessions = [...get().importSessions, session];
    set({ importSessions: sessions });
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  },

  getImportSessions: () => {
    return [...get().importSessions].sort((a, b) =>
      new Date(b.importDate).getTime() - new Date(a.importDate).getTime()
    );
  },

  getImportSessionById: (id) => {
    return get().importSessions.find(s => s.id === id) || null;
  },

  deleteImportSession: (id) => {
    const sessions = get().importSessions.filter(s => s.id !== id);
    set({ importSessions: sessions });
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  },

  setImportSessions: (sessions) => set({ importSessions: sessions }),
});
