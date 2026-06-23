import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type Lead } from "@shared/schema";
import { Plus, Search, Filter, Trash2, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const TRADE_ICONS: Record<string, string> = {
  electrician: "⚡",
  plumber: "🔧",
  roofer: "🏠",
  hvac: "❄️",
  other: "🔨",
};

const TRADE_LABELS: Record<string, string> = {
  electrician: "Elektriker",
  plumber: "Sanitär",
  roofer: "Dachdecker",
  hvac: "Heizung/Klima",
  other: "Sonstiges",
};

const STATUS_LABELS: Record<string, string> = {
  new: "Neu",
  contacted: "Kontaktiert",
  qualified: "Qualifiziert",
  proposal: "Angebot",
  won: "Gewonnen",
  lost: "Verloren",
};

export default function Leads() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterTrade, setFilterTrade] = useState("all");
  const { toast } = useToast();

  const { data: leads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
    queryFn: () => apiRequest("GET", "/api/leads").then(r => r.json()),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/leads/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ title: "Lead gelöscht" });
    },
  });

  const filtered = leads.filter((l) => {
    const matchSearch =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.company.toLowerCase().includes(search.toLowerCase()) ||
      l.location.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || l.status === filterStatus;
    const matchTrade = filterTrade === "all" || l.trade === filterTrade;
    return matchSearch && matchStatus && matchTrade;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Leads</h1>
          <p className="text-sm text-muted-foreground">{leads.length} Leads insgesamt</p>
        </div>
        <Link href="/app/leads/new">
          <Button data-testid="button-new-lead" className="gap-2">
            <Plus className="w-4 h-4" /> Neuer Lead
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Suche nach Name, Firma, Ort..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-search-leads"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40" data-testid="select-filter-status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterTrade} onValueChange={setFilterTrade}>
          <SelectTrigger className="w-44" data-testid="select-filter-trade">
            <SelectValue placeholder="Gewerk" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Gewerke</SelectItem>
            {Object.entries(TRADE_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">
              Keine Leads gefunden.
              {search || filterStatus !== "all" || filterTrade !== "all"
                ? " Filter anpassen."
                : " Ersten Lead hinzufügen."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left font-medium text-muted-foreground px-4 py-3 w-8"></th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-3">Name / Firma</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Gewerk</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Ort</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Budget</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-3">Status</th>
                    <th className="px-4 py-3 w-24"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((lead) => (
                    <tr key={lead.id} className="border-b border-border hover:bg-muted/30 transition-colors" data-testid={`row-lead-${lead.id}`}>
                      <td className="px-4 py-3 text-lg">{TRADE_ICONS[lead.trade] ?? "🔨"}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{lead.name}</div>
                        <div className="text-xs text-muted-foreground">{lead.company}</div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                        {TRADE_LABELS[lead.trade] ?? lead.trade}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">{lead.location}</td>
                      <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                        {lead.budget ? `€${lead.budget.replace("-", "–")}` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={`status-${lead.status}`} variant="outline">
                          {STATUS_LABELS[lead.status] ?? lead.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <Link href={`/app/leads/${lead.id}`}>
                            <Button variant="ghost" size="icon" className="w-8 h-8" data-testid={`button-view-lead-${lead.id}`}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 text-destructive hover:text-destructive"
                            onClick={() => {
                              if (confirm("Lead wirklich löschen?")) {
                                deleteMutation.mutate(lead.id);
                              }
                            }}
                            data-testid={`button-delete-lead-${lead.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
