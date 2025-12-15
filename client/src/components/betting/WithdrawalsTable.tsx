import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { Transaction } from '@/types/betting';
import { useTranslation } from '@/hooks/useTranslation';

interface WithdrawalsTableProps {
  withdrawals: Transaction[];
  onEdit: (withdrawal: Transaction) => void;
  onDelete: (withdrawal: Transaction) => void;
}

export function WithdrawalsTable({ withdrawals, onEdit, onDelete }: WithdrawalsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { t, language } = useTranslation();
  const locale = language === 'pt-br' ? ptBR : enUS;

  // Calculate pagination
  const totalItems = withdrawals.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentWithdrawals = withdrawals.slice(startIndex, endIndex);

  // Handle page change
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Handle items per page change
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value, 10));
    setCurrentPage(1); // Reset to first page
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (withdrawals.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg font-medium">{t('withdrawalsHistory.empty.title')}</p>
            <p className="text-sm">{t('withdrawalsHistory.empty.subtitle')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t('withdrawalsHistory.table.title')}</CardTitle>
          <div className="text-sm text-muted-foreground">
            {t('withdrawalsHistory.table.showing')
              .replace('{start}', String(startIndex + 1))
              .replace('{end}', String(endIndex))
              .replace('{total}', String(totalItems))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('withdrawalsHistory.table.headers.title')}</TableHead>
                  <TableHead>{t('withdrawalsHistory.table.headers.value')}</TableHead>
                  <TableHead>{t('withdrawalsHistory.table.headers.dateTime')}</TableHead>
                  <TableHead>{t('withdrawalsHistory.table.headers.description')}</TableHead>
                  <TableHead>{t('withdrawalsHistory.table.headers.balanceAfter')}</TableHead>
                  <TableHead className="text-right">{t('withdrawalsHistory.table.headers.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentWithdrawals.map((withdrawal) => (
                  <TableRow key={withdrawal.id}>
                    <TableCell className="font-medium">
                      {withdrawal.title || t('withdrawalsHistory.table.defaultTitle')}
                    </TableCell>
                    <TableCell className="font-semibold text-red-600">
                      -R$ {withdrawal.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {format(new Date(withdrawal.dateTime), "dd/MM/yyyy HH:mm", { locale })}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {withdrawal.description || t('withdrawalsHistory.table.noDescription')}
                    </TableCell>
                    <TableCell className="font-medium">
                      R$ {withdrawal.balanceAfter.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(withdrawal)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(withdrawal)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Items per page selector */}
            <div className="flex items-center gap-2">
              <Select
                value={itemsPerPage.toString()}
                onValueChange={handleItemsPerPageChange}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="30">30</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">{t('withdrawalsHistory.table.itemsPerPage')}</span>
            </div>

            {/* Page navigation */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                {t('withdrawalsHistory.table.previous')}
              </Button>

              <div className="flex items-center gap-1">
                {getPageNumbers().map((page, index) => (
                  typeof page === 'number' ? (
                    <Button
                      key={index}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => goToPage(page)}
                      className="w-10"
                    >
                      {page}
                    </Button>
                  ) : (
                    <span key={index} className="px-2 text-muted-foreground">
                      {page}
                    </span>
                  )
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                {t('withdrawalsHistory.table.next')}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
