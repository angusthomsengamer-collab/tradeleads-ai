import { useEffect } from "react";
import { useLocation } from "wouter";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const planNames: Record<string, string> = {
  starter: "Starter",
  professional: "Professional",
  team: "Team",
};

export default function Success() {
  const [, navigate] = useLocation();
  const params = new URLSearchParams(window.location.hash.split("?")[1] ?? "");
  const plan = params.get("plan") ?? "starter";

  // If we're on pplx.app, redirect to the real domain preserving the plan param
  useEffect(() => {
    if (window.location.hostname.includes("pplx.app")) {
      window.location.replace(`https://tradeleadsai.de/#/success?plan=${plan}`);
    }
  }, [plan]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-3">
          Willkommen bei TradeLeads AI!
        </h1>
        <p className="text-muted-foreground mb-2">
          Dein <strong className="text-foreground">{planNames[plan] ?? "Starter"}</strong>-Plan ist aktiv.
        </p>
        <p className="text-muted-foreground text-sm mb-8">
          Du erhältst in Kürze eine Bestätigungs-E-Mail. Deine 14-tägige Testphase beginnt jetzt — viel Erfolg!
        </p>

        <div className="space-y-3">
          <Button
            className="w-full"
            onClick={() => navigate("/app")}
            data-testid="button-go-to-dashboard"
          >
            Zum Dashboard →
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/")}
            data-testid="button-go-to-home"
          >
            Zurück zur Startseite
          </Button>
        </div>
      </div>
    </div>
  );
}
