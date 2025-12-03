import { StateCreator, StoreMutatorIdentifier } from 'zustand';

type SessionStorageMiddleware = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  config: StateCreator<T, Mps, Mcs>,
  options: { name: string }
) => StateCreator<T, Mps, Mcs>;

export const sessionStorageMiddleware: SessionStorageMiddleware =
  (config, options) => (set, get, api) => {
    const { name } = options;

    // Load from sessionStorage on init
    const storedValue = sessionStorage.getItem(name);
    if (storedValue) {
      try {
        const parsed = JSON.parse(storedValue);
        set(parsed);
      } catch (e) {
        console.error(`Error loading ${name} from sessionStorage`, e);
      }
    }

    // Wrap set to persist on changes
    const newSet: typeof set = (partial, replace) => {
      set(partial, replace);
      const state = get();
      sessionStorage.setItem(name, JSON.stringify(state));
    };

    return config(newSet, get, api);
  };
