import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import { ProtectedRoute } from "@/components/protected-route";
import { AppLayout } from "@/components/layout/app-layout";
import NotFound from "@/pages/not-found";

import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import Log from "@/pages/log";
import Foods from "@/pages/foods";
import Meals from "@/pages/meals";
import Planner from "@/pages/planner";
import Progress from "@/pages/progress";
import Profile from "@/pages/profile";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      {/* Protected Routes wrapped in Layout */}
      <Route path="/dashboard">
        <ProtectedRoute component={() => <AppLayout><Dashboard /></AppLayout>} />
      </Route>
      <Route path="/log">
        <ProtectedRoute component={() => <AppLayout><Log /></AppLayout>} />
      </Route>
      <Route path="/foods">
        <ProtectedRoute component={() => <AppLayout><Foods /></AppLayout>} />
      </Route>
      <Route path="/meals">
        <ProtectedRoute component={() => <AppLayout><Meals /></AppLayout>} />
      </Route>
      <Route path="/planner">
        <ProtectedRoute component={() => <AppLayout><Planner /></AppLayout>} />
      </Route>
      <Route path="/progress">
        <ProtectedRoute component={() => <AppLayout><Progress /></AppLayout>} />
      </Route>
      <Route path="/profile">
        <ProtectedRoute component={() => <AppLayout><Profile /></AppLayout>} />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="nutriplan-theme">
        <AuthProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
