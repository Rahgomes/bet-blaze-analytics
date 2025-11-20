import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { useForm, FormProvider, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ReactSelect from 'react-select';
import { useBettingData } from '@/hooks/useBettingData';
import { useExtendedData } from '@/hooks/useExtendedData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { BetType, BetStatus } from '@/types/betting';
import { betFormSchema, BetFormData } from '@/lib/schemas/betFormSchema';
import { PreviewCard } from '@/components/betting/PreviewCard';
import { LegAccordion } from '@/components/betting/LegAccordion';
import { BetConfirmationModal } from '@/components/betting/BetConfirmationModal';

const protectionTypes = [
  'DC (Double Chance)',
  'DNB (Draw No Bet)',
  'Asian Handicap',
  'European Handicap',
  'Cash Out Available'
];

const sportMarkets: Record<string, string[]> = {
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

const createEmptyLeg = () => ({
  amount: '',
  odds: '',
  homeTeam: '',
  awayTeam: '',
  sport: 'Futebol',
  market: '',
  league: '',
  matchTime: new Date().toISOString().slice(0, 16),
  isLive: false,
  strategy: '',
  hasBoost: false,
  originalOdds: '',
  boostPercentage: '',
  usedCredits: false,
  creditsAmount: '',
  hasCashout: false,
  cashoutValue: '',
  cashoutTime: '',
  hasEarlyPayout: false,
  isRiskFree: false,
  riskFreeAmount: '',
  protectionTypes: [],
  status: 'pending' as BetStatus,
  finalScore: '',
  resultTime: '',
});

export default function AddBet() {
  const [, setLocation] = useLocation();
  const { addBet, bookmakers } = useBettingData();
  const { updateTip } = useExtendedData();
  const { toast } = useToast();

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<BetFormData | null>(null);

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

  const methods = useForm<BetFormData>({
    resolver: zodResolver(betFormSchema),
    defaultValues: {
      bookmaker: '',
      date: new Date().toISOString().split('T')[0],
      betType: 'simple',
      multipleQuantity: '1',
      operationNumber: '',
      legs: [createEmptyLeg()],
      description: '',
      stakeLogic: '',
      tags: [],
    },
    mode: 'onChange',
  });

  const { control, handleSubmit, watch, setValue, reset, formState } = methods;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'legs',
  });

  const watchedData = watch();
  const betType = watch('betType');
  const multipleQuantity = watch('multipleQuantity');
  const legs = watch('legs');

  useEffect(() => {
    const quantity = parseInt(multipleQuantity);
    const currentLegsCount = fields.length;

    if (quantity !== currentLegsCount) {
      if (quantity > currentLegsCount) {
        for (let i = currentLegsCount; i < quantity; i++) {
          append(createEmptyLeg());
        }
      } else {
        for (let i = currentLegsCount - 1; i >= quantity; i--) {
          remove(i);
        }
      }
    }
  }, [multipleQuantity, fields.length, append, remove]);

  useEffect(() => {
    if (locationState?.prefill) {
      if (locationState.prefill.description) setValue('description', locationState.prefill.description);
      if (locationState.prefill.stakeLogic) setValue('stakeLogic', locationState.prefill.stakeLogic);
      if (locationState.prefill.betType) setValue('betType', locationState.prefill.betType);
    }
  }, [locationState, setValue]);

  const calculations = useMemo(() => {
    const totalAmount = legs.reduce((sum, leg) => {
      const value = parseFloat(leg.amount);
      return sum + (isNaN(value) ? 0 : value);
    }, 0).toFixed(2);

    const finalOdds = legs.reduce((product, leg) => {
      const value = parseFloat(leg.odds);
      return product * (isNaN(value) ? 1 : value);
    }, 1).toFixed(2);

    const potentialReturn = (parseFloat(totalAmount) * parseFloat(finalOdds)).toFixed(2);
    const potentialProfit = (parseFloat(potentialReturn) - parseFloat(totalAmount)).toFixed(2);
    const roi = parseFloat(totalAmount) > 0
      ? ((parseFloat(potentialProfit) / parseFloat(totalAmount)) * 100).toFixed(2)
      : '0.00';

    return { totalAmount, finalOdds, potentialReturn, potentialProfit, roi };
  }, [legs]);

  const aggregatedBadges = useMemo(() => {
    const badges: string[] = [];
    legs.forEach(leg => {
      if (leg.hasBoost) badges.push(`BOOST +${leg.boostPercentage}%`);
      if (leg.usedCredits) badges.push('CRÉDITOS');
      if (leg.hasCashout) badges.push('CASHOUT');
      if (leg.isLive) badges.push('AO VIVO');
      if (leg.hasEarlyPayout) badges.push('PAGAMENTO ANTECIPADO');
      if (leg.isRiskFree) badges.push('SEM RISCO');
    });
    return [...new Set(badges)];
  }, [legs]);

  const validations = useMemo(() => {
    const finalOdds = parseFloat(calculations.finalOdds);
    const totalAmount = parseFloat(calculations.totalAmount);
    const roi = parseFloat(calculations.roi);

    return {
      oddsAlert: finalOdds < 1.5 ? 'Odds baixa: considere analisar o risco/retorno' : null,
      amountAlert: totalAmount > 1000 ? 'Valor alto apostado! Certifique-se de estar dentro do gerenciamento' : null,
      stakeSuggestion: totalAmount > 0
        ? `Sugestão: Esta aposta representa ~${((totalAmount / 1000) * 100).toFixed(1)}% de uma banca de R$ 1.000`
        : 'Preencha os valores para ver sugestões',
      roiWarning: roi < 20 ? 'ROI abaixo de 20%: avalie se vale o risco' : null,
    };
  }, [calculations]);

  const handleFormSubmit = (data: BetFormData) => {
    setPendingFormData(data);
    setShowConfirmModal(true);
  };

  const confirmAndAddBet = () => {
    if (!pendingFormData) return;

    const totalAmount = parseFloat(calculations.totalAmount);
    const finalOdds = parseFloat(calculations.finalOdds);

    const allWon = pendingFormData.legs.every(leg => leg.status === 'won');
    const anyLost = pendingFormData.legs.some(leg => leg.status === 'lost');
    const anyVoid = pendingFormData.legs.some(leg => leg.status === 'void');

    let return_ = 0;
    if (allWon) {
      return_ = totalAmount * finalOdds;
    } else if (anyVoid && !anyLost) {
      const validLegs = pendingFormData.legs.filter(leg => leg.status !== 'void');
      const validOdds = validLegs.reduce((product, leg) => product * parseFloat(leg.odds), 1);
      return_ = totalAmount * validOdds;
    }

    const profit = return_ - totalAmount;

    const betData = {
      bookmaker: pendingFormData.bookmaker,
      date: pendingFormData.date,
      betType: pendingFormData.betType,
      amount: totalAmount,
      odds: finalOdds,
      return: return_,
      profit,
      status: allWon ? 'won' : anyLost ? 'lost' : anyVoid ? 'void' : 'pending',
      description: pendingFormData.description,
      stakeLogic: pendingFormData.stakeLogic,
      isProtected: pendingFormData.legs.some(leg => leg.protectionTypes.length > 0),
      isLive: pendingFormData.legs.some(leg => leg.isLive),
      sourceType: locationState?.sourceTipId ? 'tip' as const : 'manual' as const,
      sourceTipId: locationState?.sourceTipId,
      legs: pendingFormData.legs,
      tags: pendingFormData.tags,
      operationNumber: pendingFormData.operationNumber,
    };

    addBet(betData);

    if (locationState?.sourceTipId) {
      updateTip(locationState.sourceTipId, {
        status: 'converted',
        convertedBetId: betData.description,
      });
    }

    toast({
      title: 'Sucesso',
      description: 'Aposta adicionada com sucesso',
    });

    setLocation('/bets');
  };

  const tagsOptions = predefinedTags.map(tag => ({ value: tag, label: tag }));

  return (
    <FormProvider {...methods}>
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Adicionar Aposta</h1>
          <p className="text-muted-foreground">Registrar uma nova aposta com funcionalidades avançadas</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
              <Accordion type="multiple" defaultValue={['identification']} className="space-y-4">
                <AccordionItem value="identification">
                  <Card>
                    <AccordionTrigger className="px-6 pt-6 pb-0 hover:no-underline">
                      <CardHeader className="p-0">
                        <CardTitle>Identificação da Aposta</CardTitle>
                        <CardDescription>Dados básicos da operação</CardDescription>
                      </CardHeader>
                    </AccordionTrigger>
                    <AccordionContent>
                      <CardContent className="pt-6 space-y-6">
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="space-y-2">
                            <Label htmlFor="operationNumber">Número da Operação</Label>
                            <Controller
                              name="operationNumber"
                              control={control}
                              render={({ field }) => (
                                <Input {...field} id="operationNumber" placeholder="ex: #001, OP-2024-001" />
                              )}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="bookmaker">Casa de Apostas *</Label>
                            <Controller
                              name="bookmaker"
                              control={control}
                              render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecionar casa de apostas" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {bookmakers.map((bm) => (
                                      <SelectItem key={bm.id} value={bm.name}>{bm.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="date">Data da Aposta *</Label>
                            <Controller
                              name="date"
                              control={control}
                              render={({ field }) => (
                                <Input {...field} id="date" type="date" />
                              )}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="betType">Tipo de Aposta *</Label>
                            <Controller
                              name="betType"
                              control={control}
                              render={({ field }) => (
                                <Select
                                  value={field.value}
                                  onValueChange={(value) => {
                                    field.onChange(value);
                                    setValue('multipleQuantity', value === 'simple' ? '1' : '2');
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="simple">Simples</SelectItem>
                                    <SelectItem value="multiple">Múltipla</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="multipleQuantity">Quantidade de Stakes</Label>
                            <Controller
                              name="multipleQuantity"
                              control={control}
                              render={({ field }) => (
                                <Select
                                  value={field.value}
                                  onValueChange={field.onChange}
                                  disabled={betType === 'simple'}
                                >
                                  <SelectTrigger className={betType === 'simple' ? 'opacity-60' : ''}>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {betType === 'simple' && <SelectItem value="1">1</SelectItem>}
                                    <SelectItem value="2">Dupla (2)</SelectItem>
                                    <SelectItem value="3">Tripla (3)</SelectItem>
                                    <SelectItem value="4">4</SelectItem>
                                    <SelectItem value="5">5</SelectItem>
                                    <SelectItem value="6">6</SelectItem>
                                    <SelectItem value="7">7</SelectItem>
                                    <SelectItem value="8">8</SelectItem>
                                    <SelectItem value="9">9</SelectItem>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="11">11</SelectItem>
                                    <SelectItem value="12">12</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </AccordionContent>
                  </Card>
                </AccordionItem>
              </Accordion>

              <Card>
                <CardHeader>
                  <CardTitle>
                    {betType === 'simple' ? 'Detalhes da Aposta' : 'Detalhes das Legs'}
                  </CardTitle>
                  <CardDescription>
                    {betType === 'simple'
                      ? 'Informações completas da aposta simples'
                      : `Configure cada uma das ${fields.length} legs da múltipla`
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="multiple" defaultValue={['leg-0']} className="space-y-2">
                    {fields.map((field, index) => (
                      <LegAccordion
                        key={field.id}
                        index={index}
                        betType={betType}
                        sportMarkets={sportMarkets}
                        strategies={strategies}
                        leagues={leagues}
                        protectionTypes={protectionTypes}
                      />
                    ))}
                  </Accordion>
                </CardContent>
              </Card>

              <Accordion type="multiple" defaultValue={['complementary']} className="space-y-4">
                <AccordionItem value="complementary">
                  <Card>
                    <AccordionTrigger className="px-6 pt-6 pb-0 hover:no-underline">
                      <CardHeader className="p-0">
                        <CardTitle>Informações Complementares</CardTitle>
                        <CardDescription>Resumo financeiro, descrição e tags</CardDescription>
                      </CardHeader>
                    </AccordionTrigger>
                    <AccordionContent>
                      <CardContent className="pt-6 space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="description">Descrição Detalhada *</Label>
                          <Controller
                            name="description"
                            control={control}
                            render={({ field }) => (
                              <Textarea
                                {...field}
                                id="description"
                                placeholder="ex: Múltipla com 3 jogos do Brasileirão. Análise baseada em estatísticas recentes..."
                                rows={4}
                              />
                            )}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="stakeLogic">Lógica do Stake</Label>
                          <Controller
                            name="stakeLogic"
                            control={control}
                            render={({ field }) => (
                              <Textarea
                                {...field}
                                id="stakeLogic"
                                placeholder="Justificativa para o valor apostado, análise de risco, % da banca utilizada..."
                                rows={3}
                              />
                            )}
                          />
                        </div>

                        <div className="space-y-3">
                          <Label>Tags da Aposta</Label>
                          <p className="text-sm text-muted-foreground">Selecione até 5 tags para categorizar esta aposta</p>
                          <Controller
                            name="tags"
                            control={control}
                            render={({ field }) => (
                              <ReactSelect
                                isMulti
                                options={tagsOptions}
                                value={tagsOptions.filter(opt => field.value?.includes(opt.value))}
                                onChange={(selected) => {
                                  if (selected.length <= 5) {
                                    field.onChange(selected.map(s => s.value));
                                  }
                                }}
                                className="react-select-container"
                                classNamePrefix="react-select"
                                placeholder="Selecione até 5 tags..."
                                noOptionsMessage={() => "Nenhuma opção disponível"}
                                isOptionDisabled={() => field.value.length >= 5}
                                menuPlacement="top"
                                menuPosition="fixed"
                              />
                            )}
                          />

                          {watchedData.tags && watchedData.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3 p-3 bg-gray-50 rounded-lg">
                              <span className="text-xs text-muted-foreground mr-2">Tags selecionadas:</span>
                              {watchedData.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </AccordionContent>
                  </Card>
                </AccordionItem>
              </Accordion>

              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  className="flex-1 h-12 text-lg"
                  disabled={!formState.isValid || formState.isSubmitting}
                >
                  {formState.isSubmitting ? 'Adicionando...' : 'Adicionar Aposta'}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  className="h-12"
                  onClick={() => {
                    if (confirm('Tem certeza que deseja limpar todos os campos do formulário?')) {
                      reset();
                    }
                  }}
                >
                  Limpar Aposta
                </Button>
              </div>
            </form>
          </div>

          <div className="lg:sticky lg:top-6 lg:self-start">
            <PreviewCard
              calculations={calculations}
              aggregatedBadges={aggregatedBadges}
              validations={validations}
            />
          </div>
        </div>

        <BetConfirmationModal
          open={showConfirmModal}
          onOpenChange={setShowConfirmModal}
          formData={pendingFormData || methods.getValues()}
          calculations={calculations}
          aggregatedBadges={aggregatedBadges}
          onConfirm={confirmAndAddBet}
        />
      </div>
    </FormProvider>
  );
}
