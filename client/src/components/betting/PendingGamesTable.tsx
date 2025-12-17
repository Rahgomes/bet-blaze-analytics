import { useTranslation } from '@/hooks/useTranslation';
import { Bet } from '@/types/betting';
import { PendingGame } from '@/utils/exposureCalculations';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MoreVertical, Eye, List, Trophy } from 'lucide-react';

interface PendingGamesTableProps {
  games: PendingGame[];
  onViewBet: (bet: Bet) => void;
}

export default function PendingGamesTable({ games, onViewBet }: PendingGamesTableProps) {
  const { t } = useTranslation();

  if (games.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        {t('watchlist.components.pendingGamesTable.noPending')}
      </div>
    );
  }

  return (
    <>
      {/* Desktop: Table view */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('watchlist.components.pendingGamesTable.game')}</TableHead>
              <TableHead>{t('watchlist.components.pendingGamesTable.time')}</TableHead>
              <TableHead className="text-center">{t('watchlist.components.pendingGamesTable.bets')}</TableHead>
              <TableHead className="text-right">{t('watchlist.components.pendingGamesTable.stake')}</TableHead>
              <TableHead className="text-right">{t('watchlist.components.pendingGamesTable.potentialReturn')}</TableHead>
              <TableHead className="text-right">{t('watchlist.components.pendingGamesTable.potentialProfit')}</TableHead>
              <TableHead className="text-right">{t('watchlist.components.pendingGamesTable.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {games.map((game) => (
              <TableRow
                key={game.gameId}
                className={game.startsInNextHour ? 'bg-yellow-50/50 border-l-4 border-l-yellow-500' : ''}
              >
                <TableCell>
                  <div>
                    <div className="font-medium">{game.match}</div>
                    {game.league && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Trophy className="h-3 w-3" />
                        {game.league}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div className="font-medium">
                      {new Date(game.matchTime).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    <div className={`text-xs ${game.startsInNextHour ? 'text-yellow-600 font-medium' : 'text-muted-foreground'}`}>
                      {game.timeUntilStart}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline">{game.totalBets}</Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  R$ {game.totalStake.toFixed(2)}
                </TableCell>
                <TableCell className="text-right font-medium text-green-600">
                  R$ {game.potentialReturn.toFixed(2)}
                </TableCell>
                <TableCell className="text-right font-medium text-green-600">
                  +R$ {game.potentialProfit.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewBet(game.bets[0])}>
                        <Eye className="h-3 w-3 mr-2" />
                        {t('watchlist.components.pendingGamesTable.viewFirstBet')}
                      </DropdownMenuItem>
                      {game.totalBets > 1 && (
                        <DropdownMenuItem onClick={() => onViewBet(game.bets[0])}>
                          <List className="h-3 w-3 mr-2" />
                          {t('watchlist.components.pendingGamesTable.viewAll', { count: game.totalBets })}
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile: Cards view */}
      <div className="md:hidden space-y-3">
        {games.map((game) => (
          <Card
            key={game.gameId}
            className={game.startsInNextHour ? 'border-l-4 border-l-yellow-500 bg-yellow-50/30' : ''}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{game.match}</CardTitle>
                <Badge variant={game.startsInNextHour ? 'default' : 'outline'}>
                  {new Date(game.matchTime).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Badge>
              </div>
              {game.league && (
                <CardDescription className="flex items-center gap-1">
                  <Trophy className="h-3 w-3" />
                  {game.league} • {game.timeUntilStart}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center p-2 bg-muted rounded">
                  <div className="text-xs text-muted-foreground">{t('watchlist.components.pendingGamesTable.bets')}</div>
                  <div className="text-sm font-bold">{game.totalBets}</div>
                </div>
                <div className="text-center p-2 bg-muted rounded">
                  <div className="text-xs text-muted-foreground">{t('watchlist.components.pendingGamesTable.stake')}</div>
                  <div className="text-sm font-bold">R$ {game.totalStake.toFixed(0)}</div>
                </div>
                <div className="text-center p-2 bg-green-50 rounded">
                  <div className="text-xs text-green-700">{t('watchlist.components.pendingGamesTable.profit')}</div>
                  <div className="text-sm font-bold text-green-600">
                    +R$ {game.potentialProfit.toFixed(0)}
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => onViewBet(game.bets[0])}
              >
                <Eye className="h-3 w-3 mr-1" />
                {t('watchlist.components.pendingGamesTable.viewDetails')}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
