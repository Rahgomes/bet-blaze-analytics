import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import ReactSelect from 'react-select';
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useTranslation } from '@/hooks/useTranslation';
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
  const { t } = useTranslation();
  const { control, watch, setValue } = useFormContext<BetFormData>();

  const leg = watch(`legs.${index}`);
  const legLabel = betType === 'simple' ? t('addBet.sections.details') : `${t('addBet.leg.title')} ${index + 1}`;

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
              {t('addBet.leg.valuesAndOdds')}
            </h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`amount-${index}`}>{t('addBet.leg.betAmount')}</Label>
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
                <Label htmlFor={`odds-${index}`}>{t('addBet.leg.oddsLabel')}</Label>
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
              {t('addBet.leg.gameDetails')}
            </h4>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`homeTeam-${index}`}>{t('addBet.leg.homeTeam')}</Label>
                <Controller
                  name={`legs.${index}.homeTeam`}
                  control={control}
                  render={({ field }) => (
                    <Input {...field} id={`homeTeam-${index}`} placeholder="ex: Flamengo" />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`awayTeam-${index}`}>{t('addBet.leg.awayTeam')}</Label>
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
                <Label htmlFor={`sport-${index}`}>{t('addBet.leg.sport')}</Label>
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
                <Label htmlFor={`market-${index}`}>{t('addBet.leg.market')}</Label>
                <Controller
                  name={`legs.${index}.market`}
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('addBet.leg.selectMarket')} />
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
                <Label htmlFor={`league-${index}`}>{t('addBet.leg.league')}</Label>
                <Controller
                  name={`legs.${index}.league`}
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('addBet.leg.selectLeague')} />
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
                <Label htmlFor={`matchTime-${index}`}>{t('addBet.leg.matchDateTime')}</Label>
                <Controller
                  name={`legs.${index}.matchTime`}
                  control={control}
                  render={({ field }) => (
                    <Input {...field} id={`matchTime-${index}`} type="datetime-local" />
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`strategy-${index}`}>{t('addBet.leg.strategy')}</Label>
                <Controller
                  name={`legs.${index}.strategy`}
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('addBet.leg.selectStrategy')} />
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
                <Label htmlFor={`isLive-${index}`}>{t('addBet.leg.liveBet')}</Label>
                <p className="text-xs text-muted-foreground">{t('addBet.leg.liveBetDesc')}</p>
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
              {t('addBet.leg.specialFeatures')}
            </h4>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor={`hasBoost-${index}`}>{t('addBet.leg.hasBoost')}</Label>
                    <p className="text-sm text-muted-foreground">{t('addBet.leg.hasBoostDesc')}</p>
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
                      <Label htmlFor={`originalOdds-${index}`}>{t('addBet.leg.originalOdds')}</Label>
                      <Controller
                        name={`legs.${index}.originalOdds`}
                        control={control}
                        render={({ field }) => (
                          <Input {...field} id={`originalOdds-${index}`} type="number" step="0.01" placeholder="ex: 2.45" />
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`boostPercentage-${index}`}>{t('addBet.leg.boostPercentage')}</Label>
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
                    <Label htmlFor={`usedCredits-${index}`}>{t('addBet.leg.usedCredits')}</Label>
                    <p className="text-sm text-muted-foreground">{t('addBet.leg.usedCreditsDesc')}</p>
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
                      <Label htmlFor={`creditsAmount-${index}`}>{t('addBet.leg.creditsAmount')}</Label>
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
                    <Label htmlFor={`hasCashout-${index}`}>{t('addBet.leg.hasCashout')}</Label>
                    <p className="text-sm text-muted-foreground">{t('addBet.leg.hasCashoutDesc')}</p>
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
                      <Label htmlFor={`cashoutValue-${index}`}>{t('addBet.leg.cashoutValue')}</Label>
                      <Controller
                        name={`legs.${index}.cashoutValue`}
                        control={control}
                        render={({ field }) => (
                          <Input {...field} id={`cashoutValue-${index}`} type="number" step="0.01" placeholder="0,00" />
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`cashoutTime-${index}`}>{t('addBet.leg.cashoutMoment')}</Label>
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
                  <Label htmlFor={`hasEarlyPayout-${index}`}>{t('addBet.leg.hasEarlyPayout')}</Label>
                  <p className="text-sm text-muted-foreground">{t('addBet.leg.hasEarlyPayoutDesc')}</p>
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
                    <Label htmlFor={`isRiskFree-${index}`}>{t('addBet.leg.isRiskFree')}</Label>
                    <p className="text-sm text-muted-foreground">{t('addBet.leg.isRiskFreeDesc')}</p>
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
                      <Label htmlFor={`riskFreeAmount-${index}`}>{t('addBet.leg.riskFreeAmount')}</Label>
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
              <Label>{t('addBet.leg.protectionTypes')}</Label>
              <p className="text-sm text-muted-foreground">{t('addBet.leg.protectionTypesDesc')}</p>
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
                    placeholder={t('addBet.leg.selectProtections')}
                    noOptionsMessage={() => t('addBet.placeholders.noTags')}
                  />
                )}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              {t('addBet.leg.statusAndResult')}
            </h4>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`status-${index}`}>{t('addBet.leg.statusLabel')}</Label>
                <Controller
                  name={`legs.${index}.status`}
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">{t('addBet.leg.pending')}</SelectItem>
                        <SelectItem value="won">{t('addBet.leg.won')}</SelectItem>
                        <SelectItem value="lost">{t('addBet.leg.lost')}</SelectItem>
                        <SelectItem value="void">{t('addBet.leg.void')}</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {(leg?.status === 'won' || leg?.status === 'lost') && (
                <div className="grid gap-4 md:grid-cols-2 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                  <div className="space-y-2">
                    <Label htmlFor={`finalScore-${index}`}>{t('addBet.leg.finalScore')}</Label>
                    <Controller
                      name={`legs.${index}.finalScore`}
                      control={control}
                      render={({ field }) => (
                        <Input {...field} id={`finalScore-${index}`} placeholder="ex: 2x1, 3x0" />
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`resultTime-${index}`}>{t('addBet.leg.resultTime')}</Label>
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
