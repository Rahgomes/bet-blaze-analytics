import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { generateCSVTemplate, generateExcelTemplate } from '@/utils/importTemplateGenerator';
import { useTranslation } from '@/hooks/useTranslation';

export function ImportTemplateDownload() {
  const { t } = useTranslation();

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
          {t('import.template.title')}
        </CardTitle>
        <CardDescription>
          {t('import.template.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t('import.template.introText')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              onClick={handleDownloadCSV}
            >
              <FileText className="h-8 w-8 text-green-600" />
              <div className="text-center">
                <div className="font-semibold">{t('import.template.csvButton')}</div>
                <div className="text-xs text-muted-foreground">
                  {t('import.template.csvDescription')}
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
                <div className="font-semibold">{t('import.template.excelButton')}</div>
                <div className="text-xs text-muted-foreground">
                  {t('import.template.excelDescription')}
                </div>
              </div>
            </Button>
          </div>

          <div className="bg-muted p-3 rounded-lg text-sm space-y-1">
            <p className="font-medium">{t('import.template.tipsTitle')}</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>{t('import.template.tip1')}</li>
              <li>{t('import.template.tip2')}</li>
              <li>{t('import.template.tip3')}</li>
              <li>{t('import.template.tip4')}</li>
              <li>{t('import.template.tip5')}</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
