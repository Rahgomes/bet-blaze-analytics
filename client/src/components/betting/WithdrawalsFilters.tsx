import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { CalendarIcon, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';

export type SortOption = 'recent' | 'oldest' | 'highest' | 'lowest';

interface WithdrawalsFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  dateFrom: Date | undefined;
  onDateFromChange: (date: Date | undefined) => void;
  dateTo: Date | undefined;
  onDateToChange: (date: Date | undefined) => void;
  valueMin: string;
  onValueMinChange: (value: string) => void;
  valueMax: string;
  onValueMaxChange: (value: string) => void;
  sortBy: SortOption;
  onSortByChange: (value: SortOption) => void;
  onClearFilters: () => void;
}

export function WithdrawalsFilters({
  searchTerm,
  onSearchChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  valueMin,
  onValueMinChange,
  valueMax,
  onValueMaxChange,
  sortBy,
  onSortByChange,
  onClearFilters,
}: WithdrawalsFiltersProps) {
  const { t, language } = useTranslation();
  const locale = language === 'pt-br' ? ptBR : enUS;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Busca */}
          <div className="space-y-2">
            <Label htmlFor="search">{t('withdrawalsHistory.filters.searchLabel')}</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder={t('withdrawalsHistory.filters.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Período */}
            <div className="space-y-2">
              <Label>{t('withdrawalsHistory.filters.periodLabel')}</Label>
              <div className="grid grid-cols-2 gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'justify-start text-left font-normal',
                        !dateFrom && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, 'dd/MM/yyyy', { locale }) : t('withdrawalsHistory.filters.dateFrom')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={onDateFromChange}
                      initialFocus
                      locale={locale}
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'justify-start text-left font-normal',
                        !dateTo && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo ? format(dateTo, 'dd/MM/yyyy', { locale }) : t('withdrawalsHistory.filters.dateTo')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={onDateToChange}
                      initialFocus
                      locale={locale}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Faixa de Valor */}
            <div className="space-y-2">
              <Label>{t('withdrawalsHistory.filters.valueRangeLabel')}</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    R$
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder={t('withdrawalsHistory.filters.valueMin')}
                    value={valueMin}
                    onChange={(e) => onValueMinChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    R$
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder={t('withdrawalsHistory.filters.valueMax')}
                    value={valueMax}
                    onChange={(e) => onValueMaxChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            {/* Ordenação */}
            <div className="space-y-2">
              <Label htmlFor="sortBy">{t('withdrawalsHistory.filters.sortByLabel')}</Label>
              <Select value={sortBy} onValueChange={(value) => onSortByChange(value as SortOption)}>
                <SelectTrigger id="sortBy">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">{t('withdrawalsHistory.filters.sortRecent')}</SelectItem>
                  <SelectItem value="oldest">{t('withdrawalsHistory.filters.sortOldest')}</SelectItem>
                  <SelectItem value="highest">{t('withdrawalsHistory.filters.sortHighest')}</SelectItem>
                  <SelectItem value="lowest">{t('withdrawalsHistory.filters.sortLowest')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Botão Limpar Filtros */}
            <Button variant="outline" onClick={onClearFilters} className="w-full">
              <X className="h-4 w-4 mr-2" />
              {t('withdrawalsHistory.filters.clearFilters')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
