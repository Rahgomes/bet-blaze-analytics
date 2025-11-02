import type { Bet, Tipster, Tip, Team, Transaction, BankrollSettings, InsertBet, InsertTipster, InsertTip, InsertTeam, InsertTransaction, InsertBankrollSettings } from "@shared/schema";

export interface IStorage {
  getBets(): Promise<Bet[]>;
  getBetById(id: number): Promise<Bet | undefined>;
  createBet(bet: InsertBet): Promise<Bet>;
  updateBet(id: number, bet: Partial<InsertBet>): Promise<Bet>;
  deleteBet(id: number): Promise<void>;
  
  getTipsters(): Promise<Tipster[]>;
  getTipsterById(id: number): Promise<Tipster | undefined>;
  createTipster(tipster: InsertTipster): Promise<Tipster>;
  
  getTips(): Promise<Tip[]>;
  getTipById(id: number): Promise<Tip | undefined>;
  createTip(tip: InsertTip): Promise<Tip>;
  updateTip(id: number, tip: Partial<InsertTip>): Promise<Tip>;
  deleteTip(id: number): Promise<void>;
  
  getTeams(): Promise<Team[]>;
  getTeamById(id: number): Promise<Team | undefined>;
  createTeam(team: InsertTeam): Promise<Team>;
  updateTeam(id: number, team: Partial<InsertTeam>): Promise<Team>;
  deleteTeam(id: number): Promise<void>;
  
  getTransactions(): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  getBankrollSettings(): Promise<BankrollSettings | undefined>;
  updateBankrollSettings(settings: Partial<InsertBankrollSettings>): Promise<BankrollSettings>;
}

export class MemStorage implements IStorage {
  private bets: Bet[] = [];
  private tipsters: Tipster[] = [];
  private tips: Tip[] = [];
  private teams: Team[] = [];
  private transactions: Transaction[] = [];
  private bankrollSettings: BankrollSettings | undefined;
  private nextBetId = 1;
  private nextTipsterId = 1;
  private nextTipId = 1;
  private nextTeamId = 1;
  private nextTransactionId = 1;

  async getBets(): Promise<Bet[]> {
    return this.bets;
  }

  async getBetById(id: number): Promise<Bet | undefined> {
    return this.bets.find(bet => bet.id === id);
  }

  async createBet(bet: InsertBet): Promise<Bet> {
    const newBet: Bet = {
      ...bet,
      id: this.nextBetId++,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.bets.push(newBet);
    return newBet;
  }

  async updateBet(id: number, bet: Partial<InsertBet>): Promise<Bet> {
    const index = this.bets.findIndex(b => b.id === id);
    if (index === -1) throw new Error("Bet not found");
    
    this.bets[index] = {
      ...this.bets[index],
      ...bet,
      updatedAt: new Date(),
    };
    return this.bets[index];
  }

  async deleteBet(id: number): Promise<void> {
    this.bets = this.bets.filter(bet => bet.id !== id);
  }

  async getTipsters(): Promise<Tipster[]> {
    return this.tipsters;
  }

  async getTipsterById(id: number): Promise<Tipster | undefined> {
    return this.tipsters.find(tipster => tipster.id === id);
  }

  async createTipster(tipster: InsertTipster): Promise<Tipster> {
    const newTipster: Tipster = {
      ...tipster,
      id: this.nextTipsterId++,
      createdAt: new Date(),
    };
    this.tipsters.push(newTipster);
    return newTipster;
  }

  async getTips(): Promise<Tip[]> {
    return this.tips;
  }

  async getTipById(id: number): Promise<Tip | undefined> {
    return this.tips.find(tip => tip.id === id);
  }

  async createTip(tip: InsertTip): Promise<Tip> {
    const newTip: Tip = {
      ...tip,
      id: this.nextTipId++,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.tips.push(newTip);
    return newTip;
  }

  async updateTip(id: number, tip: Partial<InsertTip>): Promise<Tip> {
    const index = this.tips.findIndex(t => t.id === id);
    if (index === -1) throw new Error("Tip not found");
    
    this.tips[index] = {
      ...this.tips[index],
      ...tip,
      updatedAt: new Date(),
    };
    return this.tips[index];
  }

  async deleteTip(id: number): Promise<void> {
    this.tips = this.tips.filter(tip => tip.id !== id);
  }

  async getTeams(): Promise<Team[]> {
    return this.teams;
  }

  async getTeamById(id: number): Promise<Team | undefined> {
    return this.teams.find(team => team.id === id);
  }

  async createTeam(team: InsertTeam): Promise<Team> {
    const newTeam: Team = {
      ...team,
      id: this.nextTeamId++,
      createdAt: new Date(),
    };
    this.teams.push(newTeam);
    return newTeam;
  }

  async updateTeam(id: number, team: Partial<InsertTeam>): Promise<Team> {
    const index = this.teams.findIndex(t => t.id === id);
    if (index === -1) throw new Error("Team not found");
    
    this.teams[index] = {
      ...this.teams[index],
      ...team,
    };
    return this.teams[index];
  }

  async deleteTeam(id: number): Promise<void> {
    this.teams = this.teams.filter(team => team.id !== id);
  }

  async getTransactions(): Promise<Transaction[]> {
    return this.transactions;
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const newTransaction: Transaction = {
      ...transaction,
      id: this.nextTransactionId++,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.transactions.push(newTransaction);
    return newTransaction;
  }

  async getBankrollSettings(): Promise<BankrollSettings | undefined> {
    return this.bankrollSettings;
  }

  async updateBankrollSettings(settings: Partial<InsertBankrollSettings>): Promise<BankrollSettings> {
    if (!this.bankrollSettings) {
      this.bankrollSettings = {
        id: 1,
        initialBankroll: "0",
        currentBankroll: "0",
        targetMode: "percentage",
        targetPercentage: null,
        targetAmount: null,
        stopLossWeekly: null,
        stopGainWeekly: null,
        stopLossMonthly: null,
        stopGainMonthly: null,
        leagues: null,
        markets: null,
        strategies: null,
        language: null,
        alertsEnabled: null,
        updatedAt: new Date(),
        ...settings,
      };
    } else {
      this.bankrollSettings = {
        ...this.bankrollSettings,
        ...settings,
        updatedAt: new Date(),
      };
    }
    return this.bankrollSettings;
  }
}

export const storage = new MemStorage();
