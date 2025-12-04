import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { createBetsSlice, BetsSlice } from './betsSlice';
import { createBankrollSlice, BankrollSlice } from './bankrollSlice';
import { createTransactionsSlice, TransactionsSlice } from './transactionsSlice';
import { createBookmakersSlice, BookmakersSlice } from './bookmakersSlice';
import { createImportSessionsSlice, ImportSessionsSlice } from './importSessionsSlice';
import { createTeamsSlice, TeamsSlice } from './teamsSlice';

export type BettingStore = BetsSlice & BankrollSlice & TransactionsSlice & BookmakersSlice & ImportSessionsSlice & TeamsSlice;

export const useBettingStore = create<BettingStore>()(
  devtools(
    (...args) => ({
      ...createBetsSlice(...args),
      ...createBankrollSlice(...args),
      ...createTransactionsSlice(...args),
      ...createBookmakersSlice(...args),
      ...createImportSessionsSlice(...args),
      ...createTeamsSlice(...args),
    }),
    { name: 'BettingStore' }
  )
);

// Inicializar dados do localStorage
export const initializeBettingStore = () => {
  const store = useBettingStore.getState();

  store.setLoading(true);

  try {
    // Load bets
    const betsData = localStorage.getItem('betting_bets');
    if (betsData) {
      try {
        store.setBets(JSON.parse(betsData));
      } catch (error) {
        console.error('Error parsing bets data:', error);
        localStorage.removeItem('betting_bets');
      }
    }

    // Load bankroll
    const bankrollData = localStorage.getItem('betting_bankroll');
    if (bankrollData) {
      try {
        const parsed = JSON.parse(bankrollData);
        store.setBankroll(parsed);
      } catch (error) {
        console.error('Error parsing bankroll data:', error);
        localStorage.removeItem('betting_bankroll');
      }
    }

    // Load transactions
    const transactionsData = localStorage.getItem('betting_transactions');
    if (transactionsData) {
      try {
        store.setTransactions(JSON.parse(transactionsData));
      } catch (error) {
        console.error('Error parsing transactions data:', error);
        localStorage.removeItem('betting_transactions');
      }
    }

    // Load bookmakers
    const bookmakersData = localStorage.getItem('betting_bookmakers');
    if (bookmakersData) {
      try {
        store.setBookmakers(JSON.parse(bookmakersData));
      } catch (error) {
        console.error('Error parsing bookmakers data:', error);
        localStorage.removeItem('betting_bookmakers');
      }
    }

    // Load import sessions
    const importSessionsData = localStorage.getItem('betting_import_sessions');
    if (importSessionsData) {
      try {
        store.setImportSessions(JSON.parse(importSessionsData));
      } catch (error) {
        console.error('Error parsing import sessions data:', error);
        localStorage.removeItem('betting_import_sessions');
      }
    }

    // Load teams
    const teamsData = localStorage.getItem('betting_teams');
    if (teamsData) {
      try {
        store.setTeams(JSON.parse(teamsData));
      } catch (error) {
        console.error('Error parsing teams data:', error);
        localStorage.removeItem('betting_teams');
      }
    }
  } catch (error) {
    console.error('Error loading betting data from localStorage:', error);
  } finally {
    store.setLoading(false);
  }
};
