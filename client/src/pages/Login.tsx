import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Zap, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function Login({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/auth/login", { password }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      onSuccess();
    },
    onError: () => {
      toast({ title: "Falsches Passwort", variant: "destructive" });
      setPassword("");
    },
  });

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary shadow-md">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white" stroke="currentColor" strokeWidth="2.5">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight">TradeLeads <span className="text-primary">AI</span></h1>
            <p className="text-sm text-muted-foreground mt-1">Anmelden um fortzufahren</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Passwort</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Dashboard-Passwort"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && password && loginMutation.mutate()}
                className="pl-10"
                autoFocus
                data-testid="input-password"
              />
            </div>
          </div>
          <Button
            className="w-full gap-2"
            onClick={() => loginMutation.mutate()}
            disabled={!password || loginMutation.isPending}
            data-testid="button-login"
          >
            <Zap className="w-4 h-4" />
            {loginMutation.isPending ? "Anmelden..." : "Anmelden"}
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Ihr Dashboard ist passwortgeschützt und nicht öffentlich zugänglich.
        </p>
      </div>
    </div>
  );
}
