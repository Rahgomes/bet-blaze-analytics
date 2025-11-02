import { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { BarChart3, PlusCircle, Settings, TrendingUp, Wallet, Lightbulb, Eye, Upload, HelpCircle } from 'lucide-react';
import { LanguageToggle } from './LanguageToggle';
import { useTranslation } from '@/hooks/useTranslation';

interface BettingLayoutProps {
  children: ReactNode;
}

const getNavItems = (t: (key: string) => string) => [
  { path: '/', label: t('nav.dashboard'), icon: BarChart3 },
  { path: '/bets', label: t('nav.bets'), icon: Wallet },
  { path: '/add-bet', label: t('nav.addBet'), icon: PlusCircle },
  { path: '/analytics', label: t('nav.analytics'), icon: TrendingUp },
  { path: '/tips', label: t('nav.tips'), icon: Lightbulb },
  { path: '/watchlist', label: t('nav.watchlist'), icon: Eye },
  { path: '/import', label: t('nav.import'), icon: Upload },
  { path: '/faq', label: t('nav.faq'), icon: HelpCircle },
  { path: '/settings', label: t('nav.settings'), icon: Settings },
];

export function BettingLayout({ children }: BettingLayoutProps) {
  const [location] = useLocation();
  const { t } = useTranslation();
  const navItems = getNavItems(t);

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-64 border-r border-border bg-card">
        <div className="flex h-16 items-center justify-between border-b border-border px-6">
          <h1 className="text-xl font-bold text-foreground">{t('app.title')}</h1>
          <LanguageToggle />
        </div>
        <nav className="space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
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
