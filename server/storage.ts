import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq, desc, sql } from "drizzle-orm";
import { leads, followUps, subscriptions, type Lead, type InsertLead, type FollowUp, type InsertFollowUp, type Subscription } from "@shared/schema";

const sqlite = new Database("data.db");
export const db = drizzle(sqlite);

// Initialize tables
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    company TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    trade TEXT NOT NULL,
    location TEXT NOT NULL,
    project_description TEXT NOT NULL,
    budget TEXT,
    status TEXT NOT NULL DEFAULT 'new',
    source TEXT DEFAULT 'website',
    notes TEXT,
    assigned_to TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS follow_ups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'email',
    scheduled_at TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    plan TEXT NOT NULL DEFAULT 'starter',
    status TEXT NOT NULL DEFAULT 'trialing',
    current_period_end TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// Seed demo data if empty
const existing = db.select().from(leads).all();
if (existing.length === 0) {
  const demoLeads: InsertLead[] = [
    {
      name: "Klaus Bauer",
      company: "Bauer Elektro GmbH",
      email: "k.bauer@bauer-elektro.de",
      phone: "+49 761 123456",
      trade: "electrician",
      location: "Freiburg, Baden-Württemberg",
      projectDescription: "Komplette Elektroinstallation Neubau EFH, 200qm",
      budget: "15000-25000",
      status: "qualified",
      source: "google",
      notes: "Sehr interessiert, Terminvereinbarung für nächste Woche",
    },
    {
      name: "Markus Zimmermann",
      company: "Zimmermann Sanitär",
      email: "m.zimmer@sanitaer-zm.de",
      phone: "+49 711 987654",
      trade: "plumber",
      location: "Stuttgart, Baden-Württemberg",
      projectDescription: "Badezimmer-Renovierung Altbau, 3 Bäder",
      budget: "8000-12000",
      status: "proposal",
      source: "referral",
      notes: "Angebot liegt vor, wartet auf Rückmeldung",
    },
    {
      name: "Petra Hofmann",
      company: "Hofmann Dachbau",
      email: "p.hofmann@dachbau-h.de",
      phone: "+49 621 456789",
      trade: "roofer",
      location: "Mannheim, Baden-Württemberg",
      projectDescription: "Dachsanierung + Dämmung, ca. 180qm",
      budget: "20000-35000",
      status: "won",
      source: "cold-email",
      notes: "Auftrag erteilt! Start nächsten Monat.",
    },
    {
      name: "Thomas Richter",
      company: "Richter Heizung & Klima",
      email: "t.richter@hk-richter.de",
      phone: "+49 721 321654",
      trade: "hvac",
      location: "Karlsruhe, Baden-Württemberg",
      projectDescription: "Wärmepumpe Installation + Fußbodenheizung",
      budget: "18000-28000",
      status: "new",
      source: "website",
      notes: "",
    },
    {
      name: "Sandra Müller",
      company: "Müller Elektrotechnik",
      email: "s.mueller@elektro-m.de",
      phone: "+49 761 654321",
      trade: "electrician",
      location: "Freiburg, Baden-Württemberg",
      projectDescription: "Smart Home Installation, Photovoltaik-Anlage",
      budget: "12000-18000",
      status: "contacted",
      source: "website",
      notes: "Erstgespräch geführt, Follow-up geplant",
    },
    {
      name: "Andreas Weber",
      company: "Weber Sanitär GmbH",
      email: "a.weber@sanitaer-weber.de",
      phone: "+49 721 789012",
      trade: "plumber",
      location: "Karlsruhe, Baden-Württemberg",
      projectDescription: "Rohrsanierung Mehrfamilienhaus, 6 Wohneinheiten",
      budget: "25000-40000",
      status: "new",
      source: "google",
      notes: "",
    },
  ];

  for (const lead of demoLeads) {
    db.insert(leads).values(lead).run();
  }

  // Demo follow-ups
  const demoFollowUps = [
    {
      leadId: 1,
      message: "Terminbestätigung für Donnerstag 14:00 Uhr senden",
      type: "email",
      scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      completed: false,
    },
    {
      leadId: 2,
      message: "Angebotsstatus nachfragen",
      type: "call",
      scheduledAt: new Date(Date.now() + 172800000).toISOString(),
      completed: false,
    },
    {
      leadId: 5,
      message: "Detailinfos zur PV-Anlage schicken",
      type: "email",
      scheduledAt: new Date(Date.now() + 259200000).toISOString(),
      completed: false,
    },
  ];

  for (const fu of demoFollowUps) {
    db.insert(followUps).values(fu as InsertFollowUp).run();
  }
}

export interface IStorage {
  // Leads
  getLeads(): Lead[];
  getLeadById(id: number): Lead | undefined;
  createLead(data: InsertLead): Lead;
  updateLead(id: number, data: Partial<InsertLead>): Lead | undefined;
  deleteLead(id: number): void;
  // Follow-ups
  getFollowUps(leadId?: number): FollowUp[];
  createFollowUp(data: InsertFollowUp): FollowUp;
  completeFollowUp(id: number): FollowUp | undefined;
  // Subscriptions
  getSubscriptionByEmail(email: string): Subscription | undefined;
  getSubscriptionByCustomerId(customerId: string): Subscription | undefined;
  upsertSubscription(email: string, data: Partial<Subscription>): Subscription;
  // Stats
  getStats(): {
    total: number;
    new: number;
    contacted: number;
    qualified: number;
    proposal: number;
    won: number;
    lost: number;
    wonRevenue: number;
    pipelineRevenue: number;
    conversionRate: number;
  };
}

export const storage: IStorage = {
  getLeads() {
    return db.select().from(leads).orderBy(desc(leads.createdAt)).all();
  },

  getLeadById(id: number) {
    return db.select().from(leads).where(eq(leads.id, id)).get();
  },

  createLead(data: InsertLead) {
    return db.insert(leads).values(data).returning().get();
  },

  updateLead(id: number, data: Partial<InsertLead>) {
    return db
      .update(leads)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(leads.id, id))
      .returning()
      .get();
  },

  deleteLead(id: number) {
    db.delete(leads).where(eq(leads.id, id)).run();
  },

  getFollowUps(leadId?: number) {
    if (leadId) {
      return db.select().from(followUps).where(eq(followUps.leadId, leadId)).all();
    }
    return db.select().from(followUps).orderBy(followUps.scheduledAt).all();
  },

  createFollowUp(data: InsertFollowUp) {
    return db.insert(followUps).values(data).returning().get();
  },

  completeFollowUp(id: number) {
    return db
      .update(followUps)
      .set({ completed: true })
      .where(eq(followUps.id, id))
      .returning()
      .get();
  },

  getSubscriptionByEmail(email: string) {
    return db.select().from(subscriptions).where(eq(subscriptions.email, email)).get();
  },

  getSubscriptionByCustomerId(customerId: string) {
    return db.select().from(subscriptions).where(eq(subscriptions.stripeCustomerId, customerId)).get();
  },

  upsertSubscription(email: string, data: Partial<Subscription>) {
    const existing = db.select().from(subscriptions).where(eq(subscriptions.email, email)).get();
    if (existing) {
      return db.update(subscriptions).set(data).where(eq(subscriptions.email, email)).returning().get()!;
    }
    return db.insert(subscriptions).values({ email, ...data } as any).returning().get()!;
  },

  getStats() {
    const all = db.select().from(leads).all();
    const byStatus = (s: string) => all.filter((l) => l.status === s).length;

    const parseBudgetMid = (b: string | null) => {
      if (!b) return 0;
      const parts = b.split("-").map(Number);
      return parts.length === 2 ? (parts[0] + parts[1]) / 2 : parts[0] || 0;
    };

    const wonLeads = all.filter((l) => l.status === "won");
    const pipelineLeads = all.filter((l) =>
      ["contacted", "qualified", "proposal"].includes(l.status)
    );

    const wonRevenue = wonLeads.reduce((s, l) => s + parseBudgetMid(l.budget ?? null), 0);
    const pipelineRevenue = pipelineLeads.reduce(
      (s, l) => s + parseBudgetMid(l.budget ?? null),
      0
    );
    const conversionRate =
      all.length > 0 ? Math.round((wonLeads.length / all.length) * 100) : 0;

    return {
      total: all.length,
      new: byStatus("new"),
      contacted: byStatus("contacted"),
      qualified: byStatus("qualified"),
      proposal: byStatus("proposal"),
      won: byStatus("won"),
      lost: byStatus("lost"),
      wonRevenue,
      pipelineRevenue,
      conversionRate,
    };
  },
};
