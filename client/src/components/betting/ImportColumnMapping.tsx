import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getColumnMapping } from '@/utils/importTemplateGenerator';
import { FileQuestion } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export function ImportColumnMapping() {
  const { t } = useTranslation();
  const { required, optional } = getColumnMapping();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileQuestion className="h-5 w-5" />
          {t('import.columnMapping.title')}
        </CardTitle>
        <CardDescription>
          {t('import.columnMapping.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Required Fields */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">{t('import.columnMapping.requiredFields')}</h3>
            <Badge variant="destructive" className="text-xs">
              {t('import.columnMapping.requiredBadge')}
            </Badge>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[200px] font-semibold">{t('import.columnMapping.columnHeader')}</TableHead>
                  <TableHead className="font-semibold">{t('import.columnMapping.descriptionHeader')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {required.map((col) => (
                  <TableRow key={col.name}>
                    <TableCell className="font-mono text-sm bg-red-50 dark:bg-red-950/20">
                      {col.name}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {t(`import.columns.${col.key}`)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <Separator />

        {/* Optional Fields */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">{t('import.columnMapping.optionalFields')}</h3>
            <Badge variant="secondary" className="text-xs">
              {t('import.columnMapping.optionalBadge')}
            </Badge>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[200px] font-semibold">{t('import.columnMapping.columnHeader')}</TableHead>
                  <TableHead className="font-semibold">{t('import.columnMapping.descriptionHeader')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {optional.map((col) => (
                  <TableRow key={col.name}>
                    <TableCell className="font-mono text-sm bg-blue-50 dark:bg-blue-950/20">
                      {col.name}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {t(`import.columns.${col.key}`)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Help text */}
        <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg text-sm space-y-1">
          <p className="font-medium text-blue-900 dark:text-blue-100">
            {t('import.columnMapping.importantTitle')}
          </p>
          <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-200">
            <li>
              <strong>{t('import.columnMapping.simpleBetTip').split(':')[0]}:</strong> {t('import.columnMapping.simpleBetTip').split(':')[1]}
            </li>
            <li>
              <strong>{t('import.columnMapping.multipleBetTip').split(':')[0]}:</strong> {t('import.columnMapping.multipleBetTip').split(':')[1]}
            </li>
            <li>
              {t('import.columnMapping.conditionalFieldsTip')}
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
