import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Sidebar } from "./components/Sidebar";

// --- MOTOR DE DADOS ---
import { QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { queryClient } from "./lib/queryClient";
import { trpc } from "./lib/trpc";

// Pages
import Inbox from "./pages/Inbox";
import Chat from "./pages/Chat";
import Connections from "./pages/Connections";
import Contacts from "./pages/Contacts";
import QuickReplies from "./pages/QuickReplies";
import ScheduledMessages from "./pages/ScheduledMessages";
import Leads from "./pages/Leads";
import Orders from "./pages/Orders";
import Products from "./pages/Products";
import ProductsInventory from "./pages/ProductsInventory";
import Referrals from "./pages/Referrals";
import Dashboard from "./pages/Dashboard";
import Schedule from "./pages/Schedule";
import ManagerDashboard from "./pages/ManagerDashboard";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";

function Router() {
  const [location, setLocation] = useLocation();

  // Verifica se está na página de login
  const isLoginPage = location === "/login";

  // Lógica de Proteção: Se não tiver usuário e não estiver no login, manda pro login
  useEffect(() => {
    const user = localStorage.getItem("manus-runtime-user-info");
    
    // Se não tem usuário E não está na página de login, redireciona
    if (!user && !isLoginPage) {
      setLocation("/login");
    }
  }, [location, setLocation, isLoginPage]);

  return (
    <div className="flex h-screen bg-background">
      {/* Esconde a Sidebar se estiver na tela de Login */}
      {!isLoginPage && <Sidebar />}

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <Switch>
          {/* Rota de Login (Primeira da lista para garantir) */}
          <Route path="/login" component={Login} />

          {/* Rotas do Sistema */}
          <Route path="/" component={Inbox} />
          <Route path="/inbox" component={Inbox} />
          <Route path="/chat" component={Chat} />
          <Route path="/chat/:id" component={Chat} />
          <Route path="/connections" component={Connections} />
          <Route path="/contacts" component={Contacts} />
          <Route path="/quick-replies" component={QuickReplies} />
          <Route path="/scheduled-messages" component={ScheduledMessages} />
          <Route path="/leads" component={Leads} />
          <Route path="/orders" component={Orders} />
          <Route path="/products" component={Products} />
          <Route path="/products-inventory" component={ProductsInventory} />
          <Route path="/referrals" component={Referrals} />
          <Route path="/schedule" component={Schedule} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/manager" component={ManagerDashboard} />
          <Route path="/settings" component={Settings} />
          
          {/* Rota 404 */}
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "/api/trpc",
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <ThemeProvider defaultTheme="light" switchable>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

export default App;