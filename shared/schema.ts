import { pgTable, serial, text, integer, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const bets = pgTable("bets", {
  id: serial("id").primaryKey(),
  operationNumber: integer("operation_number").notNull(),
  bookmaker: text("bookmaker").notNull(),
  date: text("date").notNull(),
  betType: text("bet_type").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  odds: decimal("odds", { precision: 10, scale: 2 }).notNull(),
  returnAmount: decimal("return_amount", { precision: 10, scale: 2 }).notNull(),
  profit: decimal("profit", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull(),
  description: text("description").notNull(),
  stakeLogic: text("stake_logic"),
  isProtected: boolean("is_protected"),
  isLive: boolean("is_live"),
  teams: text("teams").array(),
  competition: text("competition"),
  league: text("league"),
  market: text("market"),
  strategies: text("strategies").array(),
  matchTime: text("match_time"),
  sourceType: text("source_type"),
  sourceTipId: integer("source_tip_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tipsters = pgTable("tipsters", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  bio: text("bio"),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  totalTips: integer("total_tips"),
  successRate: decimal("success_rate", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tips = pgTable("tips", {
  id: serial("id").primaryKey(),
  tipsterId: integer("tipster_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  match: text("match").notNull(),
  market: text("market").notNull(),
  suggestedStake: decimal("suggested_stake", { precision: 10, scale: 2 }),
  suggestedOdds: decimal("suggested_odds", { precision: 10, scale: 2 }).notNull(),
  betType: text("bet_type").notNull(),
  confidence: text("confidence").notNull(),
  status: text("status").notNull(),
  date: text("date").notNull(),
  notes: text("notes"),
  convertedBetId: integer("converted_bet_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  competition: text("competition"),
  notes: text("notes"),
  isWatched: boolean("is_watched").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  dateTime: text("date_time").notNull(),
  description: text("description").notNull(),
  balanceAfter: decimal("balance_after", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const bankrollSettings = pgTable("bankroll_settings", {
  id: serial("id").primaryKey(),
  initialBankroll: decimal("initial_bankroll", { precision: 10, scale: 2 }).notNull(),
  currentBankroll: decimal("current_bankroll", { precision: 10, scale: 2 }).notNull(),
  targetMode: text("target_mode").notNull(),
  targetPercentage: decimal("target_percentage", { precision: 5, scale: 2 }),
  targetAmount: decimal("target_amount", { precision: 10, scale: 2 }),
  stopLossWeekly: decimal("stop_loss_weekly", { precision: 10, scale: 2 }),
  stopGainWeekly: decimal("stop_gain_weekly", { precision: 10, scale: 2 }),
  stopLossMonthly: decimal("stop_loss_monthly", { precision: 10, scale: 2 }),
  stopGainMonthly: decimal("stop_gain_monthly", { precision: 10, scale: 2 }),
  leagues: text("leagues").array(),
  markets: text("markets").array(),
  strategies: text("strategies").array(),
  language: text("language"),
  alertsEnabled: boolean("alerts_enabled"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBetSchema = createInsertSchema(bets).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTipsterSchema = createInsertSchema(tipsters).omit({ id: true, createdAt: true });
export const insertTipSchema = createInsertSchema(tips).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTeamSchema = createInsertSchema(teams).omit({ id: true, createdAt: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBankrollSettingsSchema = createInsertSchema(bankrollSettings).omit({ id: true, updatedAt: true });

export type InsertBet = z.infer<typeof insertBetSchema>;
export type InsertTipster = z.infer<typeof insertTipsterSchema>;
export type InsertTip = z.infer<typeof insertTipSchema>;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type InsertBankrollSettings = z.infer<typeof insertBankrollSettingsSchema>;

export type Bet = typeof bets.$inferSelect;
export type Tipster = typeof tipsters.$inferSelect;
export type Tip = typeof tips.$inferSelect;
export type Team = typeof teams.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type BankrollSettings = typeof bankrollSettings.$inferSelect;
