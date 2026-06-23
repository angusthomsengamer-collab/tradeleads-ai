import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type Lead, type FollowUp } from "@shared/schema";
import { ArrowLeft, Mail, Phone, MapPin, Euro, Calendar, Edit2, Check, X } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const TRADE_ICONS: Record<string, string> = { electrician: "⚡", plumber: "🔧", roofer: "🏠", hvac: "❄️", other: "🔨" };
const TRADE_LABELS: Record<string, string> = { electrician: "Elektriker", plumber: "Sanitär", roofer: "Dachdecker", hvac: "Heizung/Klima", other: "Sonstiges" };
const STATUS_LABELS: Record<string, string> = { new: "Neu", contacted: "Kontaktiert", qualified: "Qualifiziert", proposal: "Angebot", won: "Gewonnen", lost: "Verloren" };

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function LeadDetail({ id }: { id: number }) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState("");

  const { data: lead, isLoading } = useQuery<Lead>({
    queryKey: ["/api/leads", id],
    queryFn: () => apiRequest("GET", `/api/leads/${id}`).then(r => r.json()),
    onSuccess: (d: Lead) => setNotes(d.notes ?? ""),
  });

  const { data: followUps = [] } = useQuery<FollowUp[]>({
    queryKey: ["/api/followups", id],
    queryFn: () => apiRequest("GET", `/api/followups?leadId=${id}`).then(r => r.json()),
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => apiRequest("PATCH", `/api/leads/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ title: "Status aktualisiert" });
    },
  });

  const notesMutation = useMutation({
    mutationFn: (notes: string) => apiRequest("PATCH", `/api/leads/${id}`, { notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads", id] });
      setEditingNotes(false);
      toast({ title: "Notizen gespeichert" });
    },
  });

  const completeMutation = useMutation({
    mutationFn: (fuId: number) => apiRequest("PATCH", `/api/followups/${fuId}/complete`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/followups", id] });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-3xl">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-48" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Lead nicht gefunden.</p>
        <Link href="/app/leads"><Button className="mt-4">Zurück</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/app/leads">
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{TRADE_ICONS[lead.trade]}</span>
              <h1 className="text-xl font-bold tracking-tight">{lead.name}</h1>
            </div>
            <p className="text-sm text-muted-foreground">{lead.company}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={lead.status} onValueChange={(v) => statusMutation.mutate(v)}>
            <SelectTrigger className="w-40" data-testid="select-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Contact info */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Kontaktdaten</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <a href={`mailto:${lead.email}`} className="flex items-center gap-2 text-primary hover:underline">
              <Mail className="w-4 h-4 flex-shrink-0" />
              {lead.email}
            </a>
            <a href={`tel:${lead.phone}`} className="flex items-center gap-2 text-primary hover:underline">
              <Phone className="w-4 h-4 flex-shrink-0" />
              {lead.phone}
            </a>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              {lead.location}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Euro className="w-4 h-4 flex-shrink-0" />
              {lead.budget ? `€${lead.budget.replace("-", " – ")}` : "Kein Budget angegeben"}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              Erstellt: {formatDate(lead.createdAt)}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{TRADE_LABELS[lead.trade]}</Badge>
              <Badge variant="outline" className="capitalize">{lead.source}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Projektbeschreibung</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">{lead.projectDescription}</p>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base">Interne Notizen</CardTitle>
          {!editingNotes ? (
            <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => { setNotes(lead.notes ?? ""); setEditingNotes(true); }} data-testid="button-edit-notes">
              <Edit2 className="w-3 h-3" /> Bearbeiten
            </Button>
          ) : (
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => setEditingNotes(false)}>
                <X className="w-3 h-3" />
              </Button>
              <Button size="icon" className="w-7 h-7" onClick={() => notesMutation.mutate(notes)} data-testid="button-save-notes">
                <Check className="w-3 h-3" />
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {editingNotes ? (
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Notizen..."
              data-testid="textarea-edit-notes"
            />
          ) : (
            <p className="text-sm text-muted-foreground">{lead.notes || "Keine Notizen vorhanden."}</p>
          )}
        </CardContent>
      </Card>

      {/* Follow-ups */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Follow-ups</CardTitle>
        </CardHeader>
        <CardContent>
          {followUps.length === 0 ? (
            <p className="text-sm text-muted-foreground">Keine Follow-ups geplant.</p>
          ) : (
            <div className="space-y-2">
              {followUps.map((fu) => (
                <div key={fu.id} className={`flex items-start gap-3 p-3 rounded-lg border ${fu.completed ? "opacity-50 bg-muted/30" : "bg-card"}`} data-testid={`card-followup-${fu.id}`}>
                  <button
                    onClick={() => !fu.completed && completeMutation.mutate(fu.id)}
                    className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 ${fu.completed ? "bg-primary border-primary" : "border-muted-foreground hover:border-primary"}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${fu.completed ? "line-through text-muted-foreground" : ""}`}>{fu.message}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {fu.type.toUpperCase()} · {formatDate(fu.scheduledAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
