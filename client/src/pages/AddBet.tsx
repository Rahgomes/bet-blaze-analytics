import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import { useBettingData } from '@/hooks/useBettingData';
import { useExtendedData } from '@/hooks/useExtendedData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { BetType, BetStatus } from '@/types/betting';

export default function AddBet() {
  const [, setLocation] = useLocation();
  const { addBet, bookmakers } = useBettingData();
  const { updateTip } = useExtendedData();
  const { toast } = useToast();

  const locationState = null as {
    prefill?: {
      description?: string;
      odds?: string;
      amount?: string;
      betType?: BetType;
      stakeLogic?: string;
    };
    sourceTipId?: string;
  } | null;

  const protectionTypes = ['DC (Double Chance)', 'DNB (Draw No Bet)', 'Asian Handicap', 'European Handicap', 'Cash Out Available'];

  // Data para esportes e mercados
  const sportMarkets = {
    'Futebol': [
      'Resultado Final', 'Ambas Marcam', 'Total de Gols',
      'Aposta Criada/Bet Builder', 'Back ao Favorito', 'Back à Zebra', 
      'Escanteios', 'Cartões', 'Handicap', 'Resultado 1º Tempo'
    ],
    'Basquete': ['Spread', 'Total de Pontos', 'Vencedor'],
    'Tênis': ['Vencedor da Partida', 'Total de Games', 'Handicap Games'],
    'E-Sports': ['Vencedor', 'Mapas', 'Total de Kills'],
    'Outros': ['Vencedor', 'Handicap', 'Total']
  };

  const strategies = [
    'Linha Segura', 'Value Betting', 'Arbitragem',
    'Kelly Criterion', 'Flat Betting', 'Progressão'
  ];

  const leagues = [
    'Brasileirão Série A', 'Premier League', 'La Liga', 
    'Champions League', 'Libertadores', 'Copa do Brasil',
    'Serie A', 'Bundesliga', 'Ligue 1', 'Europa League'
  ];

  const predefinedTags = [
    'Value Bet', 'Linha Segura', 'Alto Risco', 'Arbitragem',
    'Aposta Principal', 'Hedge', 'Experimental', 'Seguindo Tipster'
  ];

  const [formData, setFormData] = useState({
    bookmaker: '',
    date: new Date().toISOString().split('T')[0],
    betType: 'simple' as BetType,
    amount: '',
    odds: '',
    status: 'pending' as BetStatus,
    description: '',
    stakeLogic: '',
    protectionTypes: [] as string[],
    isLive: false,
    league: '',
    market: '',
    matchTime: new Date().toISOString().slice(0, 16),
    // Novos campos avançados
    sport: 'Futebol',
    strategy: '',
    hasBoost: false,
    originalOdds: '',
    boostPercentage: '',
    hasCashout: false,
    cashoutValue: '',
    cashoutTime: '',
    usedCredits: false,
    creditsAmount: '',
    hasEarlyPayout: false,
    isRiskFree: false,
    riskFreeAmount: '',
    finalScore: '',
    resultTime: '',
    tags: [] as string[],
    operationNumber: '',
  });

  // Cálculos em tempo real para preview
  const calculations = useMemo(() => {
    const amount = parseFloat(formData.amount) || 0;
    const odds = parseFloat(formData.odds) || 0;
    const potentialReturn = amount * odds;
    const potentialProfit = potentialReturn - amount;
    const roi = amount > 0 ? ((potentialProfit / amount) * 100) : 0;
    
    return {
      potentialReturn: potentialReturn.toFixed(2),
      potentialProfit: potentialProfit.toFixed(2),
      roi: roi.toFixed(1)
    };
  }, [formData.amount, formData.odds]);

  // Validações inteligentes
  const validations = useMemo(() => {
    const amount = parseFloat(formData.amount) || 0;
    const odds = parseFloat(formData.odds) || 0;
    const bankroll = 500; // Valor exemplo - deve vir do contexto
    
    return {
      oddsAlert: odds > 10 ? 'Odds muito alta - verifique se está correta' : null,
      amountAlert: amount > (bankroll * 0.1) ? 'Valor alto para a banca atual' : null,
      stakeSuggestion: `Sugestão: 2% da banca = R$ ${(bankroll * 0.02).toFixed(2)}`,
      roiWarning: calculations.roi > '500' ? 'ROI muito alto - confirme os dados' : null
    };
  }, [formData.amount, formData.odds, calculations.roi]);

  useEffect(() => {
    if (locationState?.prefill) {
      setFormData(prev => ({
        ...prev,
        ...locationState.prefill,
      }));
    }
  }, [locationState]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(formData.amount);
    const odds = parseFloat(formData.odds);

    if (!formData.bookmaker || !formData.date || !amount || !odds) {
      toast({
        title: 'Erro',
        description: 'Por favor, preencha todos os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    const return_ = formData.status === 'won' ? amount * odds : 0;
    const profit = return_ - amount;

    const betData = {
      bookmaker: formData.bookmaker,
      date: formData.date,
      betType: formData.betType,
      amount,
      odds,
      return: return_,
      profit,
      status: formData.status,
      description: formData.description,
      stakeLogic: formData.stakeLogic,
      isProtected: formData.protectionTypes.length > 0,
      isLive: formData.isLive,
      league: formData.league || undefined,
      market: formData.market || undefined,
      strategies: formData.protectionTypes.length > 0 ? formData.protectionTypes : undefined,
      matchTime: formData.matchTime || undefined,
      sourceType: locationState?.sourceTipId ? 'tip' as const : 'manual' as const,
      sourceTipId: locationState?.sourceTipId,
    };

    addBet(betData);

    // If this bet was created from a tip, mark the tip as converted
    if (locationState?.sourceTipId) {
      updateTip(locationState.sourceTipId, {
        status: 'converted',
        convertedBetId: betData.description, // We'll use a proper ID after bet is created
      });
    }

    toast({
      title: 'Sucesso',
      description: 'Aposta adicionada com sucesso',
    });

    setLocation('/bets');
  };

  // Componente do Preview Card
  const PreviewCard = () => (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle>Preview da Aposta</CardTitle>
        <CardDescription>Acompanhe os cálculos em tempo real</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Valor Apostado:</span>
            <span className="font-bold">R$ {formData.amount || '0,00'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Odds {formData.hasBoost ? '(com boost)' : ''}:</span>
            <span className="font-bold">{formData.odds || '0,00'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Retorno Potencial:</span>
            <span className="font-bold text-green-600">
              R$ {calculations.potentialReturn}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Lucro Potencial:</span>
            <span className="font-bold text-blue-600">
              R$ {calculations.potentialProfit}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">ROI:</span>
            <span className="font-bold text-purple-600">
              {calculations.roi}%
            </span>
          </div>

          {/* Badges dinâmicos */}
          <div className="flex flex-wrap gap-1 mt-4 pt-3 border-t">
            {formData.hasBoost && formData.boostPercentage && <Badge variant="secondary">BOOST +{formData.boostPercentage}%</Badge>}
            {formData.usedCredits && <Badge variant="outline">CRÉDITOS</Badge>}
            {formData.hasCashout && <Badge variant="outline">CASHOUT</Badge>}
            {formData.isLive && <Badge variant="destructive" className="animate-pulse">AO VIVO</Badge>}
            {formData.hasEarlyPayout && <Badge className="bg-orange-500">PAGAMENTO ANTECIPADO</Badge>}
            {formData.isRiskFree && <Badge className="bg-green-600">SEM RISCO</Badge>}
          </div>

          {/* Alertas e validações */}
          {validations.oddsAlert && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">⚠️ {validations.oddsAlert}</p>
            </div>
          )}
          {validations.amountAlert && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs text-red-800">🚨 {validations.amountAlert}</p>
            </div>
          )}
          {validations.roiWarning && (
            <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-xs text-orange-800">⚡ {validations.roiWarning}</p>
            </div>
          )}
          
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">💡 {validations.stakeSuggestion}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Adicionar Aposta</h1>
        <p className="text-muted-foreground">Registrar uma nova aposta com funcionalidades avançadas</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Seção 1: Identificação da Aposta */}
            <Card>
              <CardHeader>
                <CardTitle>Identificação da Aposta</CardTitle>
                <CardDescription>Dados básicos da operação</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="operationNumber">Número da Operação</Label>
                    <Input
                      id="operationNumber"
                      value={formData.operationNumber}
                      onChange={(e) => setFormData({ ...formData, operationNumber: e.target.value })}
                      placeholder="ex: #001, OP-2024-001"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bookmaker">Casa de Apostas *</Label>
                    <Select value={formData.bookmaker} onValueChange={(value) => setFormData({ ...formData, bookmaker: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar casa de apostas" />
                      </SelectTrigger>
                      <SelectContent>
                        {bookmakers.map((bm) => (
                          <SelectItem key={bm.id} value={bm.name}>{bm.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Data da Aposta *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="betType">Tipo de Aposta *</Label>
                    <Select value={formData.betType} onValueChange={(value) => setFormData({ ...formData, betType: value as BetType })}>
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

                  <div className="space-y-2">
                    <Label htmlFor="status">Status *</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as BetStatus })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="won">Ganha</SelectItem>
                        <SelectItem value="lost">Perdida</SelectItem>
                        <SelectItem value="void">Anulada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="isLive">Aposta Ao Vivo</Label>
                      <p className="text-xs text-muted-foreground">Feita durante o jogo</p>
                    </div>
                    <Switch
                      id="isLive"
                      checked={formData.isLive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isLive: checked })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seção 2: Valores e Odds */}
            <Card>
              <CardHeader>
                <CardTitle>Valores e Odds</CardTitle>
                <CardDescription>Informações financeiras da aposta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Valor da Aposta (R$) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0,00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="odds">Odds Final *</Label>
                    <Input
                      id="odds"
                      type="number"
                      step="0.01"
                      min="1"
                      value={formData.odds}
                      onChange={(e) => setFormData({ ...formData, odds: e.target.value })}
                      placeholder="1.50"
                    />
                  </div>
                </div>

                {/* Boost/Aumento */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="hasBoost">Aposta com Boost/Aumento</Label>
                      <p className="text-sm text-muted-foreground">Odds foi aumentada pela casa</p>
                    </div>
                    <Switch
                      id="hasBoost"
                      checked={formData.hasBoost}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasBoost: checked })}
                    />
                  </div>

                  {formData.hasBoost && (
                    <div className="grid gap-4 md:grid-cols-2 pl-6 border-l-2 border-blue-200 bg-blue-50/30 p-4 rounded-lg">
                      <div className="space-y-2">
                        <Label htmlFor="originalOdds">Odds Original</Label>
                        <Input
                          id="originalOdds"
                          type="number"
                          step="0.01"
                          value={formData.originalOdds}
                          onChange={(e) => setFormData({ ...formData, originalOdds: e.target.value })}
                          placeholder="ex: 2.45"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="boostPercentage">Percentual de Aumento (%)</Label>
                        <Input
                          id="boostPercentage"
                          type="number"
                          step="0.1"
                          value={formData.boostPercentage}
                          onChange={(e) => setFormData({ ...formData, boostPercentage: e.target.value })}
                          placeholder="ex: 5.3"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Seção 3: Detalhes do Jogo */}
            <Card>
              <CardHeader>
                <CardTitle>Detalhes do Jogo</CardTitle>
                <CardDescription>Informações sobre o evento esportivo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="sport">Esporte *</Label>
                    <Select value={formData.sport} onValueChange={(value) => setFormData({ ...formData, sport: value, market: '' })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(sportMarkets).map((sport) => (
                          <SelectItem key={sport} value={sport}>{sport}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="market">Mercado *</Label>
                    <Select value={formData.market} onValueChange={(value) => setFormData({ ...formData, market: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o mercado" />
                      </SelectTrigger>
                      <SelectContent>
                        {sportMarkets[formData.sport as keyof typeof sportMarkets]?.map((market) => (
                          <SelectItem key={market} value={market}>{market}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="league">Liga / Competição</Label>
                    <Select value={formData.league} onValueChange={(value) => setFormData({ ...formData, league: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a liga" />
                      </SelectTrigger>
                      <SelectContent>
                        {leagues.map((league) => (
                          <SelectItem key={league} value={league}>{league}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="matchTime">Data e Hora do Jogo</Label>
                    <Input
                      id="matchTime"
                      type="datetime-local"
                      value={formData.matchTime}
                      onChange={(e) => setFormData({ ...formData, matchTime: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="strategy">Estratégia</Label>
                    <Select value={formData.strategy} onValueChange={(value) => setFormData({ ...formData, strategy: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a estratégia" />
                      </SelectTrigger>
                      <SelectContent>
                        {strategies.map((strategy) => (
                          <SelectItem key={strategy} value={strategy}>{strategy}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Campos condicionais para resultado */}
                {(formData.status === 'won' || formData.status === 'lost') && (
                  <div className="grid gap-4 md:grid-cols-2 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                    <div className="space-y-2">
                      <Label htmlFor="finalScore">Placar Final</Label>
                      <Input
                        id="finalScore"
                        value={formData.finalScore}
                        onChange={(e) => setFormData({ ...formData, finalScore: e.target.value })}
                        placeholder="ex: 2x1, 3x0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="resultTime">Tempo de Resultado</Label>
                      <Input
                        id="resultTime"
                        value={formData.resultTime}
                        onChange={(e) => setFormData({ ...formData, resultTime: e.target.value })}
                        placeholder="ex: 90+5'"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Seção 4: Funcionalidades Especiais */}
            <Card>
              <CardHeader>
                <CardTitle>Funcionalidades Especiais</CardTitle>
                <CardDescription>Cashout, créditos, proteções e outras funcionalidades</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Cashout */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="hasCashout">Cashout Disponível/Usado</Label>
                        <p className="text-sm text-muted-foreground">Encerramento antecipado</p>
                      </div>
                      <Switch
                        id="hasCashout"
                        checked={formData.hasCashout}
                        onCheckedChange={(checked) => setFormData({ ...formData, hasCashout: checked })}
                      />
                    </div>

                    {formData.hasCashout && (
                      <div className="grid gap-3 pl-4 border-l-2 border-blue-200 bg-blue-50/20 p-3 rounded">
                        <div className="space-y-2">
                          <Label htmlFor="cashoutValue">Valor do Cashout (R$)</Label>
                          <Input
                            id="cashoutValue"
                            type="number"
                            step="0.01"
                            value={formData.cashoutValue}
                            onChange={(e) => setFormData({ ...formData, cashoutValue: e.target.value })}
                            placeholder="0,00"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cashoutTime">Momento do Cashout</Label>
                          <Input
                            id="cashoutTime"
                            value={formData.cashoutTime}
                            onChange={(e) => setFormData({ ...formData, cashoutTime: e.target.value })}
                            placeholder="ex: 75' do jogo"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Créditos de Aposta */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="usedCredits">Feita com Créditos</Label>
                        <p className="text-sm text-muted-foreground">Aposta feita com créditos da casa</p>
                      </div>
                      <Switch
                        id="usedCredits"
                        checked={formData.usedCredits}
                        onCheckedChange={(checked) => setFormData({ ...formData, usedCredits: checked })}
                      />
                    </div>

                    {formData.usedCredits && (
                      <div className="pl-4 border-l-2 border-purple-200 bg-purple-50/20 p-3 rounded">
                        <div className="space-y-2">
                          <Label htmlFor="creditsAmount">Valor em Créditos (R$)</Label>
                          <Input
                            id="creditsAmount"
                            type="number"
                            step="0.01"
                            value={formData.creditsAmount}
                            onChange={(e) => setFormData({ ...formData, creditsAmount: e.target.value })}
                            placeholder="0,00"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Pagamento Antecipado */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="hasEarlyPayout">Pagamento Antecipado</Label>
                      <p className="text-sm text-muted-foreground">Pagamento recebido antes do fim</p>
                    </div>
                    <Switch
                      id="hasEarlyPayout"
                      checked={formData.hasEarlyPayout}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasEarlyPayout: checked })}
                    />
                  </div>

                  {/* Aposta Sem Risco */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="isRiskFree">Aposta Sem Risco/Protegida</Label>
                        <p className="text-sm text-muted-foreground">Valor protegido pela casa</p>
                      </div>
                      <Switch
                        id="isRiskFree"
                        checked={formData.isRiskFree}
                        onCheckedChange={(checked) => setFormData({ ...formData, isRiskFree: checked })}
                      />
                    </div>

                    {formData.isRiskFree && (
                      <div className="pl-4 border-l-2 border-green-200 bg-green-50/20 p-3 rounded">
                        <div className="space-y-2">
                          <Label htmlFor="riskFreeAmount">Valor Protegido (R$)</Label>
                          <Input
                            id="riskFreeAmount"
                            type="number"
                            step="0.01"
                            value={formData.riskFreeAmount}
                            onChange={(e) => setFormData({ ...formData, riskFreeAmount: e.target.value })}
                            placeholder="0,00"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tipos de Proteção */}
                <div className="space-y-3">
                  <Label>Tipos de Proteção Tradicionais</Label>
                  <p className="text-sm text-muted-foreground">Selecione as proteções que se aplicam a esta aposta</p>
                  <div className="grid gap-2 md:grid-cols-2">
                    {protectionTypes.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={type}
                          checked={formData.protectionTypes.includes(type)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData({ ...formData, protectionTypes: [...formData.protectionTypes, type] });
                            } else {
                              setFormData({ ...formData, protectionTypes: formData.protectionTypes.filter(t => t !== type) });
                            }
                          }}
                        />
                        <Label htmlFor={type} className="text-sm font-normal cursor-pointer">{type}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seção 5: Informações Complementares */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Complementares</CardTitle>
                <CardDescription>Descrição, lógica e tags da aposta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição Detalhada *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="ex: Flamengo vs São Paulo - Resultado Final (1x2). Flamengo em boa fase, São Paulo com desfalques..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stakeLogic">Lógica do Stake</Label>
                  <Textarea
                    id="stakeLogic"
                    value={formData.stakeLogic}
                    onChange={(e) => setFormData({ ...formData, stakeLogic: e.target.value })}
                    placeholder="Justificativa para o valor apostado, análise de risco, % da banca utilizada..."
                    rows={3}
                  />
                </div>

                {/* Sistema de Tags */}
                <div className="space-y-3">
                  <Label>Tags da Aposta</Label>
                  <p className="text-sm text-muted-foreground">Selecione até 5 tags para categorizar esta aposta</p>
                  <div className="grid gap-2 md:grid-cols-3">
                    {predefinedTags.map((tag) => (
                      <div key={tag} className="flex items-center space-x-2">
                        <Checkbox
                          id={tag}
                          checked={formData.tags.includes(tag)}
                          disabled={!formData.tags.includes(tag) && formData.tags.length >= 5}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData({ ...formData, tags: [...formData.tags, tag] });
                            } else {
                              setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
                            }
                          }}
                        />
                        <Label 
                          htmlFor={tag} 
                          className={`text-sm font-normal cursor-pointer ${
                            !formData.tags.includes(tag) && formData.tags.length >= 5 
                              ? 'text-muted-foreground' 
                              : ''
                          }`}
                        >
                          {tag}
                        </Label>
                      </div>
                    ))}
                  </div>
                  
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3 p-3 bg-gray-50 rounded-lg">
                      <span className="text-xs text-muted-foreground mr-2">Tags selecionadas:</span>
                      {formData.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Botões de Ação */}
            <div className="flex gap-4 pt-6">
              <Button type="submit" className="flex-1 h-12 text-lg">
                Adicionar Aposta
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="h-12"
                onClick={() => setLocation('/bets')}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>

        {/* Preview Lateral */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <PreviewCard />
        </div>
      </div>
    </div>
  );
}
