import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/ThemeProvider";
import {
  Zap, Users, BarChart3, Bell, CheckCircle, ArrowRight, Sun, Moon,
  Star, Shield, TrendingUp, Phone, Mail, MapPin
} from "lucide-react";

const FEATURES = [
  {
    icon: Zap,
    title: "KI-qualifizierte Leads",
    desc: "Unser Intake-Formular filtert automatisch unqualifizierte Anfragen heraus. Nur echte Interessenten landen in Ihrem Dashboard.",
  },
  {
    icon: BarChart3,
    title: "Pipeline-Überblick",
    desc: "Sehen Sie auf einen Blick, wo sich jeder Lead in Ihrer Vertriebspipeline befindet — von der ersten Anfrage bis zum Auftrag.",
  },
  {
    icon: Bell,
    title: "Automatische Follow-ups",
    desc: "Verpassen Sie keine Chance mehr. Automatische Erinnerungen sorgen dafür, dass Sie jeden Interessenten zur richtigen Zeit kontaktieren.",
  },
  {
    icon: TrendingUp,
    title: "Umsatz-Tracking",
    desc: "Verfolgen Sie Ihren Pipeline-Wert und gewonnenen Umsatz in Echtzeit. Wissen, was Ihr Betrieb wirklich wert ist.",
  },
  {
    icon: Users,
    title: "Für Handwerker gemacht",
    desc: "Speziell für Elektriker, Sanitär, Dachdecker und Heizungsbauer entwickelt — keine unnötigen Funktionen, nur was Sie brauchen.",
  },
  {
    icon: Shield,
    title: "DSGVO-konform",
    desc: "100% in Deutschland gehostet, vollständig DSGVO-konform. Ihre Kundendaten bleiben Ihre Kundendaten.",
  },
];

const TESTIMONIALS = [
  {
    name: "Klaus Bauer",
    company: "Bauer Elektro GmbH, Freiburg",
    quote: "Seit TradeLeads AI haben wir unsere Abschlussquote um 40% gesteigert. Keine verlorenen Leads mehr.",
    stars: 5,
  },
  {
    name: "Petra Hofmann",
    company: "Hofmann Dachbau, Mannheim",
    quote: "Endlich eine Software, die nicht für Großkonzerne gemacht ist. Einfach, schnell, effektiv.",
    stars: 5,
  },
  {
    name: "Thomas Richter",
    company: "Richter Heizung & Klima, Karlsruhe",
    quote: "Das Follow-up-System allein hat mir schon 3 Aufträge gerettet, die ich sonst vergessen hätte.",
    stars: 5,
  },
];

const PLANS = [
  {
    name: "Starter",
    price: "29",
    desc: "Für Einzelunternehmer und kleine Betriebe",
    features: ["Bis zu 50 Leads/Monat", "Pipeline-Ansicht", "E-Mail-Follow-ups", "Basis-Reporting"],
    cta: "Kostenlos testen",
    highlight: false,
  },
  {
    name: "Professional",
    price: "59",
    desc: "Für wachsende Handwerksbetriebe",
    features: ["Unbegrenzte Leads", "KI-Lead-Qualifizierung", "Automatische Follow-ups", "Umsatz-Tracking", "Prioritäts-Support"],
    cta: "Jetzt starten",
    highlight: true,
  },
  {
    name: "Team",
    price: "99",
    desc: "Für größere Betriebe und Teams",
    features: ["Alles aus Professional", "Bis zu 10 Nutzer", "Team-Zuweisung", "API-Zugang", "Dedizierter Support"],
    cta: "Kontakt aufnehmen",
    highlight: false,
  },
];

export default function Landing() {
  const { theme, toggle } = useTheme();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");

  const signupMutation = useMutation({
    mutationFn: () =>
      apiRequest("POST", "/api/intake", {
        name: name || "Interessent",
        company: "Interessent",
        email,
        phone: phone || "+49 000 0000000",
        trade: "other",
        location: "Deutschland",
        projectDescription: "Interesse an TradeLeads AI",
        status: "new",
        source: "landing",
      }),
    onSuccess: () => {
      toast({ title: "Vielen Dank! Wir melden uns in Kürze." });
      setEmail(""); setPhone(""); setName("");
    },
    onError: () => {
      toast({ title: "Fehler", description: "Bitte versuchen Sie es erneut.", variant: "destructive" });
    },
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white" stroke="currentColor" strokeWidth="2.5">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
            <span className="font-bold text-sm tracking-tight">TradeLeads <span className="text-primary">AI</span></span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/pricing")} className="text-sm text-muted-foreground hover:text-foreground hidden sm:block">Preise</button>
            <button onClick={toggle} className="text-muted-foreground hover:text-foreground" aria-label="Theme wechseln">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link href="/app">
              <Button size="sm" className="gap-1.5 text-xs">
                Dashboard <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Zap className="w-3 h-3" />
            KI-gestütztes Lead-Management für Handwerker
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto">
            Mehr Aufträge.<br />
            <span className="text-primary">Weniger Chaos.</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mt-6 max-w-2xl mx-auto leading-relaxed">
            TradeLeads AI ist die Vertriebssoftware für Elektriker, Sanitärbetriebe, Dachdecker und Heizungsbauer im DACH-Raum — einfach, automatisch, profitabel.
          </p>

          {/* CTA Hero form */}
          <div className="mt-10 max-w-lg mx-auto bg-card border border-border rounded-2xl p-6 shadow-lg text-left">
            <p className="text-sm font-semibold mb-4">Kostenlos 14 Tage testen — keine Kreditkarte nötig</p>
            <div className="space-y-3">
              <Input
                placeholder="Ihr Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                data-testid="input-hero-name"
              />
              <Input
                type="email"
                placeholder="E-Mail-Adresse"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid="input-hero-email"
              />
              <Button
                className="w-full gap-2 text-sm font-semibold"
                onClick={() => email && signupMutation.mutate()}
                disabled={signupMutation.isPending || !email}
                data-testid="button-hero-cta"
              >
                <Zap className="w-4 h-4" />
                {signupMutation.isPending ? "Wird registriert..." : "Jetzt kostenlos starten"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">DSGVO-konform · Made in Germany · Keine Bindung</p>
          </div>

          {/* Social proof */}
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="flex">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />)}
              </div>
              <span>4.9 von 5</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <span>200+ Betriebe vertrauen uns</span>
            <div className="w-px h-4 bg-border hidden sm:block" />
            <span className="hidden sm:block">DSGVO-konform</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black tracking-tight">Alles was Ihr Betrieb braucht</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Keine überflüssigen Funktionen — nur das, was Handwerker wirklich täglich nutzen.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-sm mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo CTA */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-black tracking-tight mb-4">Sehen Sie das Dashboard in Aktion</h2>
          <p className="text-muted-foreground mb-8">Testen Sie das vollständige System mit Demo-Daten — sofort, ohne Anmeldung.</p>
          <Link href="/app">
            <Button size="lg" className="gap-2 text-base font-semibold px-8" data-testid="button-demo">
              <BarChart3 className="w-5 h-5" />
              Live-Demo öffnen
            </Button>
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black tracking-tight">Was Handwerker sagen</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-card border border-border rounded-xl p-6">
                <div className="flex mb-3">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground italic leading-relaxed mb-4">"{t.quote}"</p>
                <div>
                  <p className="text-sm font-bold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black tracking-tight">Faire Preise. Keine Überraschungen.</h2>
            <p className="text-muted-foreground mt-3">Alle Pläne mit 14 Tagen kostenloser Testphase.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {PLANS.map((plan) => (
              <div key={plan.name} className={`rounded-xl border p-6 relative ${plan.highlight ? "border-primary shadow-lg bg-primary/5" : "border-border bg-card"}`}>
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">Beliebt</span>
                  </div>
                )}
                <h3 className="font-black text-lg">{plan.name}</h3>
                <div className="mt-2 mb-1">
                  <span className="text-4xl font-black">€{plan.price}</span>
                  <span className="text-muted-foreground text-sm">/Monat</span>
                </div>
                <p className="text-xs text-muted-foreground mb-5">{plan.desc}</p>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={plan.highlight ? "default" : "outline"}
                  onClick={() => navigate("/pricing")}
                  data-testid={`button-plan-${plan.name.toLowerCase()}`}
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-black tracking-tight mb-4">Bereit, mehr Aufträge zu gewinnen?</h2>
          <p className="text-white/80 mb-8 text-lg">Starten Sie heute kostenlos. Keine Kreditkarte. Keine Bindung.</p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Ihre E-Mail-Adresse"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 flex-1"
              data-testid="input-footer-email"
            />
            <Button
              variant="secondary"
              className="font-semibold whitespace-nowrap"
              onClick={() => email && signupMutation.mutate()}
              disabled={signupMutation.isPending || !email}
              data-testid="button-footer-cta"
            >
              Kostenlos starten
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-primary flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 text-white" stroke="currentColor" strokeWidth="2.5">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
            <span className="text-sm font-bold">TradeLeads AI</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 TradeLeads AI · DSGVO-konform · Made in Germany</p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground">Datenschutz</a>
            <a href="#" className="hover:text-foreground">Impressum</a>
            <a href="#" className="hover:text-foreground">AGB</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
