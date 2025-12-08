import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from '@/hooks/useTranslation';
import { useBettingStore } from '@/stores/betting';
import { generateMockTips } from '@/utils/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, ArrowRight, Trash2, Eye, Star } from 'lucide-react';
import { toast } from 'sonner';
import { Tip } from '@/types/betting';

export default function Tips() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const realTips = useBettingStore(state => state.tips);
  const tipsters = useBettingStore(state => state.tipsters);
  const addTip = useBettingStore(state => state.addTip);
  const updateTip = useBettingStore(state => state.updateTip);
  const deleteTip = useBettingStore(state => state.deleteTip);

  // Merge real tips with mock tips for demonstration
  const allTips = useMemo(() => {
    const mockTips = realTips.length === 0 ? generateMockTips() : [];
    return [...realTips, ...mockTips];
  }, [realTips]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedTip, setSelectedTip] = useState<Tip | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTipster, setFilterTipster] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [formData, setFormData] = useState({
    tipsterId: '',
    title: '',
    description: '',
    match: '',
    market: '',
    suggestedStake: '',
    suggestedOdds: '',
    betType: 'simple' as const,
    confidence: 'medium' as 'low' | 'medium' | 'high',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.tipsterId || !formData.title || !formData.match || !formData.suggestedOdds) {
      toast.error(t('common.error'));
      return;
    }

    addTip({
      tipsterId: formData.tipsterId,
      title: formData.title,
      description: formData.description,
      match: formData.match,
      market: formData.market,
      date: new Date().toISOString(),
      suggestedOdds: parseFloat(formData.suggestedOdds),
      suggestedStake: formData.suggestedStake ? parseFloat(formData.suggestedStake) : undefined,
      betType: formData.betType,
      confidence: formData.confidence,
      status: 'pending',
      notes: formData.notes,
    });

    setFormData({
      tipsterId: '',
      title: '',
      description: '',
      match: '',
      market: '',
      suggestedStake: '',
      suggestedOdds: '',
      betType: 'simple',
      confidence: 'medium',
      notes: ''
    });
    setIsAddDialogOpen(false);
    toast.success(t('common.success'));
  };

  const handleDelete = (id: string) => {
    if (id.startsWith('mock-tip-')) {
      toast.error('Não é possível excluir dados de demonstração. Adicione dicas reais para gerenciá-las.');
      return;
    }
    if (window.confirm(t('common.confirmDelete'))) {
      deleteTip(id);
      toast.success(t('common.success'));
    }
  };

  const handleConvertToBet = (tip: Tip) => {
    if (tip.id.startsWith('mock-tip-')) {
      toast.error('Não é possível converter dicas de demonstração. Adicione dicas reais para convertê-las em apostas.');
      return;
    }
    setLocation('/add-bet');
  };

  const getTipsterName = (tipsterId: string) => {
    return tipsters.find(t => t.id === tipsterId)?.name || 'Tipster Desconhecido';
  };

  const getTipsterRating = (tipsterId: string) => {
    return tipsters.find(t => t.id === tipsterId)?.rating || 0;
  };

  const filteredTips = useMemo(() => {
    return allTips.filter(tip => {
      const matchesSearch = tip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tip.match.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tip.market.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTipster = filterTipster === 'all' || tip.tipsterId === filterTipster;
      const matchesStatus = filterStatus === 'all' || tip.status === filterStatus;
      return matchesSearch && matchesTipster && matchesStatus;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allTips, searchQuery, filterTipster, filterStatus]);

  const getConfidenceBadge = (confidence: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      low: 'secondary',
      medium: 'default',
      high: 'destructive',
    };
    return <Badge variant={variants[confidence]}>{t(`tips.${confidence}`)}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      pending: 'default',
      converted: 'secondary',
      archived: 'outline',
    };
    return <Badge variant={variants[status]}>{t(`tips.${status}`)}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">{t('tips.title')}</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              {t('tips.addTip')}
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('tips.addTip')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('tips.tipster')}</Label>
                  <Select
                    value={formData.tipsterId}
                    onValueChange={(value) => setFormData({ ...formData, tipsterId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('tips.filterByTipster')} />
                    </SelectTrigger>
                    <SelectContent>
                      {tipsters.map((tipster) => (
                        <SelectItem key={tipster.id} value={tipster.id}>
                          {tipster.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t('tips.betType')}</Label>
                  <Select
                    value={formData.betType}
                    onValueChange={(value: any) => setFormData({ ...formData, betType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="simple">Simples</SelectItem>
                      <SelectItem value="multiple">Múltipla</SelectItem>
                      <SelectItem value="live">Ao Vivo</SelectItem>
                      <SelectItem value="system">Sistema</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>{t('tips.title_field')}</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="ex: Flamengo Vitória - Aposta de Valor"
                  required
                />
              </div>

              <div>
                <Label>{t('tips.description')}</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Análise detalhada e justificativa..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('tips.match')}</Label>
                  <Input
                    value={formData.match}
                    onChange={(e) => setFormData({ ...formData, match: e.target.value })}
                    placeholder="Time A vs Time B"
                    required
                  />
                </div>
                <div>
                  <Label>{t('tips.market')}</Label>
                  <Input
                    value={formData.market}
                    onChange={(e) => setFormData({ ...formData, market: e.target.value })}
                    placeholder="Resultado Final, Mais de 2.5, etc."
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>{t('tips.suggestedOdds')}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.suggestedOdds}
                    onChange={(e) => setFormData({ ...formData, suggestedOdds: e.target.value })}
                    placeholder="1.85"
                    required
                  />
                </div>
                <div>
                  <Label>{t('tips.suggestedStake')}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.suggestedStake}
                    onChange={(e) => setFormData({ ...formData, suggestedStake: e.target.value })}
                    placeholder="10.00"
                  />
                </div>
                <div>
                  <Label>{t('tips.confidence')}</Label>
                  <Select
                    value={formData.confidence}
                    onValueChange={(value: any) => setFormData({ ...formData, confidence: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">{t('tips.low')}</SelectItem>
                      <SelectItem value="medium">{t('tips.medium')}</SelectItem>
                      <SelectItem value="high">{t('tips.high')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>{t('tips.notes')}</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Observações adicionais..."
                  rows={2}
                />
              </div>

              <Button type="submit" className="w-full">{t('common.save')}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>{t('common.search')}</Label>
              <Input
                placeholder={t('tips.searchTips')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <Label>{t('tips.filterByTipster')}</Label>
              <Select value={filterTipster} onValueChange={setFilterTipster}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipsters</SelectItem>
                  {tipsters.map((tipster) => (
                    <SelectItem key={tipster.id} value={tipster.id}>
                      {tipster.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('tips.filterByStatus')}</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="pending">{t('tips.pending')}</SelectItem>
                  <SelectItem value="converted">{t('tips.converted')}</SelectItem>
                  <SelectItem value="archived">{t('tips.archived')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('tips.title')} ({filteredTips.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('tips.tipster')}</TableHead>
                <TableHead>{t('tips.title_field')}</TableHead>
                <TableHead>{t('tips.match')}</TableHead>
                <TableHead>{t('tips.market')}</TableHead>
                <TableHead>{t('tips.odds')}</TableHead>
                <TableHead>{t('tips.confidence')}</TableHead>
                <TableHead>{t('tips.status')}</TableHead>
                <TableHead>{t('bets.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTips.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    {t('common.noData')}
                  </TableCell>
                </TableRow>
              ) : (
                filteredTips.map((tip) => (
                  <TableRow key={tip.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{getTipsterName(tip.tipsterId)}</span>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                          {getTipsterRating(tip.tipsterId).toFixed(1)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{tip.title}</TableCell>
                    <TableCell>{tip.match}</TableCell>
                    <TableCell>{tip.market}</TableCell>
                    <TableCell>{tip.suggestedOdds.toFixed(2)}</TableCell>
                    <TableCell>{getConfidenceBadge(tip.confidence)}</TableCell>
                    <TableCell>{getStatusBadge(tip.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedTip(tip)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {tip.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleConvertToBet(tip)}
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteTip(tip.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Tip Detail Dialog */}
      <Dialog open={!!selectedTip} onOpenChange={() => setSelectedTip(null)}>
        <DialogContent className="bg-card max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('tips.tipDetails')}</DialogTitle>
            <DialogDescription>
              {selectedTip && getTipsterName(selectedTip.tipsterId)}
            </DialogDescription>
          </DialogHeader>
          {selectedTip && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedTip.title}</h3>
                <p className="text-sm text-muted-foreground">{selectedTip.match}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">{t('tips.market')}</Label>
                  <p className="font-medium">{selectedTip.market}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('tips.betType')}</Label>
                  <p className="font-medium capitalize">{selectedTip.betType === 'simple' ? 'simples' : selectedTip.betType === 'multiple' ? 'múltipla' : selectedTip.betType === 'live' ? 'ao vivo' : selectedTip.betType === 'system' ? 'sistema' : selectedTip.betType}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('tips.suggestedOdds')}</Label>
                  <p className="font-medium">{selectedTip.suggestedOdds.toFixed(2)}</p>
                </div>
                {selectedTip.suggestedStake && (
                  <div>
                    <Label className="text-muted-foreground">{t('tips.suggestedStake')}</Label>
                    <p className="font-medium">R$ {selectedTip.suggestedStake.toFixed(2)}</p>
                  </div>
                )}
                <div>
                  <Label className="text-muted-foreground">{t('tips.confidence')}</Label>
                  <div className="mt-1">{getConfidenceBadge(selectedTip.confidence)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('tips.status')}</Label>
                  <div className="mt-1">{getStatusBadge(selectedTip.status)}</div>
                </div>
              </div>

              {selectedTip.description && (
                <div>
                  <Label className="text-muted-foreground">{t('tips.description')}</Label>
                  <p className="mt-1 text-sm">{selectedTip.description}</p>
                </div>
              )}

              {selectedTip.notes && (
                <div>
                  <Label className="text-muted-foreground">{t('tips.notes')}</Label>
                  <p className="mt-1 text-sm">{selectedTip.notes}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                {selectedTip.status === 'pending' && (
                  <Button
                    className="flex-1"
                    onClick={() => {
                      handleConvertToBet(selectedTip);
                      setSelectedTip(null);
                    }}
                  >
                    <ArrowRight className="mr-2 h-4 w-4" />
                    {t('tips.convertToBet')}
                  </Button>
                )}
                <Button variant="outline" onClick={() => setSelectedTip(null)}>
                  {t('common.close')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
