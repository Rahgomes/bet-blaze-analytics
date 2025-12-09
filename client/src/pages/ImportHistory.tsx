import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { ImportSession } from '@/types/import';
import { useBettingStore } from '@/stores/betting';
import { useTranslation } from '@/hooks/useTranslation';
import { ImportHistoryCard } from '@/components/betting/ImportHistoryCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, History, FileSpreadsheet, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';

export default function ImportHistory() {
  const [, setLocation] = useLocation();
  const { t, language } = useTranslation();
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

  const locale = language === 'pt-br' ? ptBR : enUS;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('importHistory.title')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('importHistory.subtitle')}
          </p>
        </div>
        <Button variant="outline" onClick={() => setLocation('/import')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('importHistory.back')}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>{t('importHistory.summary.totalImports')}</CardDescription>
            <CardTitle className="text-3xl">{stats.totalImports}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>{t('importHistory.summary.betsImported')}</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{stats.totalBets}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>{t('importHistory.summary.linesProcessed')}</CardDescription>
            <CardTitle className="text-3xl text-purple-600">{stats.totalRows}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>{t('importHistory.summary.successRate')}</CardDescription>
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
                  {t('importHistory.latestImport')}
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {stats.latestImport.fileName} -{' '}
                  {format(new Date(stats.latestImport.importDate),
                    language === 'pt-br' ? "dd/MM/yyyy 'às' HH:mm" : "MM/dd/yyyy 'at' HH:mm", {
                    locale,
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
          <CardTitle>{t('importHistory.search.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="search">{t('importHistory.search.fileNameLabel')}</Label>
            <Input
              id="search"
              placeholder={t('importHistory.search.fileNamePlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Import Sessions List */}
      <Card>
        <CardHeader>
          <CardTitle>{t('importHistory.allImports.title')}</CardTitle>
          <CardDescription>
            {filteredSessions.length === sessions.length
              ? t('importHistory.allImports.count').replace('{count}', sessions.length.toString())
              : t('importHistory.allImports.filteredCount')
                  .replace('{filtered}', filteredSessions.length.toString())
                  .replace('{total}', sessions.length.toString())}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSessions.length === 0 ? (
            <div className="text-center py-12">
              <FileSpreadsheet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm
                  ? t('importHistory.empty.noResults')
                  : t('importHistory.empty.noImports')}
              </p>
              {!searchTerm && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setLocation('/import')}
                >
                  {t('importHistory.empty.firstImport')}
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
                            {t('importHistory.betsSection.title').replace('{count}', sessionBets.length.toString())}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {sessionBets.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                              {t('importHistory.betsSection.noBets')}
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
                                          {format(new Date(bet.date),
                                            language === 'pt-br' ? 'dd/MM/yyyy' : 'MM/dd/yyyy', { locale })}
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
                                          ? t('bets.status.won')
                                          : bet.status === 'lost'
                                          ? t('bets.status.lost')
                                          : bet.status === 'void'
                                          ? t('bets.status.void')
                                          : t('bets.status.pending')}
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
