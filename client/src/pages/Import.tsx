import { useState } from 'react';
import { useLocation } from 'wouter';
import { useBettingStore } from '@/stores/betting';
import { parseImportFile, validateFileType, validateFileSize } from '@/utils/importParser';
import { validateImportRows } from '@/utils/importValidator';
import { ImportPreviewState } from '@/types/import';
import { ImportTemplateDownload } from '@/components/betting/ImportTemplateDownload';
import { ImportColumnMapping } from '@/components/betting/ImportColumnMapping';
import { ImportHistoryCard } from '@/components/betting/ImportHistoryCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileSpreadsheet, History, Eye, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

export default function Import() {
  const [, setLocation] = useLocation();
  const getImportSessions = useBettingStore(state => state.getImportSessions);
  const importSessions = getImportSessions();

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [visibleImportsCount, setVisibleImportsCount] = useState(3);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      handleFileSelection(selectedFile);
    }
  };

  const handleFileSelection = (selectedFile: File) => {
    // Validate file type
    if (!validateFileType(selectedFile)) {
      toast.error('Tipo de arquivo inválido. Apenas CSV e Excel (.xlsx) são permitidos.');
      return;
    }

    // Validate file size
    if (!validateFileSize(selectedFile)) {
      toast.error('Arquivo muito grande. O tamanho máximo é 5MB.');
      return;
    }

    setFile(selectedFile);
    toast.success(`Arquivo "${selectedFile.name}" selecionado`);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      handleFileSelection(droppedFile);
    }
  };

  const handlePreview = async () => {
    if (!file) {
      toast.error('Por favor, selecione um arquivo');
      return;
    }

    setUploading(true);

    try {
      // Parse file
      const importRows = await parseImportFile(file);

      if (importRows.length === 0) {
        toast.error('Arquivo vazio ou sem dados válidos');
        setUploading(false);
        return;
      }

      // Validate rows
      const validatedRows = validateImportRows(importRows);

      // Create preview state
      const previewState: ImportPreviewState = {
        sessionId: crypto.randomUUID(),
        fileName: file.name,
        fileSize: file.size,
        uploadDate: new Date().toISOString(),
        rows: validatedRows,
        filters: {
          searchTerm: '',
          showOnlyErrors: false,
          showOnlyValid: false,
        },
      };

      // Save to sessionStorage
      sessionStorage.setItem('import_preview_state', JSON.stringify(previewState));

      // Navigate to preview page
      setLocation('/import/preview');
    } catch (error) {
      console.error('Parse error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Erro ao processar arquivo. Verifique o formato.'
      );
    } finally {
      setUploading(false);
    }
  };

  const visibleSessions = importSessions.slice(0, visibleImportsCount);
  const hasMoreSessions = importSessions.length > visibleImportsCount;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Importar Apostas</h1>
        <p className="text-muted-foreground mt-1">
          Importe suas apostas em massa usando arquivos CSV ou Excel
        </p>
      </div>

      {/* File Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload de Arquivo
          </CardTitle>
          <CardDescription>
            Selecione um arquivo CSV ou Excel (.xlsx) para importar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Drag & Drop Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              dragActive
                ? 'border-primary bg-primary/5'
                : file
                ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                : 'border-border hover:border-primary/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <FileSpreadsheet
              className={`mx-auto h-12 w-12 mb-4 ${
                file ? 'text-green-600' : 'text-muted-foreground'
              }`}
            />
            <div className="space-y-2">
              <Label htmlFor="file-upload" className="cursor-pointer">
                <div className="text-lg font-medium text-foreground">
                  {file ? file.name : 'Selecione um arquivo ou arraste aqui'}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {file
                    ? `${(file.size / 1024).toFixed(2)} KB - Clique em "Visualizar Preview" para continuar`
                    : 'CSV ou Excel (.xlsx) - Máximo 5MB'}
                </div>
              </Label>
              <Input
                id="file-upload"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {file && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFile(null);
                    const input = document.getElementById('file-upload') as HTMLInputElement;
                    if (input) input.value = '';
                  }}
                >
                  Remover
                </Button>
              </div>
            )}
          </div>

          {/* Preview Button */}
          <Button
            onClick={handlePreview}
            disabled={!file || uploading}
            className="w-full h-12 text-lg"
            size="lg"
          >
            <Eye className="mr-2 h-5 w-5" />
            {uploading ? 'Processando...' : 'Visualizar Preview'}
          </Button>

          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg text-sm">
            <p className="font-medium text-blue-900 dark:text-blue-100">
              Próximos passos:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-blue-800 dark:text-blue-200 mt-2">
              <li>Selecione seu arquivo CSV ou Excel</li>
              <li>Clique em "Visualizar Preview" para verificar os dados</li>
              <li>Corrija erros se necessário na tela de preview</li>
              <li>Confirme a importação</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Template Download */}
      <ImportTemplateDownload />

      {/* Column Mapping */}
      <ImportColumnMapping />

      {/* Import History */}
      {importSessions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Últimas Importações
                </CardTitle>
                <CardDescription>Histórico recente de arquivos importados</CardDescription>
              </div>
              <Button variant="outline" onClick={() => setLocation('/import/history')}>
                <History className="h-4 w-4 mr-2" />
                Ver Histórico Completo
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {visibleSessions.map((session) => (
                <ImportHistoryCard key={session.id} session={session} />
              ))}

              {hasMoreSessions && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setVisibleImportsCount((prev) => prev + 3)}
                >
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Carregar Mais ({importSessions.length - visibleImportsCount} restantes)
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
