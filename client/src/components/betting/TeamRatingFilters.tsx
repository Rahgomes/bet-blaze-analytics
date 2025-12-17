import { useTranslation } from '@/hooks/useTranslation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X } from 'lucide-react';

interface TeamRatingFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterRank: string;
  setFilterRank: (value: string) => void;
  filterWinRate: string;
  setFilterWinRate: (value: string) => void;
  onClearFilters: () => void;
}

export default function TeamRatingFilters({
  searchTerm,
  setSearchTerm,
  filterRank,
  setFilterRank,
  filterWinRate,
  setFilterWinRate,
  onClearFilters,
}: TeamRatingFiltersProps) {
  const { t } = useTranslation();
  const hasActiveFilters = searchTerm !== '' || filterRank !== 'all' || filterWinRate !== 'all';

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {/* Input de busca por nome */}
      <Input
        placeholder={t('watchlist.components.teamFilters.searchPlaceholder')}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full"
      />

      {/* Select de Rank */}
      <Select value={filterRank} onValueChange={setFilterRank}>
        <SelectTrigger>
          <SelectValue placeholder={t('watchlist.components.teamFilters.filterByRank')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('watchlist.components.teamFilters.allRanks')}</SelectItem>
          <SelectItem value="A++">A++</SelectItem>
          <SelectItem value="A+">A+</SelectItem>
          <SelectItem value="A">A</SelectItem>
          <SelectItem value="B">B</SelectItem>
          <SelectItem value="C">C</SelectItem>
        </SelectContent>
      </Select>

      {/* Select de Taxa de Acerto */}
      <Select value={filterWinRate} onValueChange={setFilterWinRate}>
        <SelectTrigger>
          <SelectValue placeholder={t('watchlist.components.teamFilters.winRate')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('watchlist.components.teamFilters.allRates')}</SelectItem>
          <SelectItem value="0-25">0% - 25%</SelectItem>
          <SelectItem value="25-50">25% - 50%</SelectItem>
          <SelectItem value="50-75">50% - 75%</SelectItem>
          <SelectItem value="75-100">75% - 100%</SelectItem>
        </SelectContent>
      </Select>

      {/* Botão Limpar Filtros */}
      <Button
        variant="outline"
        onClick={onClearFilters}
        disabled={!hasActiveFilters}
        className="w-full"
      >
        <X className="h-4 w-4 mr-2" />
        {t('watchlist.components.teamFilters.clearFilters')}
      </Button>
    </div>
  );
}
