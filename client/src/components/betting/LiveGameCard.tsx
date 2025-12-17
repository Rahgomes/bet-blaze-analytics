import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Bet } from '@/types/betting';
import { LiveGame } from '@/utils/exposureCalculations';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Eye, ExternalLink, Trophy } from 'lucide-react';

interface LiveGameCardProps {
  game: LiveGame;
  onViewBet: (bet: Bet) => void;
}

export default function LiveGameCard({ game, onViewBet }: LiveGameCardProps) {
  const { t, tm } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="border-l-4 border-l-red-500 bg-red-50/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <CardTitle className="text-lg">{game.match}</CardTitle>
          </div>
          <Badge variant="destructive" className="animate-pulse">
            {game.elapsedMinutes}'
          </Badge>
        </div>
        {game.league && (
          <CardDescription className="flex items-center gap-2">
            <Trophy className="h-3 w-3" />
            {game.league}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Quick metrics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2 bg-white rounded border">
            <div className="text-xs text-muted-foreground">{t('watchlist.components.liveGameCard.bets')}</div>
            <div className="text-lg font-bold">{game.totalBets}</div>
          </div>
          <div className="text-center p-2 bg-white rounded border">
            <div className="text-xs text-muted-foreground">{t('watchlist.components.liveGameCard.atRisk')}</div>
            <div className="text-lg font-bold text-orange-600">
              R$ {game.totalStake.toFixed(2)}
            </div>
          </div>
          <div className="text-center p-2 bg-white rounded border">
            <div className="text-xs text-muted-foreground">{t('watchlist.components.liveGameCard.return')}</div>
            <div className="text-lg font-bold text-green-600">
              R$ {game.potentialReturn.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Markets involved */}
        {game.markets.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {game.markets.map((market, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {tm(market)}
              </Badge>
            ))}
          </div>
        )}

        {/* Expandable section */}
        {expanded && (
          <div className="pt-3 border-t space-y-2">
            <h5 className="text-sm font-medium">{t('watchlist.components.liveGameCard.betDetails')}</h5>
            {game.bets.map((bet, i) => (
              <div key={i} className="p-2 bg-white rounded border text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{bet.market ? tm(bet.market) : t('watchlist.components.liveGameCard.marketNotSpecified')}</span>
                  <span className="text-xs text-muted-foreground">
                    @{bet.odds.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1 text-xs">
                  <span className="text-muted-foreground">
                    R$ {bet.amount.toFixed(2)}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2"
                    onClick={() => onViewBet(bet)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    {t('watchlist.components.liveGameCard.viewDetails')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3 w-3 mr-1" />
                {t('watchlist.components.liveGameCard.hide')}
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-1" />
                {game.totalBets > 1
                  ? t('watchlist.components.liveGameCard.viewBetsPlural', { count: game.totalBets })
                  : t('watchlist.components.liveGameCard.viewBets', { count: game.totalBets })}
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewBet(game.bets[0])}
            title={t('watchlist.components.liveGameCard.openFullDetails')}
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
