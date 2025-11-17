import { ReactNode, useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { BarChart3, PlusCircle, Settings, TrendingUp, Wallet, Lightbulb, Eye, Upload, HelpCircle, ChevronLeft, ChevronRight, Bell, User } from 'lucide-react';
import { LanguageToggle } from './LanguageToggle';
import { useTranslation } from '@/hooks/useTranslation';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isTopbarVisible, setIsTopbarVisible] = useState(true);
  const lastScrollY = useRef(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!scrollContainerRef.current || ticking) return;

      ticking = true;

      window.requestAnimationFrame(() => {
        if (!scrollContainerRef.current) {
          ticking = false;
          return;
        }

        const currentScrollY = scrollContainerRef.current.scrollTop;
        const scrollDifference = currentScrollY - lastScrollY.current;

        if (currentScrollY < 10) {
          setIsTopbarVisible(true);
          lastScrollY.current = currentScrollY;
          ticking = false;
          return;
        }

        if (Math.abs(scrollDifference) > 5) {
          if (scrollDifference > 0 && currentScrollY > 64) {
            setIsTopbarVisible(false);
          } else if (scrollDifference < 0) {
            setIsTopbarVisible(true);
          }
          lastScrollY.current = currentScrollY;
        }

        ticking = false;
      });
    };

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      <motion.aside
        initial={false}
        animate={{
          width: isCollapsed ? 80 : 256
        }}
        transition={{
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1]
        }}
        className="fixed left-0 top-0 z-40 h-screen border-r border-border bg-card"
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <motion.h1
            animate={{
              opacity: isCollapsed ? 0 : 1,
              display: isCollapsed ? 'none' : 'block'
            }}
            transition={{ duration: 0.2 }}
            className="text-xl font-bold text-foreground"
          >
            {t('app.title')}
          </motion.h1>

          <motion.h1
            animate={{
              opacity: isCollapsed ? 1 : 0,
              display: isCollapsed ? 'block' : 'none'
            }}
            transition={{ duration: 0.2 }}
            className="text-xl font-bold text-foreground"
          >
            G.A
          </motion.h1>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 z-10 h-6 w-6 rounded-full border border-border bg-card shadow-md hover:bg-accent"
          data-testid="button-toggle-sidebar"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>

        <nav className="space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            if (isCollapsed) {
              return (
                <Tooltip key={item.path} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.path}
                      className={cn(
                        'flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      )}
                      data-testid={`link-${item.path === '/' ? 'dashboard' : item.path.slice(1)}`}
                    >
                      <Icon className="h-5 w-5" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

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
                data-testid={`link-${item.path === '/' ? 'dashboard' : item.path.slice(1)}`}
              >
                <Icon className="h-5 w-5" />
                <motion.span
                  animate={{
                    opacity: isCollapsed ? 0 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {item.label}
                </motion.span>
              </Link>
            );
          })}
        </nav>
      </motion.aside>

      {/* Topbar fixa */}
      <motion.header
        animate={{
          paddingLeft: isCollapsed ? 80 : 256,
          y: isTopbarVisible ? 0 : -64,
        }}
        transition={{
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1]
        }}
        className="fixed top-0 left-0 right-0 z-30 h-16 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60"
      >
        <div className="flex h-full items-center justify-end gap-4 px-6">
          {/* Ícone de Tradução */}
          <LanguageToggle />

          {/* Placeholder para futuras funcionalidades */}
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Bell className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Notificações (em breve)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <User className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Perfil (em breve)</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </motion.header>

      <motion.main
        ref={scrollContainerRef}
        animate={{
          marginLeft: isCollapsed ? 80 : 256
        }}
        transition={{
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1]
        }}
        className="flex-1 overflow-auto pt-16"
      >
        <div className="container mx-auto p-6">
          {children}
        </div>
      </motion.main>
    </div>
  );
}
