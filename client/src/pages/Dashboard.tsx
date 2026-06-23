import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { type Lead } from "@shared/schema";
import { TrendingUp, Users, CheckCircle, DollarSign, ArrowRight, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const TRADE_ICONS: Record<string, string> = {
  electrician: "⚡",
  plumber: "🔧",
  roofer: "🏠",
  hvac: "❄️",
  other: "🔨",
};

const STATUS_LABELS: Record<string, string> = {
  new: "Neu",
  contacted: "Kontaktiert",
  qualified: "Qualifiziert",
  proposal: "Angebot",
  won: "Gewonnen",
  lost: "Verloren",
};

function formatEuro(value: number) {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

function StatCard({ label, value, icon: Icon, color, sub }: {
  label: string; value: string | number; icon: any; color: string; sub?: string;
}) {
  return (
    <Card className="shadow-sm">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
          </div>
          <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats"],
    queryFn: () => apiRequest("GET", "/api/stats").then(r => r.json()),
  });

  const { data: leads, isLoading: leadsLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
    queryFn: () => apiRequest("GET", "/api/leads").then(r => r.json()),
  });

  const recentLeads = leads?.slice(0, 5) ?? [];

  const pipelineStages = [
    { key: "new", label: "Neu", color: "bg-blue-500" },
    { key: "contacted", label: "Kontaktiert", color: "bg-purple-500" },
    { key: "qualified", label: "Qualifiziert", color: "bg-amber-500" },
    { key: "proposal", label: "Angebot", color: "bg-orange-500" },
    { key: "won", label: "Gewonnen", color: "bg-green-500" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Übersicht</h1>
          <p className="text-sm text-muted-foreground">Willkommen zurück, Henri</p>
        </div>
        <Link href="/app/leads/new">
          <Button data-testid="button-add-lead" className="gap-2">
            <Zap className="w-4 h-4" />
            Neuer Lead
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="pt-6"><Skeleton className="h-16" /></CardContent></Card>
          ))
        ) : (
          <>
            <StatCard label="Gesamt Leads" value={stats?.total ?? 0} icon={Users} color="bg-primary" sub={`${stats?.new ?? 0} neu`} />
            <StatCard label="Gewonnen" value={stats?.won ?? 0} icon={CheckCircle} color="bg-green-600" sub={`${stats?.conversionRate ?? 0}% Conversion`} />
            <StatCard label="Pipeline-Wert" value={formatEuro(stats?.pipelineRevenue ?? 0)} icon={TrendingUp} color="bg-amber-500" sub="In Verhandlung" />
            <StatCard label="Umsatz (Gewonnen)" value={formatEuro(stats?.wonRevenue ?? 0)} icon={DollarSign} color="bg-blue-600" sub="Abgeschlossen" />
          </>
        )}
      </div>

      {/* Pipeline bar */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          {statsLoading ? <Skeleton className="h-8" /> : (
            <div className="space-y-3">
              <div className="flex gap-1 h-3 rounded-full overflow-hidden">
                {pipelineStages.map(({ key, color }) => {
                  const count = stats?.[key as keyof typeof stats] as number ?? 0;
                  const pct = stats?.total ? (count / stats.total) * 100 : 0;
                  return pct > 0 ? (
                    <div key={key} className={`${color} transition-all`} style={{ width: `${pct}%` }} title={`${key}: ${count}`} />
                  ) : null;
                })}
              </div>
              <div className="flex flex-wrap gap-3">
                {pipelineStages.map(({ key, label, color }) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${color}`} />
                    <span className="text-xs text-muted-foreground">{label}: <strong className="text-foreground">{stats?.[key as keyof typeof stats] ?? 0}</strong></span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent leads */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">Letzte Leads</CardTitle>
          <Link href="/app/leads">
            <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground">
              Alle anzeigen <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {leadsLoading ? (
            <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : (
            <div className="space-y-2">
              {recentLeads.map((lead) => (
                <Link key={lead.id} href={`/app/leads/${lead.id}`}>
                  <div
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    data-testid={`card-lead-${lead.id}`}
                  >
                    <div className="text-xl w-8 text-center flex-shrink-0">{TRADE_ICONS[lead.trade] ?? "🔨"}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{lead.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{lead.company} · {lead.location}</div>
                    </div>
                    <Badge className={`status-${lead.status} text-xs`} variant="outline">
                      {STATUS_LABELS[lead.status] ?? lead.status}
                    </Badge>
                  </div>
                </Link>
              ))}
              {recentLeads.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-6">Keine Leads vorhanden. <Link href="/app/leads/new"><span className="text-primary underline">Ersten Lead hinzufügen</span></Link></p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
