import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch } from "wouter";
import { BettingLayout } from "./components/betting/BettingLayout";
import { TranslationProvider } from "./hooks/useTranslation";
import { queryClient } from "@/lib/queryClient";
import Dashboard from "./pages/Dashboard";
import BetsList from "./pages/BetsList";
import AddBet from "./pages/AddBet";
import BankrollSettings from "./pages/BankrollSettings";
import DepositsHistory from "./pages/DepositsHistory";
import WithdrawalsHistory from "./pages/WithdrawalsHistory";
import Analytics from "./pages/Analytics";
import Watchlist from "./pages/Watchlist";
import WatchlistTeams from "./pages/WatchlistTeams";
import Import from "./pages/Import";
import ImportPreview from "./pages/ImportPreview";
import ImportHistory from "./pages/ImportHistory";
import FAQ from "./pages/FAQ";
import NotFound from "./pages/NotFound";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TranslationProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BettingLayout>
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/bets" component={BetsList} />
            <Route path="/add-bet" component={AddBet} />
            <Route path="/analytics" component={Analytics} />
            <Route path="/watchlist" component={Watchlist} />
            <Route path="/watchlist/teams" component={WatchlistTeams} />
            <Route path="/import" component={Import} />
            <Route path="/import/preview" component={ImportPreview} />
            <Route path="/import/history" component={ImportHistory} />
            <Route path="/faq" component={FAQ} />
            <Route path="/settings" component={BankrollSettings} />
            <Route path="/settings/deposits-history" component={DepositsHistory} />
            <Route path="/settings/withdrawals-history" component={WithdrawalsHistory} />
            <Route component={NotFound} />
          </Switch>
        </BettingLayout>
      </TooltipProvider>
    </TranslationProvider>
  </QueryClientProvider>
);

export default App;
