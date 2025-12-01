import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import { ImportPreviewState, ImportRow, ImportPreviewFilters } from '@/types/import';
import { BetFormData } from '@/lib/schemas/betFormSchema';
import { useBettingData } from '@/hooks/useBettingData';
import { validateImportRows, getValidationSummary } from '@/utils/importValidator';
import { ImportPreviewTable } from '@/components/betting/ImportPreviewTable';
import { ImportEditModal } from '@/components/betting/ImportEditModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, Upload, X, Plus, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function ImportPreview() {
  const [, setLocation] = useLocation();
  const { addBet, bookmakers, addImportSession } = useBettingData();

  // Load preview state from sessionStorage
  const [previewState, setPreviewState] = useState<ImportPreviewState | null>(() => {
    const stored = sessionStorage.getItem('import_preview_state');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate rows on load
      const validatedRows = validateImportRows(parsed.rows);
      return { ...parsed, rows: validatedRows };
    }
    return null;
  });

  const [filters, setFilters] = useState<ImportPreviewFilters>({
    searchTerm: '',
    showOnlyErrors: false,
    showOnlyValid: false,
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<ImportRow | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [importing, setImporting] = useState(false);

  // Redirect if no preview data
  useEffect(() => {
    if (!previewState) {
      toast.error('Nenhum preview disponível');
      setLocation('/import');
    }
  }, [previewState, setLocation]);

  // Save state to sessionStorage whenever it changes
  useEffect(() => {
    if (previewState) {
      sessionStorage.setItem('import_preview_state', JSON.stringify(previewState));
    }
  }, [previewState]);

  // Filter rows based on filters
  const filteredRows = useMemo(() => {
    if (!previewState) return [];

    let filtered = previewState.rows;

    // Search filter
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (row) =>
          row.data.bookmaker?.toLowerCase().includes(term) ||
          row.data.description?.toLowerCase().includes(term) ||
          row.data.operationNumber?.toLowerCase().includes(term)
      );
    }

    // Show only errors
    if (filters.showOnlyErrors) {
      filtered = filtered.filter((row) => !row.isValid);
    }

    // Show only valid
    if (filters.showOnlyValid) {
      filtered = filtered.filter((row) => row.isValid);
    }

    return filtered;
  }, [previewState, filters]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!previewState) return null;
    return getValidationSummary(previewState.rows);
  }, [previewState]);

  const handleEdit = (row: ImportRow) => {
    setSelectedRow(row);
    setShowEditModal(true);
  };

  const handleSaveEdit = (rowId: string, updates: Partial<BetFormData>) => {
    if (!previewState) return;

    const updatedRows = previewState.rows.map((row) =>
      row.id === rowId ? { ...row, data: { ...row.data, ...updates } } : row
    );

    // Re-validate updated rows
    const validatedRows = validateImportRows(updatedRows);

    setPreviewState({ ...previewState, rows: validatedRows });
    toast.success('Linha atualizada com sucesso');
  };

  const handleDelete = (rowId: string) => {
    if (!previewState) return;

    const updatedRows = previewState.rows.filter((row) => row.id !== rowId);
    setPreviewState({ ...previewState, rows: updatedRows });
    toast.success('Linha removida');
  };

  const handleAddRow = () => {
    // Create empty row for manual insertion
    const newRow: ImportRow = {
      id: crypto.randomUUID(),
      rowNumber: (previewState?.rows.length || 0) + 1,
      data: {
        bookmaker: '',
        date: new Date().toISOString().split('T')[0],
        betType: 'simple',
        multipleQuantity: '1',
        operationNumber: '',
        legs: [
          {
            amount: '',
            odds: '',
            homeTeam: '',
            awayTeam: '',
            sport: 'Futebol',
            market: '',
            league: '',
            matchTime: '',
            isLive: false,
            strategy: '',
            hasBoost: false,
            originalOdds: '',
            boostPercentage: '',
            usedCredits: false,
            creditsAmount: '',
            hasCashout: false,
            cashoutValue: '',
            cashoutTime: '',
            hasEarlyPayout: false,
            isRiskFree: false,
            riskFreeAmount: '',
            protectionTypes: [],
            status: 'pending',
            finalScore: '',
            resultTime: '',
          },
        ],
        description: '',
        stakeLogic: '',
        tags: [],
      },
      validationErrors: [],
      isValid: false,
      status: 'pending',
    };

    setSelectedRow(newRow);
    setShowEditModal(true);
  };

  const handleConfirmImport = async () => {
    if (!previewState || !stats) return;

    if (stats.invalidRows > 0) {
      toast.error('Corrija todos os erros antes de importar');
      return;
    }

    setImporting(true);

    try {
      // Create import session
      const importSession = {
        id: previewState.sessionId,
        fileName: previewState.fileName,
        importDate: new Date().toISOString(),
        totalRows: previewState.rows.length,
        successfulRows: 0,
        failedRows: 0,
        betIds: [] as string[],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Import each row
      for (const row of previewState.rows) {
        try {
          const totalAmount = row.data.legs?.reduce((sum, leg) => {
            const amount = parseFloat(leg.amount);
            return sum + (isNaN(amount) ? 0 : amount);
          }, 0) || 0;

          const finalOdds = row.data.legs?.reduce((product, leg) => {
            const odds = parseFloat(leg.odds);
            return product * (isNaN(odds) ? 1 : odds);
          }, 1) || 1;

          // Determine status
          const allWon = row.data.legs?.every((leg) => leg.status === 'won');
          const anyLost = row.data.legs?.some((leg) => leg.status === 'lost');
          const anyVoid = row.data.legs?.some((leg) => leg.status === 'void');

          let return_ = 0;
          if (allWon) {
            return_ = totalAmount * finalOdds;
          } else if (anyVoid && !anyLost) {
            const validLegs = row.data.legs?.filter((leg) => leg.status !== 'void') || [];
            const validOdds = validLegs.reduce((product, leg) => product * parseFloat(leg.odds), 1);
            return_ = totalAmount * validOdds;
          }

          const profit = return_ - totalAmount;

          const betData = {
            bookmaker: row.data.bookmaker!,
            date: row.data.date!,
            betType: row.data.betType!,
            amount: totalAmount,
            odds: finalOdds,
            return: return_,
            profit,
            status: allWon ? 'won' : anyLost ? 'lost' : anyVoid ? 'void' : 'pending',
            description: row.data.description!,
            stakeLogic: row.data.stakeLogic,
            isProtected: row.data.legs?.some((leg) => leg.protectionTypes.length > 0),
            isLive: row.data.legs?.some((leg) => leg.isLive),
            sourceType: 'import' as const,
            importSessionId: importSession.id,
            legs: row.data.legs,
            tags: row.data.tags,
            operationNumber: row.data.operationNumber,
          };

          const bet = addBet(betData);
          importSession.betIds.push(bet.id);
          importSession.successfulRows++;
        } catch (error) {
          console.error('Error importing row:', row.rowNumber, error);
          importSession.failedRows++;
        }
      }

      // Save import session
      addImportSession(importSession);

      // Clear session storage
      sessionStorage.removeItem('import_preview_state');

      toast.success(
        `Importação concluída! ${importSession.successfulRows} aposta(s) importada(s).`
      );

      setLocation('/import');
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Erro ao importar apostas');
    } finally {
      setImporting(false);
    }
  };

  const handleCancel = () => {
    sessionStorage.removeItem('import_preview_state');
    setLocation('/import');
  };

  if (!previewState || !stats) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Preview de Importação</h1>
          <p className="text-muted-foreground mt-1">
            Arquivo: <span className="font-medium">{previewState.fileName}</span>
          </p>
        </div>
        <Button variant="outline" onClick={() => setShowCancelDialog(true)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total de Linhas</CardDescription>
            <CardTitle className="text-3xl">{stats.totalRows}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CardHeader className="pb-3">
            <CardDescription className="text-green-700 dark:text-green-300">
              Linhas Válidas
            </CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.validRows}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardHeader className="pb-3">
            <CardDescription className="text-red-700 dark:text-red-300">
              Com Erros
            </CardDescription>
            <CardTitle className="text-3xl text-red-600">{stats.invalidRows}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
          <CardHeader className="pb-3">
            <CardDescription className="text-yellow-700 dark:text-yellow-300">
              Avisos
            </CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{stats.warningCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Error Alert */}
      {stats.invalidRows > 0 && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-900 dark:text-red-100">
                  {stats.invalidRows} linha(s) com erro(s)
                </p>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  Corrija todos os erros antes de importar. Use os filtros ou clique em "Editar" nas linhas destacadas em vermelho.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <Input
                id="search"
                placeholder="Casa, descrição, operação..."
                value={filters.searchTerm}
                onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
              />
            </div>

            <div className="flex items-end gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showOnlyErrors"
                  checked={filters.showOnlyErrors}
                  onCheckedChange={(checked) =>
                    setFilters({ ...filters, showOnlyErrors: checked as boolean, showOnlyValid: false })
                  }
                />
                <Label htmlFor="showOnlyErrors" className="cursor-pointer">
                  Apenas com erros
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showOnlyValid"
                  checked={filters.showOnlyValid}
                  onCheckedChange={(checked) =>
                    setFilters({ ...filters, showOnlyValid: checked as boolean, showOnlyErrors: false })
                  }
                />
                <Label htmlFor="showOnlyValid" className="cursor-pointer">
                  Apenas válidas
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Linhas para Importação</CardTitle>
              <CardDescription>
                Mostrando {filteredRows.length} de {previewState.rows.length} linha(s)
              </CardDescription>
            </div>
            <Button variant="outline" onClick={handleAddRow}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Linha
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ImportPreviewTable
            rows={filteredRows}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between gap-4 sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 border rounded-lg shadow-lg">
        <Button
          variant="outline"
          size="lg"
          onClick={() => setShowCancelDialog(true)}
        >
          <X className="h-5 w-5 mr-2" />
          Cancelar Tudo
        </Button>

        <Button
          size="lg"
          onClick={() => setShowConfirmDialog(true)}
          disabled={stats.invalidRows > 0 || importing}
        >
          <Upload className="h-5 w-5 mr-2" />
          {importing ? 'Importando...' : `Importar ${stats.validRows} Aposta(s)`}
        </Button>
      </div>

      {/* Edit Modal */}
      <ImportEditModal
        open={showEditModal}
        onOpenChange={(open) => {
          setShowEditModal(open);
          if (!open) setSelectedRow(null);
        }}
        row={selectedRow}
        onSave={handleSaveEdit}
        bookmakers={bookmakers.map((b) => b.name)}
      />

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Importação</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a importar {stats.validRows} aposta(s).
              <div className="mt-4 p-3 bg-muted rounded-lg space-y-1 text-sm">
                <p><strong>Arquivo:</strong> {previewState.fileName}</p>
                <p><strong>Total de linhas:</strong> {stats.totalRows}</p>
                <p className="text-green-600"><strong>Válidas:</strong> {stats.validRows}</p>
                {stats.warningCount > 0 && (
                  <p className="text-yellow-600"><strong>Avisos:</strong> {stats.warningCount}</p>
                )}
              </div>
              <p className="mt-3 font-medium">
                Esta ação criará as apostas e atualizará sua banca. Deseja continuar?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmImport}>
              Sim, Importar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Importação?</AlertDialogTitle>
            <AlertDialogDescription>
              Todos os dados do preview serão perdidos e você retornará à página de importação.
              Deseja realmente cancelar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Não, Continuar Editando</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="bg-red-600 hover:bg-red-700">
              Sim, Cancelar Tudo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
