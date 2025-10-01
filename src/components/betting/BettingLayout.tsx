import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { BarChart3, PlusCircle, Settings, TrendingUp, Wallet } from 'lucide-react';

interface BettingLayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/', label: 'Dashboard', icon: BarChart3 },
  { path: '/bets', label: 'Bets', icon: Wallet },
  { path: '/add-bet', label: 'Add Bet', icon: PlusCircle },
  { path: '/analytics', label: 'Analytics', icon: TrendingUp },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function BettingLayout({ children }: BettingLayoutProps) {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-64 border-r border-border bg-card">
        <div className="flex h-16 items-center border-b border-border px-6">
          <h1 className="text-xl font-bold text-foreground">Betting Tracker</h1>
        </div>
        <nav className="space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
