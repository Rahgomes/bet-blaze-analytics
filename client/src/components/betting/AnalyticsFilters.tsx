import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ChevronDown, ChevronUp, X, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';

interface AnalyticsFiltersProps {
  period: string;
  setPeriod: (period: string) => void;
  selectedBookmakers: string[];
  setSelectedBookmakers: (bookmakers: string[]) => void;
  selectedLeagues: string[];
  setSelectedLeagues: (leagues: string[]) => void;
  selectedBetTypes: string[];
  setSelectedBetTypes: (types: string[]) => void;
  selectedMarkets: string[];
  setSelectedMarkets: (markets: string[]) => void;
  oddsRange: { min: number; max: number };
  setOddsRange: (range: { min: number; max: number }) => void;
  selectedStatuses: string[];
  setSelectedStatuses: (statuses: string[]) => void;
  selectedTeams: string[];
  setSelectedTeams: (teams: string[]) => void;
  availableBookmakers: string[];
  availableLeagues: string[];
  availableMarkets: string[];
  availableTeams: string[];
  onClearFilters: () => void;
}

const BET_STATUSES = ['pending', 'won', 'lost', 'void', 'cashout'];

export function AnalyticsFilters({
  period,
  setPeriod,
  selectedBookmakers,
  setSelectedBookmakers,
  selectedLeagues,
  setSelectedLeagues,
  selectedBetTypes,
  setSelectedBetTypes,
  selectedMarkets,
  setSelectedMarkets,
  oddsRange,
  setOddsRange,
  selectedStatuses,
  setSelectedStatuses,
  selectedTeams,
  setSelectedTeams,
  availableBookmakers,
  availableLeagues,
  availableMarkets,
  availableTeams,
  onClearFilters,
}: AnalyticsFiltersProps) {
  const { t } = useTranslation();
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Bet types with translations
  const BET_TYPES = [
    { value: 'Pré-jogo', label: t('analytics.betTypeFilters.prematch') },
    { value: 'Ao vivo', label: t('analytics.betTypeFilters.live') },
  ];

  // Status labels with translations
  const STATUS_LABELS: Record<string, string> = {
    pending: t('analytics.status.pending'),
    won: t('analytics.status.won'),
    lost: t('analytics.status.lost'),
    void: t('analytics.status.void'),
    cashout: t('analytics.status.cashout'),
  };

  // Contar filtros ativos (excluindo o período)
  const activeFiltersCount =
    selectedBookmakers.length +
    selectedLeagues.length +
    selectedBetTypes.length +
    selectedMarkets.length +
    selectedStatuses.length +
    selectedTeams.length +
    (oddsRange.min > 1.01 || oddsRange.max < 10 ? 1 : 0);

  const hasActiveFilters =
    activeFiltersCount > 0 || period !== '30days';

  const handleToggleItem = (
    item: string,
    selectedItems: string[],
    setSelectedItems: (items: string[]) => void
  ) => {
    if (selectedItems.includes(item)) {
      setSelectedItems(selectedItems.filter((i) => i !== item));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filtro de Período (sempre visível) */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger>
              <SelectValue placeholder={t('analytics.filters.periodPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">{t('analytics.filters.today')}</SelectItem>
              <SelectItem value="week">{t('analytics.filters.week')}</SelectItem>
              <SelectItem value="month">{t('analytics.filters.month')}</SelectItem>
              <SelectItem value="30days">{t('analytics.filters.30days')}</SelectItem>
              <SelectItem value="90days">{t('analytics.filters.90days')}</SelectItem>
              <SelectItem value="year">{t('analytics.filters.year')}</SelectItem>
              <SelectItem value="all">{t('analytics.filters.all')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          {t('analytics.filters.advancedFilters')}
          {activeFiltersCount > 0 && (
            <Badge variant="default" className="ml-1">
              {activeFiltersCount}
            </Badge>
          )}
          {showAdvancedFilters ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>

        {hasActiveFilters && (
          <Button variant="ghost" onClick={onClearFilters} className="gap-2">
            <X className="h-4 w-4" />
            {t('analytics.filters.clearAll')}
          </Button>
        )}
      </div>

      {/* Filtros Avançados (expansível) */}
      {showAdvancedFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('analytics.filters.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Casas de Apostas */}
            {availableBookmakers.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-semibold">{t('analytics.filters.bookmakers')}</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableBookmakers.map((bookmaker) => (
                    <div key={bookmaker} className="flex items-center space-x-2">
                      <Checkbox
                        id={`bookmaker-${bookmaker}`}
                        checked={selectedBookmakers.includes(bookmaker)}
                        onCheckedChange={() =>
                          handleToggleItem(bookmaker, selectedBookmakers, setSelectedBookmakers)
                        }
                      />
                      <label
                        htmlFor={`bookmaker-${bookmaker}`}
                        className="text-sm cursor-pointer"
                      >
                        {bookmaker}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ligas/Competições */}
            {availableLeagues.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-semibold">{t('analytics.filters.leagues')}</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto">
                  {availableLeagues.map((league) => (
                    <div key={league} className="flex items-center space-x-2">
                      <Checkbox
                        id={`league-${league}`}
                        checked={selectedLeagues.includes(league)}
                        onCheckedChange={() =>
                          handleToggleItem(league, selectedLeagues, setSelectedLeagues)
                        }
                      />
                      <label
                        htmlFor={`league-${league}`}
                        className="text-sm cursor-pointer"
                      >
                        {league}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tipo de Aposta */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">{t('bets.betType')}</Label>
              <div className="grid grid-cols-2 gap-3">
                {BET_TYPES.map((type) => (
                  <div key={type.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${type.value}`}
                      checked={selectedBetTypes.includes(type.value)}
                      onCheckedChange={() =>
                        handleToggleItem(type.value, selectedBetTypes, setSelectedBetTypes)
                      }
                    />
                    <label htmlFor={`type-${type.value}`} className="text-sm cursor-pointer">
                      {type.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Mercados */}
            {availableMarkets.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-semibold">{t('analytics.filters.markets')}</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto">
                  {availableMarkets.map((market) => (
                    <div key={market} className="flex items-center space-x-2">
                      <Checkbox
                        id={`market-${market}`}
                        checked={selectedMarkets.includes(market)}
                        onCheckedChange={() =>
                          handleToggleItem(market, selectedMarkets, setSelectedMarkets)
                        }
                      />
                      <label
                        htmlFor={`market-${market}`}
                        className="text-sm cursor-pointer"
                      >
                        {market}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Faixa de Odds */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">{t('analytics.filters.oddsRange')}</Label>
                <span className="text-sm text-muted-foreground">
                  {oddsRange.min.toFixed(2)} - {oddsRange.max.toFixed(2)}
                </span>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground">{t('analytics.filters.minimum')}</Label>
                  <Slider
                    value={[oddsRange.min]}
                    onValueChange={(value) =>
                      setOddsRange({ ...oddsRange, min: value[0] })
                    }
                    min={1.01}
                    max={oddsRange.max}
                    step={0.1}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">{t('analytics.filters.maximum')}</Label>
                  <Slider
                    value={[oddsRange.max]}
                    onValueChange={(value) =>
                      setOddsRange({ ...oddsRange, max: value[0] })
                    }
                    min={oddsRange.min}
                    max={10}
                    step={0.1}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">{t('analytics.filters.status')}</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {BET_STATUSES.map((status) => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status}`}
                      checked={selectedStatuses.includes(status)}
                      onCheckedChange={() =>
                        handleToggleItem(status, selectedStatuses, setSelectedStatuses)
                      }
                    />
                    <label
                      htmlFor={`status-${status}`}
                      className="text-sm cursor-pointer"
                    >
                      {STATUS_LABELS[status]}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Times (se houver muitos, mostrar apenas como info) */}
            {selectedTeams.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-semibold">{t('analytics.filters.selectedTeams')}</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedTeams.map((team) => (
                    <Badge
                      key={team}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleToggleItem(team, selectedTeams, setSelectedTeams)}
                    >
                      {team}
                      <X className="ml-1 h-3 w-3" />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
