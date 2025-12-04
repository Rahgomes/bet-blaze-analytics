import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { ImportSession } from '@/types/import';
import { useBettingStore } from '@/stores/betting';
import { ImportHistoryCard } from '@/components/betting/ImportHistoryCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, History, FileSpreadsheet, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ImportHistory() {
  const [, setLocation] = useLocation();
  const getImportSessions = useBettingStore(state => state.getImportSessions);
  const bets = useBettingStore(state => state.bets);
  const sessions = getImportSessions();

  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  // Filter sessions based on search
  const filteredSessions = useMemo(() => {
    if (!searchTerm) return sessions;

    const term = searchTerm.toLowerCase();
    return sessions.filter((session) =>
      session.fileName.toLowerCase().includes(term)
    );
  }, [sessions, searchTerm]);

  // Calculate summary statistics
  const stats = useMemo(() => {
    const totalImports = sessions.length;
    const totalBets = sessions.reduce((sum, s) => sum + s.betIds.length, 0);
    const totalRows = sessions.reduce((sum, s) => sum + s.totalRows, 0);
    const totalSuccessful = sessions.reduce((sum, s) => sum + s.successfulRows, 0);
    const latestImport = sessions.length > 0 ? sessions[0] : null;

    return {
      totalImports,
      totalBets,
      totalRows,
      totalSuccessful,
      latestImport,
    };
  }, [sessions]);

  const handleViewDetails = (session: ImportSession) => {
    setExpandedSession(expandedSession === session.id ? null : session.id);
  };

  const getBetsForSession = (sessionId: string) => {
    return bets.filter((bet) => bet.importSessionId === sessionId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Histórico de Importações</h1>
          <p className="text-muted-foreground mt-1">
            Visualize todas as suas importações anteriores
          </p>
        </div>
        <Button variant="outline" onClick={() => setLocation('/import')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total de Importações</CardDescription>
            <CardTitle className="text-3xl">{stats.totalImports}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Apostas Importadas</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{stats.totalBets}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Linhas Processadas</CardDescription>
            <CardTitle className="text-3xl text-purple-600">{stats.totalRows}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Taxa de Sucesso</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {stats.totalRows > 0
                ? `${((stats.totalSuccessful / stats.totalRows) * 100).toFixed(1)}%`
                : '0%'}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Latest Import Info */}
      {stats.latestImport && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  Última importação
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {stats.latestImport.fileName} -{' '}
                  {format(new Date(stats.latestImport.importDate), "dd/MM/yyyy 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Importações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="search">Nome do Arquivo</Label>
            <Input
              id="search"
              placeholder="Digite o nome do arquivo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Import Sessions List */}
      <Card>
        <CardHeader>
          <CardTitle>Todas as Importações</CardTitle>
          <CardDescription>
            {filteredSessions.length === sessions.length
              ? `${sessions.length} importação(ões) encontrada(s)`
              : `${filteredSessions.length} de ${sessions.length} importação(ões)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSessions.length === 0 ? (
            <div className="text-center py-12">
              <FileSpreadsheet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm
                  ? 'Nenhuma importação encontrada com esse termo'
                  : 'Nenhuma importação realizada ainda'}
              </p>
              {!searchTerm && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setLocation('/import')}
                >
                  Fazer Primeira Importação
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSessions.map((session) => {
                const isExpanded = expandedSession === session.id;
                const sessionBets = getBetsForSession(session.id);

                return (
                  <div key={session.id} className="space-y-2">
                    <ImportHistoryCard session={session} onViewDetails={handleViewDetails} />

                    {/* Expanded Section - Show Bets */}
                    {isExpanded && (
                      <Card className="ml-8 border-l-4 border-blue-500">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <ChevronDown className="h-4 w-4" />
                            Apostas desta Importação ({sessionBets.length})
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {sessionBets.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                              Nenhuma aposta encontrada para esta importação
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {sessionBets.map((bet) => (
                                <div
                                  key={bet.id}
                                  className="p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                                >
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                      <p className="text-sm font-medium">{bet.description}</p>
                                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                        <span>{bet.bookmaker}</span>
                                        <Separator orientation="vertical" className="h-3" />
                                        <span>R$ {bet.amount.toFixed(2)}</span>
                                        <Separator orientation="vertical" className="h-3" />
                                        <span>Odds {bet.odds.toFixed(2)}</span>
                                        <Separator orientation="vertical" className="h-3" />
                                        <span>
                                          {format(new Date(bet.date), 'dd/MM/yyyy', { locale: ptBR })}
                                        </span>
                                      </div>
                                    </div>
                                    <div>
                                      <Badge
                                        variant={
                                          bet.status === 'won'
                                            ? 'default'
                                            : bet.status === 'lost'
                                            ? 'destructive'
                                            : 'secondary'
                                        }
                                        className={
                                          bet.status === 'won'
                                            ? 'bg-green-600'
                                            : bet.status === 'void'
                                            ? 'bg-gray-500'
                                            : ''
                                        }
                                      >
                                        {bet.status === 'won'
                                          ? 'Ganha'
                                          : bet.status === 'lost'
                                          ? 'Perdida'
                                          : bet.status === 'void'
                                          ? 'Anulada'
                                          : 'Pendente'}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
