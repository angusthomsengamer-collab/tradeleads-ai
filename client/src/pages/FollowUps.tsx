import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type FollowUp, type Lead } from "@shared/schema";
import { CheckCircle2, Clock, Mail, Phone, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

const TYPE_ICONS: Record<string, any> = {
  email: Mail,
  call: Phone,
  sms: MessageSquare,
};

function formatDate(s: string) {
  const d = new Date(s);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  const days = Math.ceil(diff / 86400000);
  if (days === 0) return "Heute";
  if (days === 1) return "Morgen";
  if (days === -1) return "Gestern";
  if (days < 0) return `Vor ${Math.abs(days)} Tagen`;
  return `In ${days} Tagen`;
}

function formatFullDate(s: string) {
  return new Date(s).toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function FollowUps() {
  const { toast } = useToast();

  const { data: followUps = [], isLoading } = useQuery<FollowUp[]>({
    queryKey: ["/api/followups"],
    queryFn: () => apiRequest("GET", "/api/followups").then(r => r.json()),
  });

  const { data: leads = [] } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
    queryFn: () => apiRequest("GET", "/api/leads").then(r => r.json()),
  });

  const completeMutation = useMutation({
    mutationFn: (id: number) => apiRequest("PATCH", `/api/followups/${id}/complete`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/followups"] });
      toast({ title: "Follow-up als erledigt markiert" });
    },
  });

  const leadMap = Object.fromEntries(leads.map((l) => [l.id, l]));

  const pending = followUps.filter((f) => !f.completed);
  const done = followUps.filter((f) => f.completed);

  const isOverdue = (f: FollowUp) => !f.completed && new Date(f.scheduledAt) < new Date();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Follow-ups</h1>
        <p className="text-sm text-muted-foreground">{pending.length} offen · {done.length} erledigt</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : pending.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-3" />
            <p className="font-medium">Alle Follow-ups erledigt!</p>
            <p className="text-sm text-muted-foreground mt-1">Neue werden automatisch aus dem Lead-System generiert.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {pending.map((fu) => {
            const lead = leadMap[fu.leadId];
            const Icon = TYPE_ICONS[fu.type] ?? Mail;
            const overdue = isOverdue(fu);
            return (
              <Card key={fu.id} className={`shadow-sm border ${overdue ? "border-destructive/40" : ""}`} data-testid={`card-followup-${fu.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${overdue ? "bg-destructive/10" : "bg-primary/10"}`}>
                      <Icon className={`w-4 h-4 ${overdue ? "text-destructive" : "text-primary"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{fu.message}</p>
                      {lead && (
                        <Link href={`/app/leads/${lead.id}`}>
                          <p className="text-xs text-primary hover:underline mt-0.5">{lead.name} · {lead.company}</p>
                        </Link>
                      )}
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge variant="outline" className="text-xs">{fu.type.toUpperCase()}</Badge>
                        <div className={`flex items-center gap-1 text-xs ${overdue ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                          <Clock className="w-3 h-3" />
                          {formatDate(fu.scheduledAt)} · {formatFullDate(fu.scheduledAt)}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-shrink-0 gap-1.5 text-xs"
                      onClick={() => completeMutation.mutate(fu.id)}
                      disabled={completeMutation.isPending}
                      data-testid={`button-complete-followup-${fu.id}`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Erledigt
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {done.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Erledigt ({done.length})</h2>
          {done.map((fu) => {
            const lead = leadMap[fu.leadId];
            const Icon = TYPE_ICONS[fu.type] ?? Mail;
            return (
              <Card key={fu.id} className="shadow-sm opacity-50" data-testid={`card-done-followup-${fu.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-through text-muted-foreground">{fu.message}</p>
                      {lead && <p className="text-xs text-muted-foreground">{lead.name} · {lead.company}</p>}
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
