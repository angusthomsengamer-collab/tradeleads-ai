import { Check, Zap, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    key: "starter",
    name: "Starter",
    price: 29,
    icon: Zap,
    description: "Ideal für Einzelunternehmer und kleine Betriebe",
    paymentLink: "https://buy.stripe.com/6oUeV5fY61H12KL0YMejK02",
    features: [
      "Bis zu 50 Leads/Monat",
      "KI-Qualifizierung",
      "E-Mail-Benachrichtigungen",
      "CRM Dashboard",
      "14 Tage kostenlos testen",
    ],
    highlighted: false,
    cta: "Starter wählen",
  },
  {
    key: "professional",
    name: "Professional",
    price: 59,
    icon: Star,
    description: "Für wachsende Betriebe mit aktivem Vertrieb",
    paymentLink: "https://buy.stripe.com/4gMcMXeU21H15WX7naejK01",
    features: [
      "Bis zu 200 Leads/Monat",
      "KI-Qualifizierung + Scoring",
      "Follow-up Automatisierung",
      "CRM Dashboard",
      "Täglicher Digest",
      "Prioritäts-Support",
      "14 Tage kostenlos testen",
    ],
    highlighted: true,
    cta: "Professional wählen",
  },
  {
    key: "team",
    name: "Team",
    price: 99,
    icon: Users,
    description: "Für Betriebe mit mehreren Mitarbeitern",
    paymentLink: "https://buy.stripe.com/bJe28jeU24TdgBB0YMejK00",
    features: [
      "Unbegrenzte Leads",
      "Alles aus Professional",
      "Team-Zugänge (5 Nutzer)",
      "API-Zugang",
      "Dedicated Account Manager",
      "14 Tage kostenlos testen",
    ],
    highlighted: false,
    cta: "Team wählen",
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-16 px-4 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest mb-3 text-primary-foreground/70">Preise</p>
        <h1 className="text-3xl font-bold mb-4">Einfache, transparente Preise</h1>
        <p className="text-primary-foreground/80 max-w-xl mx-auto">
          Kein Vertrag, keine versteckten Kosten. 14 Tage kostenlos testen — dann monatlich kündbar.
        </p>
      </div>

      {/* Plans */}
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.key}
                className={`relative rounded-2xl border p-6 flex flex-col ${
                  plan.highlighted
                    ? "border-primary bg-primary/5 shadow-lg ring-2 ring-primary"
                    : "border-border bg-card"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                      Beliebteste Wahl
                    </span>
                  </div>
                )}

                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                  plan.highlighted ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                }`}>
                  <Icon className="w-5 h-5" />
                </div>

                <h2 className="text-lg font-bold text-foreground">{plan.name}</h2>
                <p className="text-sm text-muted-foreground mt-1 mb-4">{plan.description}</p>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold text-foreground">€{plan.price}</span>
                  <span className="text-muted-foreground text-sm">/Monat</span>
                </div>

                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                      <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <a
                  href={plan.paymentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button
                    variant={plan.highlighted ? "default" : "outline"}
                    className="w-full"
                  >
                    {plan.cta}
                  </Button>
                </a>
              </div>
            );
          })}
        </div>

        {/* Trust signals */}
        <div className="mt-12 text-center text-sm text-muted-foreground space-y-2">
          <p>✓ Keine Kreditkarte für den Test nötig &nbsp;·&nbsp; ✓ Monatlich kündbar &nbsp;·&nbsp; ✓ DSGVO-konform</p>
          <p>Fragen? <a href="mailto:support@tradeleadsai.de" className="text-primary underline">support@tradeleadsai.de</a></p>
        </div>
      </div>
    </div>
  );
}
