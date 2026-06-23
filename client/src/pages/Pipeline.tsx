import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type Lead } from "@shared/schema";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const STAGES = [
  { key: "new", label: "Neu", color: "bg-blue-500", lightBg: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900" },
  { key: "contacted", label: "Kontaktiert", color: "bg-purple-500", lightBg: "bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900" },
  { key: "qualified", label: "Qualifiziert", color: "bg-amber-500", lightBg: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900" },
  { key: "proposal", label: "Angebot", color: "bg-orange-500", lightBg: "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900" },
  { key: "won", label: "Gewonnen", color: "bg-green-500", lightBg: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900" },
];

const TRADE_ICONS: Record<string, string> = { electrician: "⚡", plumber: "🔧", roofer: "🏠", hvac: "❄️", other: "🔨" };

function formatBudget(b: string | null) {
  if (!b) return null;
  const parts = b.split("-").map(Number);
  const mid = parts.length === 2 ? (parts[0] + parts[1]) / 2 : parts[0];
  return `€${(mid / 1000).toFixed(0)}k`;
}

export default function Pipeline() {
  const { toast } = useToast();
  const { data: leads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
    queryFn: () => apiRequest("GET", "/api/leads").then(r => r.json()),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      apiRequest("PATCH", `/api/leads/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
  });

  const byStatus = (status: string) => leads.filter((l) => l.status === status);

  const handleDrop = (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    const id = Number(e.dataTransfer.getData("leadId"));
    if (!id) return;
    updateMutation.mutate({ id, status: targetStatus });
    toast({ title: `Lead nach "${STAGES.find(s => s.key === targetStatus)?.label}" verschoben` });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Pipeline</h1>
        <p className="text-sm text-muted-foreground">Leads per Drag & Drop zwischen den Phasen verschieben</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {STAGES.map((s) => <Skeleton key={s.key} className="h-96" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
          {STAGES.map((stage) => {
            const stageLeads = byStatus(stage.key);
            return (
              <div
                key={stage.key}
                className="space-y-2"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, stage.key)}
                data-testid={`column-${stage.key}`}
              >
                {/* Column header */}
                <div className={`rounded-lg border p-3 ${stage.lightBg}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${stage.color}`} />
                      <span className="text-xs font-semibold uppercase tracking-wide">{stage.label}</span>
                    </div>
                    <span className="text-xs font-bold bg-white/70 dark:bg-black/20 px-1.5 py-0.5 rounded">
                      {stageLeads.length}
                    </span>
                  </div>
                </div>

                {/* Cards */}
                <div className="space-y-2 min-h-24">
                  {stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData("leadId", String(lead.id))}
                      className="cursor-grab active:cursor-grabbing"
                      data-testid={`card-pipeline-${lead.id}`}
                    >
                      <Link href={`/app/leads/${lead.id}`}>
                        <Card className="shadow-sm hover:shadow-md transition-shadow border">
                          <CardContent className="p-3 space-y-2">
                            <div className="flex items-start justify-between gap-1">
                              <span className="text-base">{TRADE_ICONS[lead.trade]}</span>
                              {lead.budget && (
                                <span className="text-xs font-semibold text-muted-foreground">
                                  {formatBudget(lead.budget)}
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="text-xs font-semibold leading-tight">{lead.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{lead.company}</p>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{lead.location}</p>
                          </CardContent>
                        </Card>
                      </Link>
                    </div>
                  ))}
                  {stageLeads.length === 0 && (
                    <div className="border-2 border-dashed border-border rounded-lg h-16 flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">Leer</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
