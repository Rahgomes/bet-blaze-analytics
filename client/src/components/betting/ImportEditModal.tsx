import { useEffect } from 'react';
import { useForm, FormProvider, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ImportRow } from '@/types/import';
import { BetFormData, betFormSchema } from '@/lib/schemas/betFormSchema';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LegAccordion } from '@/components/betting/LegAccordion';
import { Save, X } from 'lucide-react';

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

const protectionTypes = [
  'DC (Double Chance)',
  'DNB (Draw No Bet)',
  'Asian Handicap',
  'European Handicap',
  'Cash Out Available'
];

interface ImportEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row: ImportRow | null;
  onSave: (rowId: string, updates: Partial<BetFormData>) => void;
  bookmakers: string[];
}

export function ImportEditModal({
  open,
  onOpenChange,
  row,
  onSave,
  bookmakers,
}: ImportEditModalProps) {
  const methods = useForm<BetFormData>({
    resolver: zodResolver(betFormSchema),
    defaultValues: row?.data as BetFormData || {
      bookmaker: '',
      date: new Date().toISOString().split('T')[0],
      betType: 'simple',
      multipleQuantity: '1',
      operationNumber: '',
      legs: [],
      description: '',
      stakeLogic: '',
      tags: [],
    },
    mode: 'onChange',
  });

  const { control, handleSubmit, reset, watch, setValue, formState } = methods;
  const { fields } = useFieldArray({
    control,
    name: 'legs',
  });

  const betType = watch('betType');

  // Reset form when row changes
  useEffect(() => {
    if (row?.data) {
      reset(row.data as BetFormData);
    }
  }, [row, reset]);

  const handleFormSubmit = (data: BetFormData) => {
    if (row) {
      onSave(row.id, data);
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    reset();
    onOpenChange(false);
  };

  if (!row) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Linha #{row.rowNumber}</DialogTitle>
          <DialogDescription>
            Corrija os erros ou ajuste as informações desta aposta antes de importar
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Validation Errors Summary */}
            {row.validationErrors.length > 0 && (
              <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-red-900 dark:text-red-100">
                    Erros de Validação
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-1">
                    {row.validationErrors
                      .filter((err) => err.severity === 'error')
                      .map((err, i) => (
                        <li key={i} className="text-red-700 dark:text-red-300">
                          <strong>{err.field}:</strong> {err.message}
                        </li>
                      ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <Accordion type="multiple" defaultValue={['identification', 'legs']} className="space-y-4">
              {/* Identification */}
              <AccordionItem value="identification">
                <Card>
                  <AccordionTrigger className="px-6 pt-6 pb-0 hover:no-underline">
                    <CardHeader className="p-0">
                      <CardTitle>Identificação da Aposta</CardTitle>
                      <CardDescription>Dados básicos da operação</CardDescription>
                    </CardHeader>
                  </AccordionTrigger>
                  <AccordionContent>
                    <CardContent className="pt-6 space-y-4">
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor="operationNumber">Número da Operação</Label>
                          <Controller
                            name="operationNumber"
                            control={control}
                            render={({ field }) => (
                              <Input {...field} id="operationNumber" placeholder="ex: #001" />
                            )}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="bookmaker">Casa de Apostas *</Label>
                          <Controller
                            name="bookmaker"
                            control={control}
                            render={({ field, fieldState }) => (
                              <>
                                <Select value={field.value} onValueChange={field.onChange}>
                                  <SelectTrigger className={fieldState.error ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Selecionar" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {bookmakers.map((bm) => (
                                      <SelectItem key={bm} value={bm}>{bm}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {fieldState.error && (
                                  <p className="text-xs text-red-500">{fieldState.error.message}</p>
                                )}
                              </>
                            )}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="date">Data *</Label>
                          <Controller
                            name="date"
                            control={control}
                            render={({ field, fieldState }) => (
                              <>
                                <Input
                                  {...field}
                                  id="date"
                                  type="date"
                                  className={fieldState.error ? 'border-red-500' : ''}
                                />
                                {fieldState.error && (
                                  <p className="text-xs text-red-500">{fieldState.error.message}</p>
                                )}
                              </>
                            )}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Descrição *</Label>
                        <Controller
                          name="description"
                          control={control}
                          render={({ field, fieldState }) => (
                            <>
                              <Textarea
                                {...field}
                                id="description"
                                placeholder="Descrição da aposta"
                                rows={2}
                                className={fieldState.error ? 'border-red-500' : ''}
                              />
                              {fieldState.error && (
                                <p className="text-xs text-red-500">{fieldState.error.message}</p>
                              )}
                            </>
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
                              placeholder="Justificativa do valor apostado"
                              rows={2}
                            />
                          )}
                        />
                      </div>
                    </CardContent>
                  </AccordionContent>
                </Card>
              </AccordionItem>

              {/* Legs */}
              <AccordionItem value="legs">
                <Card>
                  <AccordionTrigger className="px-6 pt-6 pb-0 hover:no-underline">
                    <CardHeader className="p-0">
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
                  </AccordionTrigger>
                  <AccordionContent>
                    <CardContent>
                      <Accordion type="multiple" defaultValue={fields.map((_, i) => `leg-${i}`)} className="space-y-2">
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
                  </AccordionContent>
                </Card>
              </AccordionItem>
            </Accordion>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button type="submit" disabled={!formState.isValid}>
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
