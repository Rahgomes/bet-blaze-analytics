# 🌍 Plano de Internacionalização (i18n) - Betting Tracker

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Status Atual](#status-atual)
3. [Infraestrutura Existente](#infraestrutura-existente)
4. [Termos de Apostas - Guia de Tradução](#termos-de-apostas---guia-de-tradução)
5. [Plano de Execução](#plano-de-execução)
6. [Páginas Prioritárias](#páginas-prioritárias)
7. [Checklist de Progresso](#checklist-de-progresso)
8. [Guia de Implementação](#guia-de-implementação)
9. [Novas Chaves de Tradução Necessárias](#novas-chaves-de-tradução-necessárias)

---

## 📊 Visão Geral

Este documento é um guia completo para traduzir todas as páginas do aplicativo de gestão de apostas para inglês, utilizando a infraestrutura de i18n já implementada.

### Objetivos
- ✅ Traduzir todas as 17 páginas do aplicativo
- ✅ Manter consistência terminológica
- ✅ Garantir que o toggle de idioma funcione perfeitamente
- ✅ Preservar termos técnicos de apostas quando apropriado

### Estimativa de Tempo
- **Por página**: 2-3 horas
- **Total (5 prioritárias)**: 10-15 horas
- **Total completo**: 40-60 horas

**Sugestão**: Fazer 1-2 páginas por dia = 1 semana para as prioritárias

---

## 📌 Status Atual

### ✅ Já Implementado
- [x] Hook de tradução (`useTranslation`)
- [x] Arquivos de tradução (`/locales/en.json` e `/locales/pt-br.json`)
- [x] 140 chaves de tradução organizadas
- [x] Componente `LanguageToggle` funcional
- [x] Persistência de idioma via `sessionStorage`
- [x] TranslationProvider configurado no App.tsx

### ✅ Páginas Já Traduzidas (3/17)
1. **FAQ.tsx** - 100% traduzido ✅
2. **Tips.tsx** - 100% traduzido ✅
3. **Watchlist.tsx** - Parcialmente traduzido ✅

### ❌ Páginas Com Texto Hardcoded (14/17)
Precisam ser traduzidas (ver seção de prioridades abaixo)

---

## 🛠️ Infraestrutura Existente

### Hook de Tradução
```typescript
// Importar no topo do componente
import { useTranslation } from '@/hooks/useTranslation';

// Usar dentro do componente
const { t, language } = useTranslation();

// Usar nas strings
<h1>{t('dashboard.title')}</h1>
```

### Arquivos de Tradução
- **Português**: `/client/src/locales/pt-br.json`
- **Inglês**: `/client/src/locales/en.json`

### Estrutura de Chaves
```json
{
  "app": { "title": "..." },
  "nav": { ... },
  "dashboard": { ... },
  "bets": { ... },
  "common": { ... }
}
```

---

## 🎯 Termos de Apostas - Guia de Tradução

### 📝 Regra Geral
**Termos universais de apostas devem ser mantidos em inglês quando apropriado**, pois são amplamente usados na comunidade internacional de apostas.

### ✅ Termos que DEVEM ser mantidos em inglês:
| Português | Manter em Inglês | Motivo |
|-----------|------------------|---------|
| Stake | Stake | Termo universal de apostas |
| Odd(s) | Odds | Termo técnico padrão |
| Bankroll | Bankroll | Termo consagrado |
| ROI | ROI | Sigla universal |
| Tipster | Tipster | Termo específico da indústria |
| Bookmaker | Bookmaker | Nome técnico das casas |
| Hedge | Hedge | Estratégia específica |
| Cash Out | Cash Out | Funcionalidade padrão |
| Value Bet | Value Bet | Conceito técnico |

### 🔄 Termos que DEVEM ser traduzidos:
| Português | Inglês |
|-----------|--------|
| Aposta | Bet |
| Casa de Apostas | Bookmaker / Sportsbook |
| Lucro | Profit |
| Retorno | Return |
| Banca | Bankroll |
| Gestão de Risco | Risk Management |
| Configurações | Settings |
| Carregando... | Loading... |
| Salvar | Save |
| Cancelar | Cancel |

### ⚖️ Termos com Contexto (decidir caso a caso):
| Português | Opção 1 (Informal) | Opção 2 (Formal) | Recomendação |
|-----------|-------------------|------------------|--------------|
| Dicas | Tips | Signals | **Tips** (mais usado) |
| Apostas Múltiplas | Multiple Bets | Accumulator / Parlay | **Multiple Bets** |
| Aposta Simples | Single Bet | Straight Bet | **Single Bet** |
| Back | Back | Bet On | **Back** (termo técnico) |
| Handicap | Handicap | Spread | **Handicap** (futebol) / **Spread** (basquete) |

### 🏆 Esportes e Mercados

#### Esportes (traduzir)
```json
"sports": {
  "futebol": "Soccer / Football",
  "basquete": "Basketball",
  "tenis": "Tennis",
  "eSports": "E-Sports",
  "outros": "Others"
}
```

#### Mercados (manter termos técnicos quando possível)
```json
"markets": {
  "resultadoFinal": "Match Result / Full Time Result",
  "ambasMarcam": "Both Teams to Score (BTTS)",
  "totalDeGols": "Total Goals / Over-Under",
  "handicap": "Handicap",
  "escanteios": "Corners",
  "cartoes": "Cards",
  "primeiroTempo": "First Half Result",
  "betBuilder": "Bet Builder",
  "backFavorito": "Back Favorite",
  "backZebra": "Back Underdog"
}
```

#### Estratégias (manter em inglês)
```json
"strategies": {
  "linhaSegura": "Safe Line",
  "valueBetting": "Value Betting",
  "arbitragem": "Arbitrage",
  "kellyCriterion": "Kelly Criterion",
  "flatBetting": "Flat Betting",
  "progressao": "Progressive Betting"
}
```

#### Proteções (manter siglas + explicação)
```json
"protections": {
  "dc": "DC (Double Chance)",
  "dnb": "DNB (Draw No Bet)",
  "asianHandicap": "Asian Handicap",
  "europeanHandicap": "European Handicap",
  "cashOut": "Cash Out Available"
}
```

---

## 🎯 Plano de Execução

### Fase 1: Preparação (1-2 horas)
1. ✅ Ler este documento completamente
2. ⬜ Adicionar novas chaves de tradução nos arquivos JSON
3. ⬜ Validar que o LanguageToggle está funcionando

### Fase 2: Páginas Prioritárias (10-15 horas)
Traduzir as 5 páginas mais importantes (ver detalhes abaixo)

### Fase 3: Páginas Secundárias (15-25 horas)
Traduzir as páginas restantes

### Fase 4: Revisão e Testes (5-10 horas)
1. Testar troca de idioma em todas as páginas
2. Verificar consistência terminológica
3. Validar formatação de datas e números

---

## 🔥 Páginas Prioritárias

### Ordem de Execução Sugerida

#### 1️⃣ **Dashboard.tsx** (PRIORIDADE MÁXIMA)
**Tempo estimado**: 3-4 horas
**Motivo**: Primeira tela que o usuário vê

**Strings a traduzir**:
- Títulos de seção
- Labels de métricas
- Mensagens de estado vazio
- Formatação de datas
- Performance por bookmaker

**Novas chaves necessárias**:
```json
"dashboard": {
  "overview": "Overview",
  "commandCenter": "Command Center",
  "summary": "Summary",
  "standardStakeValues": "Standard Stake Values",
  "basedOnCurrentBankroll": "Based on Current Bankroll",
  "customStakesRiskManagement": "Custom stakes for risk management",
  "noStakesConfigured": "No stakes configured",
  "configureStakesInRiskTab": "Configure your stakes in the Risk Management tab",
  "configureStakes": "Configure Stakes",
  "profitToday": "Profit Today",
  "profitWeek": "Profit This Week",
  "profitMonth": "Profit This Month",
  "winRate": "Win Rate",
  "roiCurrentMonth": "ROI Current Month",
  "bookmakerPerformance": "Bookmaker Performance",
  "currentMonthSummary": "Current Month Summary",
  "stakedVsReturned": "Staked vs Returned and performance by bookmaker",
  "staked": "Staked",
  "returned": "Returned",
  "profitLoss": "Profit/Loss",
  "initialBankroll": "Initial Bankroll",
  "currentBankroll": "Current Bankroll",
  "performanceComparison": "Performance Comparison by Period",
  "betsCount": "bets",
  "stopLimits": "Entry x Stop Limits",
  "protectionSettings": "Protection Settings",
  "limitsForBankrollProtection": "Limits set for bankroll protection",
  "monthlyStopGain": "Monthly Stop Gain",
  "monthlyStopLoss": "Monthly Stop Loss",
  "weeklyStopGain": "Weekly Stop Gain",
  "weeklyStopLoss": "Weekly Stop Loss"
}
```

**Arquivos relacionados**:
- `/client/src/pages/Dashboard.tsx`

---

#### 2️⃣ **AddBet.tsx** (ALTA PRIORIDADE)
**Tempo estimado**: 4-5 horas
**Motivo**: Feature principal do app

**Strings a traduzir**:
- Labels de formulário
- Opções de esporte
- Mercados
- Estratégias
- Mensagens de validação
- Tags predefinidas

**Novas chaves necessárias**:
```json
"addBet": {
  // ... (existentes)
  "sport": "Sport",
  "market": "Market",
  "strategy": "Strategy",
  "league": "League",
  "homeTeam": "Home Team",
  "awayTeam": "Away Team",
  "matchTime": "Match Time",
  "isLive": "Live Bet",
  "hasBoost": "Has Odds Boost",
  "originalOdds": "Original Odds",
  "boostPercentage": "Boost %",
  "usedCredits": "Used Credits",
  "creditsAmount": "Credits Amount",
  "hasCashout": "Has Cash Out",
  "cashoutValue": "Cash Out Value",
  "cashoutTime": "Cash Out Time",
  "hasEarlyPayout": "Early Payout",
  "isRiskFree": "Risk Free Bet",
  "riskFreeAmount": "Risk Free Amount",
  "protectionTypes": "Protection Types",
  "finalScore": "Final Score",
  "resultTime": "Result Time",
  "tags": "Tags",
  "operationNumber": "Operation Number",
  "multipleQuantity": "Number of Legs",
  "simple": "Single",
  "multiple": "Multiple",
  "system": "System"
},
"sports": {
  "soccer": "Soccer",
  "basketball": "Basketball",
  "tennis": "Tennis",
  "eSports": "E-Sports",
  "others": "Others"
},
"markets": {
  "matchResult": "Match Result",
  "btts": "Both Teams to Score",
  "totalGoals": "Total Goals",
  "betBuilder": "Bet Builder",
  "backFavorite": "Back Favorite",
  "backUnderdog": "Back Underdog",
  "corners": "Corners",
  "cards": "Cards",
  "handicap": "Handicap",
  "firstHalfResult": "First Half Result",
  "spread": "Spread",
  "totalPoints": "Total Points",
  "winner": "Winner",
  "totalGames": "Total Games",
  "handicapGames": "Handicap Games",
  "maps": "Maps",
  "totalKills": "Total Kills"
},
"strategies": {
  "safeLine": "Safe Line",
  "valueBetting": "Value Betting",
  "arbitrage": "Arbitrage",
  "kellyCriterion": "Kelly Criterion",
  "flatBetting": "Flat Betting",
  "progressive": "Progressive Betting"
},
"leagues": {
  "brasileiraoA": "Brasileirão Série A",
  "premierLeague": "Premier League",
  "laLiga": "La Liga",
  "championsLeague": "Champions League",
  "libertadores": "Libertadores",
  "copaDoBrasil": "Copa do Brasil",
  "serieA": "Serie A",
  "bundesliga": "Bundesliga",
  "ligue1": "Ligue 1",
  "europaLeague": "Europa League"
},
"tags": {
  "valueBet": "Value Bet",
  "safeLine": "Safe Line",
  "highRisk": "High Risk",
  "arbitrage": "Arbitrage",
  "mainBet": "Main Bet",
  "hedge": "Hedge",
  "experimental": "Experimental",
  "followingTipster": "Following Tipster"
}
```

**Arquivos relacionados**:
- `/client/src/pages/AddBet.tsx`
- `/client/src/components/betting/PreviewCard.tsx`
- `/client/src/components/betting/LegAccordion.tsx`

---

#### 3️⃣ **BetsList.tsx** (ALTA PRIORIDADE)
**Tempo estimado**: 3-4 horas
**Motivo**: Página muito utilizada

**Strings a traduzir**:
- Cabeçalhos de tabela
- Filtros
- Status
- Mensagens de toast
- Labels de ações

**Novas chaves necessárias**:
```json
"bets": {
  // ... (existentes)
  "noBets": "No bets found",
  "filterByPeriod": "Filter by Period",
  "filterByStatus": "Filter by Status",
  "filterByBookmaker": "Filter by Bookmaker",
  "filterByTeam": "Filter by Team",
  "today": "Today",
  "week": "This Week",
  "month": "This Month",
  "all": "All",
  "won": "Won",
  "lost": "Lost",
  "pending": "Pending",
  "void": "Void",
  "halfWon": "Half Won",
  "halfLost": "Half Lost",
  "viewDetails": "View Details",
  "editBet": "Edit Bet",
  "deleteBet": "Delete Bet",
  "confirmDelete": "Are you sure you want to delete this bet?",
  "betDeleted": "Bet deleted successfully",
  "totalStaked": "Total Staked",
  "totalReturned": "Total Returned",
  "averageOdds": "Average Odds",
  "back": "Back"
}
```

**Arquivos relacionados**:
- `/client/src/pages/BetsList.tsx`

---

#### 4️⃣ **Analytics.tsx** (ALTA PRIORIDADE)
**Tempo estimado**: 4-5 horas
**Motivo**: Muitos labels e gráficos

**Strings a traduzir**:
- Títulos de tabs
- Labels de gráficos
- Métricas
- Filtros de período
- Legendas

**Novas chaves necessárias**:
```json
"analytics": {
  "title": "Analytics",
  "overview": "Overview",
  "byBookmaker": "By Bookmaker",
  "bySport": "By Sport",
  "byMarket": "By Market",
  "byStrategy": "By Strategy",
  "profitEvolution": "Profit Evolution",
  "winRateByMonth": "Win Rate by Month",
  "roiByMonth": "ROI by Month",
  "performanceByBookmaker": "Performance by Bookmaker",
  "exposureByBookmaker": "Exposure by Bookmaker",
  "performanceBySport": "Performance by Sport",
  "performanceByMarket": "Performance by Market",
  "performanceByStrategy": "Performance by Strategy",
  "totalProfit": "Total Profit",
  "totalStaked": "Total Staked",
  "averageOdds": "Average Odds",
  "totalBets": "Total Bets",
  "wonBets": "Won Bets",
  "lostBets": "Lost Bets",
  "pendingBets": "Pending Bets",
  "filterByPeriod": "Filter by Period",
  "last7Days": "Last 7 Days",
  "last30Days": "Last 30 Days",
  "last90Days": "Last 90 Days",
  "thisYear": "This Year",
  "allTime": "All Time"
}
```

**Arquivos relacionados**:
- `/client/src/pages/Analytics.tsx`

---

#### 5️⃣ **Import.tsx** (ALTA PRIORIDADE)
**Tempo estimado**: 2-3 horas
**Motivo**: Mensagens de erro e sucesso importantes

**Strings a traduzir**:
- Mensagens de validação
- Instruções
- Toast messages
- Labels de upload

**Novas chaves necessárias**:
```json
"import": {
  // ... (existentes)
  "invalidFileType": "Invalid file type. Only CSV and Excel files are allowed.",
  "fileTooLarge": "File is too large. Maximum size is {size}MB.",
  "fileReadError": "Error reading file. Please try again.",
  "noFileSelected": "No file selected",
  "uploadInstructions": "Select a CSV or Excel file with your bets data",
  "fileSelected": "File selected",
  "processing": "Processing file...",
  "mappingColumns": "Mapping columns...",
  "importInProgress": "Import in progress...",
  "importComplete": "Import completed successfully",
  "importError": "Error during import",
  "requiredFields": "Required fields",
  "optionalFields": "Optional fields",
  "columnNotMapped": "Column not mapped",
  "previewData": "Preview Data",
  "rowsToImport": "{count} rows will be imported",
  "startImport": "Start Import",
  "cancelImport": "Cancel Import"
}
```

**Arquivos relacionados**:
- `/client/src/pages/Import.tsx`
- `/client/src/pages/ImportPreview.tsx`
- `/client/src/pages/ImportHistory.tsx`

---

## 📋 Checklist de Progresso

### ✅ Páginas Já Traduzidas
- [x] FAQ.tsx
- [x] Tips.tsx
- [x] Watchlist.tsx (parcial)

### 🔥 Páginas Prioritárias (Fazer Primeiro)
- [ ] 1. Dashboard.tsx
- [ ] 2. AddBet.tsx
- [ ] 3. BetsList.tsx
- [ ] 4. Analytics.tsx
- [ ] 5. Import.tsx

### 📦 Páginas Secundárias
- [ ] 6. BankrollSettings.tsx
- [ ] 7. Reports.tsx
- [ ] 8. ImportHistory.tsx
- [ ] 9. ImportPreview.tsx
- [ ] 10. DepositsHistory.tsx
- [ ] 11. WithdrawalsHistory.tsx
- [ ] 12. WatchlistTeams.tsx
- [ ] 13. Index.tsx
- [ ] 14. NotFound.tsx

---

## 🛠️ Guia de Implementação

### Passo a Passo para Cada Página

#### 1. Preparação (5 min)
```bash
# Abrir a página que será traduzida
code client/src/pages/NomeDaPagina.tsx

# Abrir os arquivos de tradução lado a lado
code client/src/locales/pt-br.json
code client/src/locales/en.json
```

#### 2. Adicionar o Hook de Tradução (2 min)
```typescript
// No topo do arquivo, adicionar import
import { useTranslation } from '@/hooks/useTranslation';

// Dentro do componente, adicionar hook
export default function NomeDaPagina() {
  const { t, language } = useTranslation();
  // ... resto do código
}
```

#### 3. Identificar Strings Hardcoded (10-15 min)
Procurar por:
- Textos entre aspas: `"Texto em português"`
- Textos em JSX: `<h1>Título</h1>`
- Toast messages: `toast({ title: "Sucesso" })`
- Placeholders: `placeholder="Digite aqui"`
- Labels: `<Label>Nome do campo</Label>`

#### 4. Adicionar Chaves de Tradução nos JSONs (15-20 min)

**pt-br.json**:
```json
{
  "nomeDaPagina": {
    "title": "Título da Página",
    "subtitle": "Subtítulo",
    "button": "Botão"
  }
}
```

**en.json**:
```json
{
  "nomeDaPagina": {
    "title": "Page Title",
    "subtitle": "Subtitle",
    "button": "Button"
  }
}
```

#### 5. Substituir Strings no Código (30-60 min)

**Antes**:
```tsx
<h1>Título da Página</h1>
<Button>Salvar</Button>
<p>Carregando...</p>
```

**Depois**:
```tsx
<h1>{t('nomeDaPagina.title')}</h1>
<Button>{t('common.save')}</Button>
<p>{t('common.loading')}</p>
```

#### 6. Toast Messages (10 min)
```typescript
// Antes
toast({
  title: "Sucesso",
  description: "Operação realizada com sucesso",
});

// Depois
toast({
  title: t('common.success'),
  description: t('nomeDaPagina.operationSuccess'),
});
```

#### 7. Formatação de Datas (Se necessário) (10 min)
```typescript
// Usar biblioteca date-fns com locale
import { format } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';

const locale = language === 'pt-br' ? ptBR : enUS;
const formattedDate = format(date, 'PPP', { locale });
```

#### 8. Testar (10-15 min)
1. Abrir a página no navegador
2. Trocar idioma usando o LanguageToggle
3. Verificar se todas as strings foram traduzidas
4. Verificar se não há erros no console
5. Verificar se a formatação está correta

#### 9. Commit (5 min)
```bash
git add .
git commit -m "feat: add i18n translation for NomeDaPagina"
```

---

## 📝 Novas Chaves de Tradução Necessárias

### Estrutura Completa a ser Adicionada

Adicionar estas seções nos arquivos `pt-br.json` e `en.json`:

```json
{
  "sports": { ... },
  "markets": { ... },
  "strategies": { ... },
  "leagues": { ... },
  "tags": { ... },
  "protections": { ... },
  "analytics": { ... },
  "dashboard": { ... (expandido) },
  "import": { ... (expandido) },
  "bets": { ... (expandido) },
  "addBet": { ... (expandido) },
  "settings": { ... (expandido) },
  "bankrollSettings": {
    "title": "Bankroll Settings",
    "tabs": {
      "bankroll": "Bankroll & Deposits",
      "goals": "Goals & Objectives",
      "risk": "Risk Management",
      "withdrawals": "Withdrawals"
    },
    "bankrollSection": {
      "title": "Bankroll Configuration",
      "initialBankroll": "Initial Bankroll",
      "currentBankroll": "Current Bankroll",
      "allowEdit": "Allow editing initial bankroll",
      "protectionWarning": "Editing the initial bankroll affects all calculations"
    },
    "depositsSection": {
      "title": "Manual Deposits",
      "addDeposit": "Add Deposit",
      "date": "Date",
      "amount": "Amount",
      "description": "Description",
      "viewFullHistory": "View Full History"
    },
    "withdrawalsSection": {
      "title": "Manual Withdrawals",
      "addWithdrawal": "Add Withdrawal",
      "viewFullHistory": "View Full History"
    },
    "goalsSection": {
      "title": "Financial Goals",
      "targetMode": "Target Mode",
      "percentage": "Percentage",
      "fixedAmount": "Fixed Amount",
      "targetValue": "Target Value",
      "deadline": "Deadline",
      "currentProgress": "Current Progress",
      "projection": "Projection"
    },
    "riskSection": {
      "title": "Risk Management",
      "customStakes": "Custom Stakes",
      "addStake": "Add Stake",
      "stopLoss": "Stop Loss",
      "stopGain": "Stop Gain",
      "daily": "Daily",
      "weekly": "Weekly",
      "monthly": "Monthly"
    }
  },
  "reports": {
    "title": "Reports",
    "generate": "Generate Report",
    "period": "Period",
    "export": "Export",
    "pdf": "PDF",
    "excel": "Excel",
    "summary": "Summary"
  },
  "status": {
    "pending": "Pending",
    "won": "Won",
    "lost": "Lost",
    "void": "Void",
    "halfWon": "Half Won",
    "halfLost": "Half Lost"
  },
  "confidence": {
    "low": "Low",
    "medium": "Medium",
    "high": "High"
  },
  "periods": {
    "today": "Today",
    "yesterday": "Yesterday",
    "thisWeek": "This Week",
    "lastWeek": "Last Week",
    "thisMonth": "This Month",
    "lastMonth": "Last Month",
    "last7Days": "Last 7 Days",
    "last30Days": "Last 30 Days",
    "last90Days": "Last 90 Days",
    "thisYear": "This Year",
    "allTime": "All Time",
    "custom": "Custom"
  },
  "dateFormat": {
    "short": "MM/DD/YYYY",
    "long": "MMMM D, YYYY",
    "withTime": "MM/DD/YYYY HH:mm"
  }
}
```

---

## ✅ Critérios de Qualidade

Antes de marcar uma página como concluída, verificar:

- [ ] Todo texto visível está traduzido
- [ ] Toast messages estão traduzidos
- [ ] Placeholders de inputs estão traduzidos
- [ ] Títulos de seções estão traduzidos
- [ ] Labels de botões estão traduzidos
- [ ] Mensagens de erro/validação estão traduzidas
- [ ] Datas estão formatadas corretamente para ambos idiomas
- [ ] Números/moeda estão formatados corretamente
- [ ] Toggle de idioma funciona perfeitamente
- [ ] Não há erros no console
- [ ] Terminologia está consistente com outras páginas

---

## 🎓 Dicas e Melhores Práticas

### 1. Organização de Chaves
```json
// ✅ BOM - Chaves organizadas e descritivas
"dashboard.currentBankroll": "Current Bankroll"
"dashboard.profitToday": "Profit Today"

// ❌ RUIM - Chaves genéricas
"text1": "Current Bankroll"
"label2": "Profit Today"
```

### 2. Reutilização
```typescript
// ✅ BOM - Reutilizar chaves comuns
{t('common.save')}
{t('common.cancel')}

// ❌ RUIM - Criar chaves duplicadas
{t('dashboard.save')}
{t('bets.save')}
```

### 3. Pluralização
```json
// Português
"bets.count": "{count} aposta(s)"

// Inglês
"bets.count": "{count} bet(s)"

// Uso
{t('bets.count').replace('{count}', count)}
```

### 4. Variáveis em Strings
```json
"import.importSuccess": "{count} apostas importadas com sucesso"

// Uso
toast({
  description: t('import.importSuccess').replace('{count}', importedCount)
});
```

---

## 📞 Dúvidas Frequentes

### Q: Devo traduzir nomes de casas de apostas?
**R**: Não. Nomes próprios como "BET365", "Betfair" devem ser mantidos.

### Q: E siglas como ROI, BTTS?
**R**: Manter em inglês, pois são universais. Pode adicionar tooltip explicativo se necessário.

### Q: Como lidar com gírias de apostas?
**R**: Priorizar termos técnicos internacionais. Ex: "Zebra" → "Underdog"

### Q: Devo traduzir nomes de times?
**R**: Não. Manter nomes originais: "Flamengo", "Real Madrid", etc.

### Q: Como tratar datas?
**R**: Use `date-fns` com locale apropriado. PT-BR: "05/12/2024", EN: "12/05/2024"

---

## 🚀 Começando Agora

### Sugestão para Primeira Sessão (2-3 horas)

1. **Preparar ambiente** (15 min)
   - Ler este README
   - Testar LanguageToggle
   - Abrir arquivos de tradução

2. **Adicionar chaves básicas** (30 min)
   - Adicionar seções `sports`, `markets`, `strategies` nos JSONs
   - Adicionar chaves expandidas do `dashboard`

3. **Traduzir Dashboard.tsx** (90-120 min)
   - Seguir o passo a passo acima
   - Testar cada seção conforme traduz

4. **Commit e pausa** (5 min)
   - Fazer commit das mudanças
   - Descansar e planejar próxima sessão

---

## 📊 Progresso Estimado

| Dia | Páginas | Horas | Acumulado |
|-----|---------|-------|-----------|
| 1 | Dashboard | 3-4h | 3-4h |
| 2 | AddBet | 4-5h | 7-9h |
| 3 | BetsList | 3-4h | 10-13h |
| 4 | Analytics | 4-5h | 14-18h |
| 5 | Import | 2-3h | 16-21h |
| 6-7 | Páginas secundárias | 10-15h | 26-36h |
| 8 | Revisão e testes | 5-10h | 31-46h |

**Total**: ~40 horas em 1-2 semanas (2-4h por dia)

---

## 🎯 Próximos Passos

1. [ ] Ler este documento completamente
2. [ ] Adicionar novas chaves de tradução nos JSONs
3. [ ] Começar com Dashboard.tsx
4. [ ] Ir marcando as checkboxes conforme avança
5. [ ] Fazer commits incrementais
6. [ ] Testar toggle de idioma a cada página

---

**Bom trabalho! 🚀**

Lembre-se: é melhor fazer 1-2 páginas bem feitas por dia do que tentar fazer tudo de uma vez. Vá marcando o progresso e celebre cada página concluída! ✅
