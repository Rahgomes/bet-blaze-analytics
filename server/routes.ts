import type { Express } from "express";
import { storage } from "./storage";
import { insertBetSchema, insertTipsterSchema, insertTipSchema, insertTeamSchema, insertTransactionSchema, insertBankrollSettingsSchema } from "@shared/schema";

export function registerRoutes(app: Express) {
  app.get("/api/bets", async (req, res) => {
    const bets = await storage.getBets();
    res.json(bets);
  });

  app.get("/api/bets/:id", async (req, res) => {
    const bet = await storage.getBetById(parseInt(req.params.id));
    if (!bet) {
      return res.status(404).json({ error: "Bet not found" });
    }
    res.json(bet);
  });

  app.post("/api/bets", async (req, res) => {
    try {
      const validatedData = insertBetSchema.parse(req.body);
      const bet = await storage.createBet(validatedData);
      res.status(201).json(bet);
    } catch (error) {
      res.status(400).json({ error: "Invalid bet data" });
    }
  });

  app.patch("/api/bets/:id", async (req, res) => {
    try {
      const bet = await storage.updateBet(parseInt(req.params.id), req.body);
      res.json(bet);
    } catch (error) {
      res.status(404).json({ error: "Bet not found" });
    }
  });

  app.delete("/api/bets/:id", async (req, res) => {
    await storage.deleteBet(parseInt(req.params.id));
    res.status(204).send();
  });

  app.get("/api/tipsters", async (req, res) => {
    const tipsters = await storage.getTipsters();
    res.json(tipsters);
  });

  app.get("/api/tipsters/:id", async (req, res) => {
    const tipster = await storage.getTipsterById(parseInt(req.params.id));
    if (!tipster) {
      return res.status(404).json({ error: "Tipster not found" });
    }
    res.json(tipster);
  });

  app.post("/api/tipsters", async (req, res) => {
    try {
      const validatedData = insertTipsterSchema.parse(req.body);
      const tipster = await storage.createTipster(validatedData);
      res.status(201).json(tipster);
    } catch (error) {
      res.status(400).json({ error: "Invalid tipster data" });
    }
  });

  app.get("/api/tips", async (req, res) => {
    const tips = await storage.getTips();
    res.json(tips);
  });

  app.get("/api/tips/:id", async (req, res) => {
    const tip = await storage.getTipById(parseInt(req.params.id));
    if (!tip) {
      return res.status(404).json({ error: "Tip not found" });
    }
    res.json(tip);
  });

  app.post("/api/tips", async (req, res) => {
    try {
      const validatedData = insertTipSchema.parse(req.body);
      const tip = await storage.createTip(validatedData);
      res.status(201).json(tip);
    } catch (error) {
      res.status(400).json({ error: "Invalid tip data" });
    }
  });

  app.patch("/api/tips/:id", async (req, res) => {
    try {
      const tip = await storage.updateTip(parseInt(req.params.id), req.body);
      res.json(tip);
    } catch (error) {
      res.status(404).json({ error: "Tip not found" });
    }
  });

  app.delete("/api/tips/:id", async (req, res) => {
    await storage.deleteTip(parseInt(req.params.id));
    res.status(204).send();
  });

  app.get("/api/teams", async (req, res) => {
    const teams = await storage.getTeams();
    res.json(teams);
  });

  app.get("/api/teams/:id", async (req, res) => {
    const team = await storage.getTeamById(parseInt(req.params.id));
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }
    res.json(team);
  });

  app.post("/api/teams", async (req, res) => {
    try {
      const validatedData = insertTeamSchema.parse(req.body);
      const team = await storage.createTeam(validatedData);
      res.status(201).json(team);
    } catch (error) {
      res.status(400).json({ error: "Invalid team data" });
    }
  });

  app.patch("/api/teams/:id", async (req, res) => {
    try {
      const team = await storage.updateTeam(parseInt(req.params.id), req.body);
      res.json(team);
    } catch (error) {
      res.status(404).json({ error: "Team not found" });
    }
  });

  app.delete("/api/teams/:id", async (req, res) => {
    await storage.deleteTeam(parseInt(req.params.id));
    res.status(204).send();
  });

  app.get("/api/transactions", async (req, res) => {
    const transactions = await storage.getTransactions();
    res.json(transactions);
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const validatedData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(validatedData);
      res.status(201).json(transaction);
    } catch (error) {
      res.status(400).json({ error: "Invalid transaction data" });
    }
  });

  app.get("/api/bankroll-settings", async (req, res) => {
    const settings = await storage.getBankrollSettings();
    res.json(settings);
  });

  app.patch("/api/bankroll-settings", async (req, res) => {
    try {
      const settings = await storage.updateBankrollSettings(req.body);
      res.json(settings);
    } catch (error) {
      res.status(400).json({ error: "Invalid settings data" });
    }
  });
}
