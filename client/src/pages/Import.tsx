import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useBettingData } from '@/hooks/useBettingData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import { Bet, BetType, BetStatus } from '@/types/betting';

export default function Import() {
  const { t } = useTranslation();
  const { addBet } = useBettingData();
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());

    return lines.slice(1).map(line => {
      const values = line.split(',');
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = values[index]?.trim() || '';
      });
      return obj;
    });
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Por favor, selecione um arquivo');
      return;
    }

    setImporting(true);
    try {
      const text = await file.text();
      const rows = parseCSV(text);

      let imported = 0;
      for (const row of rows) {
        // Map CSV columns to bet structure
        // Expected columns: bookmaker, date, betType, amount, odds, status, description
        if (row.amount && row.odds) {
          const amount = parseFloat(row.amount);
          const odds = parseFloat(row.odds);
          const returnAmount = row.status === 'won' ? amount * odds : 0;

          addBet({
            bookmaker: row.bookmaker || 'Manual',
            date: row.date || new Date().toISOString().split('T')[0],
            betType: (row.betType as BetType) || 'simple',
            amount,
            odds,
            return: returnAmount,
            profit: returnAmount - amount,
            status: (row.status as BetStatus) || 'pending',
            description: row.description || '',
            sourceType: 'import',
          });
          imported++;
        }
      }

      toast.success(t('import.importSuccess').replace('{count}', imported.toString()));
      setFile(null);
    } catch (error) {
      console.error('Import error:', error);
      toast.error(t('common.error'));
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">{t('import.title')}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t('import.uploadFile')}</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Importe suas apostas em formato CSV ou Excel. Os valores monetários devem estar em Real brasileiro (R$).
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
            <FileSpreadsheet className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <div className="space-y-2">
              <Label htmlFor="file-upload" className="cursor-pointer">
                <div className="text-lg font-medium text-foreground">
                  {t('import.selectFile')}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {t('import.dragDrop')}
                </div>
              </Label>
              <Input
                id="file-upload"
                type="file"
                accept=".csv,.xlsx"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            {file && (
              <div className="mt-4 text-sm text-foreground">
                Selecionado: {file.name}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">{t('import.columnMapping')}</h3>
            <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
              <p><strong>bookmaker</strong> - Nome da casa de apostas</p>
              <p><strong>date</strong> - Data da aposta (AAAA-MM-DD)</p>
              <p><strong>betType</strong> - simples, múltipla, ao vivo ou sistema</p>
              <p><strong>amount</strong> - Valor apostado (em R$)</p>
              <p><strong>odds</strong> - Valor das odds</p>
              <p><strong>status</strong> - pendente, ganha, perdida ou anulada</p>
              <p><strong>description</strong> - Descrição da aposta</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Exemplo de arquivo CSV:</h4>
              <div className="bg-gray-900 p-3 rounded-lg text-xs font-mono text-green-400 overflow-x-auto">
                <div>bookmaker,date,betType,amount,odds,status,description</div>
                <div>Bet365,2024-11-01,simples,50.00,1.85,ganha,Flamengo vs Palmeiras - Vitória Flamengo</div>
                <div>Betfair,2024-11-02,múltipla,25.00,3.20,perdida,Arsenal + Liverpool Vitórias</div>
                <div>Betano,2024-11-03,simples,30.00,2.10,pendente,Real Madrid vs Barcelona - Mais de 2.5 gols</div>
              </div>
            </div>
          </div>

          <Button
            onClick={handleImport}
            disabled={!file || importing}
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            {importing ? t('common.loading') : t('import.import')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
