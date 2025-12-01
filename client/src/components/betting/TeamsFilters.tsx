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

interface TeamsFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterRank: string;
  setFilterRank: (value: string) => void;
  filterWinRate: string;
  setFilterWinRate: (value: string) => void;
  filterROI: string;
  setFilterROI: (value: string) => void;
  filterTotalBets: string;
  setFilterTotalBets: (value: string) => void;
  filterCompetition: string;
  setFilterCompetition: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  onClearFilters: () => void;
  competitions: string[];
}

export default function TeamsFilters({
  searchTerm,
  setSearchTerm,
  filterRank,
  setFilterRank,
  filterWinRate,
  setFilterWinRate,
  filterROI,
  setFilterROI,
  filterTotalBets,
  setFilterTotalBets,
  filterCompetition,
  setFilterCompetition,
  sortBy,
  setSortBy,
  onClearFilters,
  competitions,
}: TeamsFiltersProps) {
  const hasActiveFilters =
    searchTerm !== '' ||
    filterRank !== 'all' ||
    filterWinRate !== 'all' ||
    filterROI !== 'all' ||
    filterTotalBets !== 'all' ||
    filterCompetition !== 'all' ||
    sortBy !== 'winRate-desc';

  return (
    <div className="space-y-4">
      {/* Primeira linha: Busca e Rank */}
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          placeholder="Buscar por nome do time..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <Select value={filterRank} onValueChange={setFilterRank}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por Rank" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Ranks</SelectItem>
            <SelectItem value="A++">A++</SelectItem>
            <SelectItem value="A+">A+</SelectItem>
            <SelectItem value="A">A</SelectItem>
            <SelectItem value="B">B</SelectItem>
            <SelectItem value="C">C</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Segunda linha: Filtros de métricas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Select value={filterWinRate} onValueChange={setFilterWinRate}>
          <SelectTrigger>
            <SelectValue placeholder="Taxa de Acerto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as taxas</SelectItem>
            <SelectItem value="0-25">0% - 25%</SelectItem>
            <SelectItem value="25-50">25% - 50%</SelectItem>
            <SelectItem value="50-75">50% - 75%</SelectItem>
            <SelectItem value="75-100">75% - 100%</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterROI} onValueChange={setFilterROI}>
          <SelectTrigger>
            <SelectValue placeholder="ROI Médio" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os ROI</SelectItem>
            <SelectItem value="negative">Negativo (&lt; 0%)</SelectItem>
            <SelectItem value="0-10">0% - 10%</SelectItem>
            <SelectItem value="10-25">10% - 25%</SelectItem>
            <SelectItem value="25+">25%+</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterTotalBets} onValueChange={setFilterTotalBets}>
          <SelectTrigger>
            <SelectValue placeholder="Total de Apostas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="1-5">1 - 5 apostas</SelectItem>
            <SelectItem value="6-10">6 - 10 apostas</SelectItem>
            <SelectItem value="11-20">11 - 20 apostas</SelectItem>
            <SelectItem value="20+">20+ apostas</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterCompetition} onValueChange={setFilterCompetition}>
          <SelectTrigger>
            <SelectValue placeholder="Competição" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Competições</SelectItem>
            {competitions.map((comp) => (
              <SelectItem key={comp} value={comp}>{comp}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Terceira linha: Ordenação e Limpar */}
      <div className="grid gap-4 md:grid-cols-2">
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger>
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="winRate-desc">Taxa de Acerto (maior primeiro)</SelectItem>
            <SelectItem value="winRate-asc">Taxa de Acerto (menor primeiro)</SelectItem>
            <SelectItem value="roi-desc">ROI (maior primeiro)</SelectItem>
            <SelectItem value="roi-asc">ROI (menor primeiro)</SelectItem>
            <SelectItem value="totalBets-desc">Total de Apostas (maior primeiro)</SelectItem>
            <SelectItem value="totalBets-asc">Total de Apostas (menor primeiro)</SelectItem>
            <SelectItem value="lastBet-desc">Última Aposta (mais recente)</SelectItem>
            <SelectItem value="lastBet-asc">Última Aposta (mais antiga)</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={onClearFilters}
          disabled={!hasActiveFilters}
        >
          <X className="h-4 w-4 mr-2" />
          Limpar Filtros
        </Button>
      </div>
    </div>
  );
}
