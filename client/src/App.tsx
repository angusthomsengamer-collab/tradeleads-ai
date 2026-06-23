import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AppShell } from "@/components/AppShell";
import Dashboard from "@/pages/Dashboard";
import Leads from "@/pages/Leads";
import LeadDetail from "@/pages/LeadDetail";
import NewLead from "@/pages/NewLead";
import Pipeline from "@/pages/Pipeline";
import FollowUps from "@/pages/FollowUps";
import Landing from "@/pages/Landing";
import Pricing from "@/pages/Pricing";
import Success from "@/pages/Success";
import NotFound from "@/pages/not-found";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router hook={useHashLocation}>
          <Switch>
            <Route path="/" component={Landing} />
            <Route path="/pricing" component={Pricing} />
            <Route path="/success" component={Success} />
            <Route path="/app" component={() => (
              <AppShell>
                <Dashboard />
              </AppShell>
            )} />
            <Route path="/app/leads" component={() => (
              <AppShell>
                <Leads />
              </AppShell>
            )} />
            <Route path="/app/leads/new" component={() => (
              <AppShell>
                <NewLead />
              </AppShell>
            )} />
            <Route path="/app/leads/:id" component={({ params }) => (
              <AppShell>
                <LeadDetail id={Number(params.id)} />
              </AppShell>
            )} />
            <Route path="/app/pipeline" component={() => (
              <AppShell>
                <Pipeline />
              </AppShell>
            )} />
            <Route path="/app/followups" component={() => (
              <AppShell>
                <FollowUps />
              </AppShell>
            )} />
            <Route component={NotFound} />
          </Switch>
        </Router>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
