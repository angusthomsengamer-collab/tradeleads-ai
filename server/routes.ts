import type { Express, Request, Response, NextFunction } from "express";
import { type Server } from "http";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { storage } from "./storage";
import { insertLeadSchema, insertFollowUpSchema } from "@shared/schema";
import { z } from "zod";
import { sendWelcomeEmail, sendAdminNewLeadNotification, sendDailyFollowUpDigest } from "./email";
import { createCheckoutSession, handleStripeWebhook, PLANS, type PlanKey } from "./stripe";

// ─── Auth ─────────────────────────────────────────────────────────────────
// Single-tenant simple password auth via Authorization header or session cookie.
// Password is set via DASHBOARD_PASSWORD env var (default: "tradeleads2026").
const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD ?? "tradeleads2026";

function requireAuth(req: Request, res: Response, next: NextFunction) {
  // Allow Bearer token (for API clients)
  const auth = req.headers.authorization;
  if (auth && auth.startsWith("Bearer ")) {
    const token = auth.slice(7);
    if (token === DASHBOARD_PASSWORD) return next();
  }
  // Allow session cookie set by /api/auth/login
  const cookie = req.headers.cookie ?? "";
  const sessionMatch = cookie.match(/__Host-tl-session=([^;]+)/);
  if (sessionMatch && sessionMatch[1] === DASHBOARD_PASSWORD) return next();

  return res.status(401).json({ error: "Unauthorized" });
}

// ─── Rate limiting ────────────────────────────────────────────────────────
const intakeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." },
});

// ─── PATCH update schema ──────────────────────────────────────────────────
const updateLeadSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  company: z.string().min(1).max(200).optional(),
  email: z.string().email().max(200).optional(),
  phone: z.string().min(6).max(40).optional(),
  trade: z.enum(["electrician", "plumber", "roofer", "hvac", "other"]).optional(),
  location: z.string().min(2).max(200).optional(),
  projectDescription: z.string().min(5).max(2000).optional(),
  budget: z.string().max(50).optional(),
  status: z.enum(["new", "contacted", "qualified", "proposal", "won", "lost"]).optional(),
  source: z.string().max(50).optional(),
  notes: z.string().max(5000).optional(),
  assignedTo: z.string().max(120).optional(),
});

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {

  // ─── Security headers ──────────────────────────────────────────────────
  app.use(helmet({
    contentSecurityPolicy: false, // Disabled — Vite assets use inline scripts
    crossOriginEmbedderPolicy: false,
  }));

  // ─── Auth endpoints (unauthenticated) ─────────────────────────────────
  app.post("/api/auth/login", (req, res) => {
    const { password } = req.body ?? {};
    if (!password || password !== DASHBOARD_PASSWORD) {
      return res.status(401).json({ error: "Invalid password" });
    }
    // Set an __Host- prefixed cookie (required by pplx.app proxy)
    res.setHeader(
      "Set-Cookie",
      `__Host-tl-session=${DASHBOARD_PASSWORD}; Path=/; Secure; SameSite=Strict; HttpOnly`
    );
    res.json({ success: true });
  });

  app.post("/api/auth/logout", (_req, res) => {
    res.setHeader(
      "Set-Cookie",
      `__Host-tl-session=; Path=/; Secure; SameSite=Strict; HttpOnly; Max-Age=0`
    );
    res.json({ success: true });
  });

  // Check auth status (used by frontend to gate the dashboard)
  app.get("/api/auth/me", requireAuth, (_req, res) => {
    res.json({ authenticated: true });
  });

  // ─── Stripe: get plans info (public) ────────────────────────────────────
  app.get("/api/plans", (_req, res) => {
    res.json(PLANS);
  });

  // ─── Stripe: create checkout session (public) ─────────────────────────
  app.post("/api/checkout", async (req, res) => {
    try {
      const { plan, email } = req.body ?? {};
      if (!plan || !email) {
        return res.status(400).json({ error: "plan and email required" });
      }
      if (!(plan in PLANS)) {
        return res.status(400).json({ error: "Invalid plan" });
      }
      const origin = req.headers.origin ?? "https://tradeleads-ai.pplx.app";
      const url = await createCheckoutSession(
        plan as PlanKey,
        email,
        `${origin}/#/success?plan=${plan}`,
        `${origin}/#/pricing`
      );
      res.json({ url });
    } catch (err: any) {
      console.error("[stripe] checkout error:", err.message);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  // ─── Stripe webhook (raw body already captured by express.json verify) ──
  app.post("/api/webhook/stripe", async (req, res) => {
    const sig = req.headers["stripe-signature"] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
    try {
      const rawBody = (req as any).rawBody as Buffer;
      if (!rawBody) {
        return res.status(400).json({ error: "Missing raw body" });
      }
      const result = await handleStripeWebhook(rawBody, sig, webhookSecret);
      res.json(result);
    } catch (err: any) {
      console.error("[stripe] webhook error:", err.message);
      res.status(400).json({ error: err.message });
    }
  });

  // ─── Check subscription status (public — frontend uses this) ──────────
  app.get("/api/subscription", (req, res) => {
    const email = req.query.email as string;
    if (!email) return res.status(400).json({ error: "email required" });
    const sub = storage.getSubscriptionByEmail(email);
    if (!sub) return res.json({ active: false });
    const active = ["active", "trialing"].includes(sub.status);
    res.json({ active, plan: sub.plan, status: sub.status });
  });

  // ─── Public intake endpoint (rate-limited, no auth required) ──────────
  app.post("/api/intake", intakeLimiter, (req, res) => {
    try {
      const schema = insertLeadSchema.extend({
        status: z.string().max(20).optional().default("new"),
        source: z.string().max(50).optional().default("widget"),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid data", details: parsed.error.issues });
      }
      const lead = storage.createLead(parsed.data);
      // Fire emails async — don't block the response
      if (lead.email) {
        sendWelcomeEmail({
          name: lead.name,
          email: lead.email,
          trade: lead.trade,
          company: lead.company ?? undefined,
        }).catch(() => {});
        sendAdminNewLeadNotification({
          name: lead.name,
          email: lead.email,
          trade: lead.trade,
          company: lead.company ?? undefined,
          location: lead.location ?? undefined,
          projectDescription: lead.projectDescription ?? undefined,
        }).catch(() => {});
      }
      res.status(201).json({ success: true, id: lead.id });
    } catch (err) {
      res.status(500).json({ error: "Failed to submit lead" });
    }
  });

  // ─── Protected CRM routes ──────────────────────────────────────────────
  app.get("/api/leads", requireAuth, (_req, res) => {
    try {
      res.json(storage.getLeads());
    } catch {
      res.status(500).json({ error: "Failed to fetch leads" });
    }
  });

  app.get("/api/leads/:id", requireAuth, (req, res) => {
    try {
      const lead = storage.getLeadById(Number(req.params.id));
      if (!lead) return res.status(404).json({ error: "Lead not found" });
      res.json(lead);
    } catch {
      res.status(500).json({ error: "Failed to fetch lead" });
    }
  });

  app.post("/api/leads", requireAuth, (req, res) => {
    try {
      const parsed = insertLeadSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid data", details: parsed.error.issues });
      }
      res.status(201).json(storage.createLead(parsed.data));
    } catch {
      res.status(500).json({ error: "Failed to create lead" });
    }
  });

  app.patch("/api/leads/:id", requireAuth, (req, res) => {
    try {
      const parsed = updateLeadSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid data", details: parsed.error.issues });
      }
      const updated = storage.updateLead(Number(req.params.id), parsed.data);
      if (!updated) return res.status(404).json({ error: "Lead not found" });
      res.json(updated);
    } catch {
      res.status(500).json({ error: "Failed to update lead" });
    }
  });

  app.delete("/api/leads/:id", requireAuth, (req, res) => {
    try {
      storage.deleteLead(Number(req.params.id));
      res.json({ success: true });
    } catch {
      res.status(500).json({ error: "Failed to delete lead" });
    }
  });

  app.get("/api/stats", requireAuth, (_req, res) => {
    try {
      res.json(storage.getStats());
    } catch {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  app.get("/api/followups", requireAuth, (req, res) => {
    try {
      const leadId = req.query.leadId ? Number(req.query.leadId) : undefined;
      res.json(storage.getFollowUps(leadId));
    } catch {
      res.status(500).json({ error: "Failed to fetch follow-ups" });
    }
  });

  app.post("/api/followups", requireAuth, (req, res) => {
    try {
      const parsed = insertFollowUpSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid data", details: parsed.error.issues });
      }
      res.status(201).json(storage.createFollowUp(parsed.data));
    } catch {
      res.status(500).json({ error: "Failed to create follow-up" });
    }
  });

  app.patch("/api/followups/:id/complete", requireAuth, (req, res) => {
    try {
      const fu = storage.completeFollowUp(Number(req.params.id));
      if (!fu) return res.status(404).json({ error: "Follow-up not found" });
      res.json(fu);
    } catch {
      res.status(500).json({ error: "Failed to complete follow-up" });
    }
  });

  // ─── Internal cron endpoint: daily follow-up digest ─────────────────────
  // Called by the cron job at 07:00 every morning.
  // Protected by the same DASHBOARD_PASSWORD.
  app.post("/api/cron/daily-digest", requireAuth, async (_req, res) => {
    try {
      const allFollowUps = storage.getFollowUps();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Filter to follow-ups scheduled for today that are not yet completed
      const dueToday = allFollowUps
        .filter(fu => {
          if (fu.completedAt) return false;
          const d = new Date(fu.scheduledAt);
          return d >= today && d < tomorrow;
        })
        .map(fu => {
          const lead = storage.getLeadById(fu.leadId);
          return {
            id: fu.id,
            leadName: lead?.name ?? "Unbekannt",
            leadEmail: lead?.email ?? "",
            scheduledAt: fu.scheduledAt,
            notes: fu.notes,
          };
        });

      await sendDailyFollowUpDigest(dueToday);
      res.json({ success: true, sent: dueToday.length });
    } catch (err) {
      console.error("[cron] daily-digest error:", err);
      res.status(500).json({ error: "Digest failed" });
    }
  });

  return httpServer;
}
