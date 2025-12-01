import { useState } from 'react';
import { ImportRow } from '@/types/import';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertCircle, CheckCircle2, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImportPreviewTableProps {
  rows: ImportRow[];
  onEdit: (row: ImportRow) => void;
  onDelete: (rowId: string) => void;
}

export function ImportPreviewTable({ rows, onEdit, onDelete }: ImportPreviewTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const totalPages = Math.ceil(rows.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentRows = rows.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const formatAmount = (row: ImportRow): string => {
    if (!row.data.legs || row.data.legs.length === 0) return 'N/A';
    const total = row.data.legs.reduce((sum, leg) => {
      const amount = parseFloat(leg.amount);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    return `R$ ${total.toFixed(2)}`;
  };

  const formatOdds = (row: ImportRow): string => {
    if (!row.data.legs || row.data.legs.length === 0) return 'N/A';
    const totalOdds = row.data.legs.reduce((product, leg) => {
      const odds = parseFloat(leg.odds);
      return product * (isNaN(odds) ? 1 : odds);
    }, 1);
    return totalOdds.toFixed(2);
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[50px]">Status</TableHead>
              <TableHead className="w-[60px]">#</TableHead>
              <TableHead className="w-[150px]">Casa</TableHead>
              <TableHead className="w-[100px]">Data</TableHead>
              <TableHead className="w-[100px]">Tipo</TableHead>
              <TableHead className="w-[100px]">Valor</TableHead>
              <TableHead className="w-[80px]">Odds</TableHead>
              <TableHead className="w-[100px]">Legs</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="w-[120px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                  Nenhuma linha encontrada
                </TableCell>
              </TableRow>
            ) : (
              currentRows.map((row) => (
                <TableRow
                  key={row.id}
                  className={cn(
                    'transition-colors',
                    row.isValid
                      ? 'bg-green-50 hover:bg-green-100 dark:bg-green-950/20 dark:hover:bg-green-950/30'
                      : 'bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/30'
                  )}
                >
                  {/* Status Icon */}
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center justify-center">
                            {row.isValid ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : (
                              <AlertCircle className="h-5 w-5 text-red-600" />
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs">
                          {row.isValid ? (
                            <p className="text-sm text-green-600 font-medium">Linha válida</p>
                          ) : (
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-red-600 mb-2">
                                Erros encontrados:
                              </p>
                              <ul className="text-xs space-y-1">
                                {row.validationErrors
                                  .filter((err) => err.severity === 'error')
                                  .map((err, i) => (
                                    <li key={i} className="text-red-500">
                                      <strong>{err.field}:</strong> {err.message}
                                    </li>
                                  ))}
                              </ul>
                              {row.validationErrors.some((err) => err.severity === 'warning') && (
                                <>
                                  <p className="text-sm font-medium text-yellow-600 mt-2 mb-1">
                                    Avisos:
                                  </p>
                                  <ul className="text-xs space-y-1">
                                    {row.validationErrors
                                      .filter((err) => err.severity === 'warning')
                                      .map((err, i) => (
                                        <li key={i} className="text-yellow-600">
                                          <strong>{err.field}:</strong> {err.message}
                                        </li>
                                      ))}
                                  </ul>
                                </>
                              )}
                            </div>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>

                  {/* Row Number */}
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {row.rowNumber}
                  </TableCell>

                  {/* Bookmaker */}
                  <TableCell className="font-medium">
                    {row.data.bookmaker || '-'}
                  </TableCell>

                  {/* Date */}
                  <TableCell className="text-sm text-muted-foreground">
                    {row.data.date || '-'}
                  </TableCell>

                  {/* Bet Type */}
                  <TableCell>
                    <Badge variant={row.data.betType === 'multiple' ? 'default' : 'secondary'}>
                      {row.data.betType === 'multiple' ? 'Múltipla' : 'Simples'}
                    </Badge>
                  </TableCell>

                  {/* Amount */}
                  <TableCell className="font-medium">
                    {formatAmount(row)}
                  </TableCell>

                  {/* Odds */}
                  <TableCell className="font-mono text-sm">
                    {formatOdds(row)}
                  </TableCell>

                  {/* Legs Count */}
                  <TableCell className="text-center">
                    <Badge variant="outline" className="text-xs">
                      {row.data.legs?.length || 0} leg(s)
                    </Badge>
                  </TableCell>

                  {/* Description */}
                  <TableCell className="max-w-[200px] truncate text-sm">
                    {row.data.description || '-'}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(row)}
                        className="h-8 px-2"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(row.id)}
                        className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {startIndex + 1} a {Math.min(endIndex, rows.length)} de {rows.length} linhas
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <div className="text-sm text-muted-foreground">
              Página {currentPage} de {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
