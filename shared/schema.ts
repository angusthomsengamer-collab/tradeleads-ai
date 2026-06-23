import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Leads table
export const leads = sqliteTable("leads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  company: text("company").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  trade: text("trade").notNull(), // electrician, plumber, roofer, hvac, other
  location: text("location").notNull(),
  projectDescription: text("project_description").notNull(),
  budget: text("budget"), // e.g. "5000-10000"
  status: text("status").notNull().default("new"), // new, contacted, qualified, proposal, won, lost
  source: text("source").default("website"), // website, referral, google, cold-email
  notes: text("notes"),
  assignedTo: text("assigned_to"),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
});

// Follow-ups table
export const followUps = sqliteTable("follow_ups", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  leadId: integer("lead_id").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("email"), // email, call, sms
  scheduledAt: text("scheduled_at").notNull(),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

// Subscriptions table
export const subscriptions = sqliteTable("subscriptions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  plan: text("plan").notNull().default("starter"), // starter, professional, team
  status: text("status").notNull().default("trialing"), // trialing, active, canceled, past_due
  currentPeriodEnd: text("current_period_end"),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

// Stats (cached daily aggregates)
export const dailyStats = sqliteTable("daily_stats", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull(),
  totalLeads: integer("total_leads").notNull().default(0),
  newLeads: integer("new_leads").notNull().default(0),
  wonLeads: integer("won_leads").notNull().default(0),
  revenue: real("revenue").notNull().default(0),
});

// Insert schemas
export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  name: z.string().min(2).max(120),
  company: z.string().min(1).max(200),
  email: z.string().email().max(200),
  phone: z.string().min(6).max(40),
  trade: z.enum(["electrician", "plumber", "roofer", "hvac", "other"]),
  location: z.string().min(2).max(200),
  projectDescription: z.string().min(5).max(2000),
  budget: z.string().max(50).optional(),
  status: z.string().max(20).optional(),
  source: z.string().max(50).optional(),
  notes: z.string().max(5000).optional(),
  assignedTo: z.string().max(120).optional(),
});

export const insertFollowUpSchema = createInsertSchema(followUps).omit({
  id: true,
  createdAt: true,
});

// Types
export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type FollowUp = typeof followUps.$inferSelect;
export type InsertFollowUp = z.infer<typeof insertFollowUpSchema>;
