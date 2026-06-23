import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertLeadSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const formSchema = insertLeadSchema.extend({
  name: z.string().min(2, "Name muss mindestens 2 Zeichen haben"),
  email: z.string().email("Ungültige E-Mail-Adresse"),
  phone: z.string().min(6, "Telefonnummer erforderlich"),
  company: z.string().min(2, "Firmenname erforderlich"),
  location: z.string().min(2, "Ort erforderlich"),
  projectDescription: z.string().min(10, "Beschreibung zu kurz"),
});

type FormData = z.infer<typeof formSchema>;

export default function NewLead() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      company: "",
      email: "",
      phone: "",
      trade: "electrician",
      location: "",
      projectDescription: "",
      budget: "",
      status: "new",
      source: "website",
      notes: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => apiRequest("POST", "/api/leads", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ title: "Lead erfolgreich angelegt!" });
      navigate("/app/leads");
    },
    onError: () => {
      toast({ title: "Fehler", description: "Lead konnte nicht gespeichert werden.", variant: "destructive" });
    },
  });

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/app/leads">
          <Button variant="ghost" size="icon" className="w-8 h-8">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Neuer Lead</h1>
          <p className="text-sm text-muted-foreground">Neuen Interessenten manuell erfassen</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Kontaktdaten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl><Input placeholder="Max Mustermann" {...field} data-testid="input-name" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="company" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Firma *</FormLabel>
                    <FormControl><Input placeholder="Mustermann GmbH" {...field} data-testid="input-company" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-Mail *</FormLabel>
                    <FormControl><Input placeholder="max@firma.de" type="email" {...field} data-testid="input-email" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefon *</FormLabel>
                    <FormControl><Input placeholder="+49 123 456789" {...field} data-testid="input-phone" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Projektdetails</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="trade" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gewerk *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-trade">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="electrician">⚡ Elektriker</SelectItem>
                        <SelectItem value="plumber">🔧 Sanitär</SelectItem>
                        <SelectItem value="roofer">🏠 Dachdecker</SelectItem>
                        <SelectItem value="hvac">❄️ Heizung / Klima</SelectItem>
                        <SelectItem value="other">🔨 Sonstiges</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="location" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ort *</FormLabel>
                    <FormControl><Input placeholder="Freiburg, Baden-Württemberg" {...field} data-testid="input-location" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="budget" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget (€)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ""}>
                      <FormControl>
                        <SelectTrigger data-testid="select-budget">
                          <SelectValue placeholder="Budget wählen" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0-5000">Bis €5.000</SelectItem>
                        <SelectItem value="5000-10000">€5.000 – €10.000</SelectItem>
                        <SelectItem value="10000-20000">€10.000 – €20.000</SelectItem>
                        <SelectItem value="20000-35000">€20.000 – €35.000</SelectItem>
                        <SelectItem value="35000-50000">€35.000 – €50.000</SelectItem>
                        <SelectItem value="50000-100000">€50.000+</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="source" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quelle</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? "website"}>
                      <FormControl>
                        <SelectTrigger data-testid="select-source">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="google">Google Ads</SelectItem>
                        <SelectItem value="referral">Empfehlung</SelectItem>
                        <SelectItem value="cold-email">Cold E-Mail</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="projectDescription" render={({ field }) => (
                <FormItem>
                  <FormLabel>Projektbeschreibung *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Beschreibe das Projekt, Umfang, Besonderheiten..."
                      rows={4}
                      {...field}
                      data-testid="textarea-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem>
                  <FormLabel>Interne Notizen</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nur intern sichtbar..."
                      rows={2}
                      {...field}
                      data-testid="textarea-notes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          <div className="flex gap-3 justify-end">
            <Link href="/app/leads">
              <Button variant="outline" type="button">Abbrechen</Button>
            </Link>
            <Button type="submit" disabled={mutation.isPending} className="gap-2" data-testid="button-submit-lead">
              <Save className="w-4 h-4" />
              {mutation.isPending ? "Speichern..." : "Lead speichern"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
