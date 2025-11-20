import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import ReactSelect from 'react-select';
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { BetFormData } from '@/lib/schemas/betFormSchema';

interface LegAccordionProps {
  index: number;
  betType: 'simple' | 'multiple';
  sportMarkets: Record<string, string[]>;
  strategies: string[];
  leagues: string[];
  protectionTypes: string[];
}

export const LegAccordion = React.memo<LegAccordionProps>(({
  index,
  betType,
  sportMarkets,
  strategies,
  leagues,
  protectionTypes
}) => {
  const { control, watch, setValue } = useFormContext<BetFormData>();

  const leg = watch(`legs.${index}`);
  const legLabel = betType === 'simple' ? 'Detalhes da Aposta' : `Leg ${index + 1}`;

  const protectionOptions = protectionTypes.map(type => ({ value: type, label: type }));

  return (
    <AccordionItem value={`leg-${index}`}>
      <AccordionTrigger className="text-lg font-semibold">
        {legLabel}
        {leg?.homeTeam && leg?.awayTeam && (
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({leg.homeTeam} vs {leg.awayTeam})
          </span>
        )}
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-6 pt-4">
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Valores e Odds
            </h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`amount-${index}`}>Valor Apostado (R$) *</Label>
                <Controller
                  name={`legs.${index}.amount`}
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id={`amount-${index}`}
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`odds-${index}`}>Odd *</Label>
                <Controller
                  name={`legs.${index}.odds`}
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id={`odds-${index}`}
                      type="number"
                      step="0.01"
                      min="1"
                      placeholder="1.50"
                    />
                  )}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Detalhes do Jogo
            </h4>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`homeTeam-${index}`}>Time de Casa *</Label>
                <Controller
                  name={`legs.${index}.homeTeam`}
                  control={control}
                  render={({ field }) => (
                    <Input {...field} id={`homeTeam-${index}`} placeholder="ex: Flamengo" />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`awayTeam-${index}`}>Time de Fora *</Label>
                <Controller
                  name={`legs.${index}.awayTeam`}
                  control={control}
                  render={({ field }) => (
                    <Input {...field} id={`awayTeam-${index}`} placeholder="ex: São Paulo" />
                  )}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor={`sport-${index}`}>Esporte *</Label>
                <Controller
                  name={`legs.${index}.sport`}
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        setValue(`legs.${index}.market`, '');
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(sportMarkets).map((sport) => (
                          <SelectItem key={sport} value={sport}>{sport}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`market-${index}`}>Mercado *</Label>
                <Controller
                  name={`legs.${index}.market`}
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o mercado" />
                      </SelectTrigger>
                      <SelectContent>
                        {sportMarkets[leg?.sport as keyof typeof sportMarkets]?.map((market) => (
                          <SelectItem key={market} value={market}>{market}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`league-${index}`}>Liga / Competição</Label>
                <Controller
                  name={`legs.${index}.league`}
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a liga" />
                      </SelectTrigger>
                      <SelectContent>
                        {leagues.map((league) => (
                          <SelectItem key={league} value={league}>{league}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`matchTime-${index}`}>Data e Hora do Jogo</Label>
                <Controller
                  name={`legs.${index}.matchTime`}
                  control={control}
                  render={({ field }) => (
                    <Input {...field} id={`matchTime-${index}`} type="datetime-local" />
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`strategy-${index}`}>Estratégia</Label>
                <Controller
                  name={`legs.${index}.strategy`}
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a estratégia" />
                      </SelectTrigger>
                      <SelectContent>
                        {strategies.map((strategy) => (
                          <SelectItem key={strategy} value={strategy}>{strategy}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <Label htmlFor={`isLive-${index}`}>Aposta Ao Vivo</Label>
                <p className="text-xs text-muted-foreground">Feita durante o jogo</p>
              </div>
              <Controller
                name={`legs.${index}.isLive`}
                control={control}
                render={({ field }) => (
                  <Switch
                    id={`isLive-${index}`}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Funcionalidades Especiais
            </h4>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor={`hasBoost-${index}`}>Aposta com Boost/Aumento</Label>
                    <p className="text-sm text-muted-foreground">Odds foi aumentada pela casa</p>
                  </div>
                  <Controller
                    name={`legs.${index}.hasBoost`}
                    control={control}
                    render={({ field }) => (
                      <Switch
                        id={`hasBoost-${index}`}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>

                {leg?.hasBoost && (
                  <div className="grid gap-4 md:grid-cols-2 pl-6 border-l-2 border-blue-200 bg-blue-50/30 p-4 rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor={`originalOdds-${index}`}>Odds Original</Label>
                      <Controller
                        name={`legs.${index}.originalOdds`}
                        control={control}
                        render={({ field }) => (
                          <Input {...field} id={`originalOdds-${index}`} type="number" step="0.01" placeholder="ex: 2.45" />
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`boostPercentage-${index}`}>Percentual de Aumento (%)</Label>
                      <Controller
                        name={`legs.${index}.boostPercentage`}
                        control={control}
                        render={({ field }) => (
                          <Input {...field} id={`boostPercentage-${index}`} type="number" step="0.1" placeholder="ex: 5.3" />
                        )}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor={`usedCredits-${index}`}>Feita com Créditos</Label>
                    <p className="text-sm text-muted-foreground">Aposta feita com créditos da casa</p>
                  </div>
                  <Controller
                    name={`legs.${index}.usedCredits`}
                    control={control}
                    render={({ field }) => (
                      <Switch
                        id={`usedCredits-${index}`}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>

                {leg?.usedCredits && (
                  <div className="pl-4 border-l-2 border-purple-200 bg-purple-50/20 p-3 rounded">
                    <div className="space-y-2">
                      <Label htmlFor={`creditsAmount-${index}`}>Valor em Créditos (R$)</Label>
                      <Controller
                        name={`legs.${index}.creditsAmount`}
                        control={control}
                        render={({ field }) => (
                          <Input {...field} id={`creditsAmount-${index}`} type="number" step="0.01" placeholder="0,00" />
                        )}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor={`hasCashout-${index}`}>Cashout Disponível/Usado</Label>
                    <p className="text-sm text-muted-foreground">Encerramento antecipado</p>
                  </div>
                  <Controller
                    name={`legs.${index}.hasCashout`}
                    control={control}
                    render={({ field }) => (
                      <Switch
                        id={`hasCashout-${index}`}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>

                {leg?.hasCashout && (
                  <div className="grid gap-3 pl-4 border-l-2 border-blue-200 bg-blue-50/20 p-3 rounded">
                    <div className="space-y-2">
                      <Label htmlFor={`cashoutValue-${index}`}>Valor do Cashout (R$)</Label>
                      <Controller
                        name={`legs.${index}.cashoutValue`}
                        control={control}
                        render={({ field }) => (
                          <Input {...field} id={`cashoutValue-${index}`} type="number" step="0.01" placeholder="0,00" />
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`cashoutTime-${index}`}>Momento do Cashout</Label>
                      <Controller
                        name={`legs.${index}.cashoutTime`}
                        control={control}
                        render={({ field }) => (
                          <Input {...field} id={`cashoutTime-${index}`} placeholder="ex: 75' do jogo" />
                        )}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor={`hasEarlyPayout-${index}`}>Pagamento Antecipado</Label>
                  <p className="text-sm text-muted-foreground">Pagamento recebido antes do fim</p>
                </div>
                <Controller
                  name={`legs.${index}.hasEarlyPayout`}
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id={`hasEarlyPayout-${index}`}
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor={`isRiskFree-${index}`}>Aposta Sem Risco/Protegida</Label>
                    <p className="text-sm text-muted-foreground">Valor protegido pela casa</p>
                  </div>
                  <Controller
                    name={`legs.${index}.isRiskFree`}
                    control={control}
                    render={({ field }) => (
                      <Switch
                        id={`isRiskFree-${index}`}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>

                {leg?.isRiskFree && (
                  <div className="pl-4 border-l-2 border-green-200 bg-green-50/20 p-3 rounded">
                    <div className="space-y-2">
                      <Label htmlFor={`riskFreeAmount-${index}`}>Valor Protegido (R$)</Label>
                      <Controller
                        name={`legs.${index}.riskFreeAmount`}
                        control={control}
                        render={({ field }) => (
                          <Input {...field} id={`riskFreeAmount-${index}`} type="number" step="0.01" placeholder="0,00" />
                        )}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Tipos de Proteção Tradicionais</Label>
              <p className="text-sm text-muted-foreground">Selecione uma ou mais proteções que se aplicam</p>
              <Controller
                name={`legs.${index}.protectionTypes`}
                control={control}
                render={({ field }) => (
                  <ReactSelect
                    isMulti
                    options={protectionOptions}
                    value={protectionOptions.filter(opt => field.value?.includes(opt.value))}
                    onChange={(selected) => field.onChange(selected.map(s => s.value))}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    placeholder="Selecione as proteções..."
                    noOptionsMessage={() => "Nenhuma opção disponível"}
                  />
                )}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Status e Resultado
            </h4>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`status-${index}`}>Status *</Label>
                <Controller
                  name={`legs.${index}.status`}
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
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
                  )}
                />
              </div>

              {(leg?.status === 'won' || leg?.status === 'lost') && (
                <div className="grid gap-4 md:grid-cols-2 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                  <div className="space-y-2">
                    <Label htmlFor={`finalScore-${index}`}>Placar Final</Label>
                    <Controller
                      name={`legs.${index}.finalScore`}
                      control={control}
                      render={({ field }) => (
                        <Input {...field} id={`finalScore-${index}`} placeholder="ex: 2x1, 3x0" />
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`resultTime-${index}`}>Tempo de Resultado</Label>
                    <Controller
                      name={`legs.${index}.resultTime`}
                      control={control}
                      render={({ field }) => (
                        <Input {...field} id={`resultTime-${index}`} placeholder="ex: 90+5'" />
                      )}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
});

LegAccordion.displayName = 'LegAccordion';
