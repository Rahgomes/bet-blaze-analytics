import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ColumnConfig {
  key: string;
  label: string;
  format?: 'currency' | 'percentage' | 'number';
  sortable?: boolean;
  className?: string;
  colorCode?: boolean; // Se true, valores positivos ficam verdes e negativos vermelhos
}

interface PerformanceTableProps<T extends Record<string, any>> {
  title: string;
  data: T[];
  columns: ColumnConfig[];
  emptyMessage?: string;
  defaultSortKey?: string;
  defaultSortDirection?: 'asc' | 'desc';
}

export function PerformanceTable<T extends Record<string, any>>({
  title,
  data,
  columns,
  emptyMessage = 'Nenhum dado disponível',
  defaultSortKey,
  defaultSortDirection = 'desc',
}: PerformanceTableProps<T>) {
  const [sortKey, setSortKey] = useState<string>(defaultSortKey || '');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(defaultSortDirection);

  const formatValue = (value: any, format?: string): string => {
    if (value === null || value === undefined) return '-';

    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(value);
      case 'percentage':
        return `${typeof value === 'number' ? value.toFixed(1) : value}%`;
      case 'number':
        return new Intl.NumberFormat('pt-BR').format(value);
      default:
        return String(value);
    }
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortKey) return 0;

    const aValue = a[sortKey];
    const bValue = b[sortKey];

    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const getCellColorClass = (value: any, colorCode?: boolean): string => {
    if (!colorCode || typeof value !== 'number') return '';
    if (value > 0) return 'text-green-600 dark:text-green-400';
    if (value < 0) return 'text-red-600 dark:text-red-400';
    return 'text-muted-foreground';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedData.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead
                      key={column.key}
                      className={cn(
                        column.className,
                        column.sortable && 'cursor-pointer select-none hover:bg-muted/50'
                      )}
                      onClick={() => column.sortable && handleSort(column.key)}
                    >
                      <div className="flex items-center gap-2">
                        {column.label}
                        {column.sortable && (
                          <span className="inline-flex">
                            {sortKey === column.key ? (
                              sortDirection === 'asc' ? (
                                <ArrowUp className="h-4 w-4" />
                              ) : (
                                <ArrowDown className="h-4 w-4" />
                              )
                            ) : (
                              <ArrowUpDown className="h-4 w-4 opacity-40" />
                            )}
                          </span>
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((row, index) => (
                  <TableRow key={index}>
                    {columns.map((column) => {
                      const value = row[column.key];
                      return (
                        <TableCell
                          key={column.key}
                          className={cn(
                            column.className,
                            getCellColorClass(value, column.colorCode)
                          )}
                        >
                          {formatValue(value, column.format)}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
