import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BettingLayout } from "./components/betting/BettingLayout";
import Dashboard from "./pages/Dashboard";
import BetsList from "./pages/BetsList";
import AddBet from "./pages/AddBet";
import BankrollSettings from "./pages/BankrollSettings";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <BettingLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/bets" element={<BetsList />} />
            <Route path="/add-bet" element={<AddBet />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<BankrollSettings />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BettingLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
