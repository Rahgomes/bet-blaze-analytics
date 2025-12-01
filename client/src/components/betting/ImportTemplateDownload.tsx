import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { generateCSVTemplate, generateExcelTemplate } from '@/utils/importTemplateGenerator';

export function ImportTemplateDownload() {
  const handleDownloadCSV = () => {
    try {
      generateCSVTemplate();
    } catch (error) {
      console.error('Error generating CSV template:', error);
    }
  };

  const handleDownloadExcel = () => {
    try {
      generateExcelTemplate();
    } catch (error) {
      console.error('Error generating Excel template:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Download de Template
        </CardTitle>
        <CardDescription>
          Baixe um modelo pronto para preencher com suas apostas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            O template já vem com exemplos de apostas simples e múltiplas para facilitar o preenchimento.
            Preencha os dados e faça upload do arquivo para importar suas apostas em massa.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              onClick={handleDownloadCSV}
            >
              <FileText className="h-8 w-8 text-green-600" />
              <div className="text-center">
                <div className="font-semibold">Baixar CSV</div>
                <div className="text-xs text-muted-foreground">
                  Formato universal, editável em qualquer programa
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              onClick={handleDownloadExcel}
            >
              <FileSpreadsheet className="h-8 w-8 text-blue-600" />
              <div className="text-center">
                <div className="font-semibold">Baixar Excel</div>
                <div className="text-xs text-muted-foreground">
                  Formato Excel (.xlsx) com formatação
                </div>
              </div>
            </Button>
          </div>

          <div className="bg-muted p-3 rounded-lg text-sm space-y-1">
            <p className="font-medium">Dicas para preenchimento:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Campos marcados com * são obrigatórios</li>
              <li>Para apostas múltiplas, use uma linha por leg com o mesmo operationNumber</li>
              <li>Use o formato YYYY-MM-DD para datas (ex: 2024-12-01)</li>
              <li>Separe tags com | (pipe), ex: "Value Bet|Linha Segura"</li>
              <li>Use true/false para campos booleanos</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
