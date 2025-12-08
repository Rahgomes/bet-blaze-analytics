import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { createBetsSlice, BetsSlice } from './betsSlice';
import { createBankrollSlice, BankrollSlice } from './bankrollSlice';
import { createTransactionsSlice, TransactionsSlice } from './transactionsSlice';
import { createBookmakersSlice, BookmakersSlice } from './bookmakersSlice';
import { createImportSessionsSlice, ImportSessionsSlice } from './importSessionsSlice';
import { createTeamsSlice, TeamsSlice } from './teamsSlice';
import { createTipsSlice, TipsSlice } from './tipsSlice';
import { createGlossarySlice, GlossarySlice } from './glossarySlice';

export type BettingStore = BetsSlice & BankrollSlice & TransactionsSlice & BookmakersSlice & ImportSessionsSlice & TeamsSlice & TipsSlice & GlossarySlice;

export const useBettingStore = create<BettingStore>()(
  devtools(
    (...args) => ({
      ...createBetsSlice(...args),
      ...createBankrollSlice(...args),
      ...createTransactionsSlice(...args),
      ...createBookmakersSlice(...args),
      ...createImportSessionsSlice(...args),
      ...createTeamsSlice(...args),
      ...createTipsSlice(...args),
      ...createGlossarySlice(...args),
    }),
    { name: 'BettingStore' }
  )
);

// Inicializar dados do sessionStorage
export const initializeBettingStore = () => {
  const store = useBettingStore.getState();

  store.setLoading(true);

  try {
    // Load bets
    const betsData = sessionStorage.getItem('betting_bets');
    if (betsData) {
      try {
        store.setBets(JSON.parse(betsData));
      } catch (error) {
        console.error('Error parsing bets data:', error);
        sessionStorage.removeItem('betting_bets');
      }
    }

    // Load bankroll
    const bankrollData = sessionStorage.getItem('betting_bankroll');
    if (bankrollData) {
      try {
        const parsed = JSON.parse(bankrollData);
        store.setBankroll(parsed);
      } catch (error) {
        console.error('Error parsing bankroll data:', error);
        sessionStorage.removeItem('betting_bankroll');
      }
    }

    // Load transactions
    const transactionsData = sessionStorage.getItem('betting_transactions');
    if (transactionsData) {
      try {
        store.setTransactions(JSON.parse(transactionsData));
      } catch (error) {
        console.error('Error parsing transactions data:', error);
        sessionStorage.removeItem('betting_transactions');
      }
    }

    // Load bookmakers
    const bookmakersData = sessionStorage.getItem('betting_bookmakers');
    if (bookmakersData) {
      try {
        store.setBookmakers(JSON.parse(bookmakersData));
      } catch (error) {
        console.error('Error parsing bookmakers data:', error);
        sessionStorage.removeItem('betting_bookmakers');
      }
    }

    // Load import sessions
    const importSessionsData = sessionStorage.getItem('betting_import_sessions');
    if (importSessionsData) {
      try {
        store.setImportSessions(JSON.parse(importSessionsData));
      } catch (error) {
        console.error('Error parsing import sessions data:', error);
        sessionStorage.removeItem('betting_import_sessions');
      }
    }

    // Load teams
    const teamsData = sessionStorage.getItem('betting_teams');
    if (teamsData) {
      try {
        store.setTeams(JSON.parse(teamsData));
      } catch (error) {
        console.error('Error parsing teams data:', error);
        sessionStorage.removeItem('betting_teams');
      }
    }

    // Load tips
    const tipsData = sessionStorage.getItem('betting_tips');
    if (tipsData) {
      try {
        const parsed = JSON.parse(tipsData);
        useBettingStore.setState({ tips: parsed });
      } catch (error) {
        console.error('Error parsing tips data:', error);
        sessionStorage.removeItem('betting_tips');
      }
    }

    // Load tipsters
    const tipstersData = sessionStorage.getItem('betting_tipsters');
    if (tipstersData) {
      try {
        const parsed = JSON.parse(tipstersData);
        useBettingStore.setState({ tipsters: parsed });
      } catch (error) {
        console.error('Error parsing tipsters data:', error);
        sessionStorage.removeItem('betting_tipsters');
      }
    }

    // Load glossary (optional, uses DEFAULT_GLOSSARY if not found)
    const glossaryData = sessionStorage.getItem('betting_glossary');
    if (glossaryData) {
      try {
        const parsed = JSON.parse(glossaryData);
        useBettingStore.setState({ glossary: parsed });
      } catch (error) {
        console.error('Error parsing glossary data:', error);
        sessionStorage.removeItem('betting_glossary');
      }
    }
  } catch (error) {
    console.error('Error loading betting data from sessionStorage:', error);
  } finally {
    store.setLoading(false);
  }
};
