import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getColumnMapping } from '@/utils/importTemplateGenerator';
import { FileQuestion } from 'lucide-react';

export function ImportColumnMapping() {
  const { required, optional } = getColumnMapping();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileQuestion className="h-5 w-5" />
          Mapeamento de Colunas
        </CardTitle>
        <CardDescription>
          Entenda o que cada coluna significa no arquivo de importação
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Required Fields */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">Campos Obrigatórios</h3>
            <Badge variant="destructive" className="text-xs">
              Obrigatórios
            </Badge>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[200px] font-semibold">Coluna</TableHead>
                  <TableHead className="font-semibold">Descrição</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {required.map((col) => (
                  <TableRow key={col.name}>
                    <TableCell className="font-mono text-sm bg-red-50 dark:bg-red-950/20">
                      {col.name}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {col.description}
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
            <h3 className="font-semibold text-sm">Campos Opcionais</h3>
            <Badge variant="secondary" className="text-xs">
              Opcionais
            </Badge>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[200px] font-semibold">Coluna</TableHead>
                  <TableHead className="font-semibold">Descrição</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {optional.map((col) => (
                  <TableRow key={col.name}>
                    <TableCell className="font-mono text-sm bg-blue-50 dark:bg-blue-950/20">
                      {col.name}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {col.description}
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
            Importante:
          </p>
          <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-200">
            <li>
              <strong>Apostas Simples:</strong> Use apenas 1 linha com legNumber=1
            </li>
            <li>
              <strong>Apostas Múltiplas:</strong> Use uma linha por leg, todas com o mesmo operationNumber ou description
            </li>
            <li>
              Campos condicionais (como originalOdds) só são obrigatórios se o campo relacionado (hasBoost) for true
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
