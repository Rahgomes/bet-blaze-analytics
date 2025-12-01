import { ImportSession } from '@/types/import';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ImportHistoryCardProps {
  session: ImportSession;
  onViewDetails?: (session: ImportSession) => void;
}

export function ImportHistoryCard({ session, onViewDetails }: ImportHistoryCardProps) {
  const successRate = session.totalRows > 0
    ? ((session.successfulRows / session.totalRows) * 100).toFixed(1)
    : '0.0';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          {/* Icon and Info */}
          <div className="flex items-start gap-3 flex-1">
            <div className="mt-1">
              <FileSpreadsheet className="h-10 w-10 text-blue-600" />
            </div>

            <div className="flex-1 space-y-2">
              {/* File Name */}
              <div>
                <h3 className="font-semibold text-lg text-foreground">
                  {session.fileName}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {format(new Date(session.importDate), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </span>
                </div>
              </div>

              {/* Statistics */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline" className="text-xs">
                    {session.totalRows} linhas
                  </Badge>
                </div>

                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">
                    {session.successfulRows} importadas
                  </span>
                </div>

                {session.failedRows > 0 && (
                  <div className="flex items-center gap-1.5">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-600">
                      {session.failedRows} falharam
                    </span>
                  </div>
                )}

                <div>
                  <Badge
                    variant={session.failedRows === 0 ? 'default' : 'secondary'}
                    className={session.failedRows === 0 ? 'bg-green-600' : ''}
                  >
                    {successRate}% sucesso
                  </Badge>
                </div>
              </div>

              {/* Bet Count */}
              <div className="text-sm text-muted-foreground">
                {session.betIds.length} aposta(s) criada(s)
              </div>
            </div>
          </div>

          {/* Action Button */}
          {onViewDetails && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(session)}
            >
              Ver Detalhes
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
