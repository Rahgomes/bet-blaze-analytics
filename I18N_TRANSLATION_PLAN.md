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

### ✅ Páginas Já Traduzidas (11/17)
1. **FAQ.tsx** - 100% traduzido ✅
2. **Tips.tsx** - 100% traduzido ✅
3. **Watchlist.tsx** - Parcialmente traduzido ✅
4. **Dashboard.tsx** - 100% traduzido ✅
5. **BetsList.tsx** - 100% traduzido ✅
6. **AddBet.tsx** - 100% traduzido ✅
7. **Analytics.tsx** - 100% traduzido ✅ (08/12/2025)
8. **Import.tsx** - 100% traduzido ✅ (08/12/2025)
9. **BankrollSettings.tsx** - 100% traduzido ✅ (RECÉM CONCLUÍDO - 09/12/2025)
10. **ImportHistory.tsx** - 100% traduzido ✅ (RECÉM CONCLUÍDO - 09/12/2025)
11. **Reports.tsx** - 100% traduzido ✅ (RECÉM CONCLUÍDO - 09/12/2025)
12. **ImportPreview.tsx** - 100% traduzido ✅ (RECÉM CONCLUÍDO - 09/12/2025)
13. **Index.tsx** - 100% traduzido ✅ (RECÉM CONCLUÍDO - 09/12/2025)
14. **NotFound.tsx** - 100% traduzido ✅ (RECÉM CONCLUÍDO - 09/12/2025)

### ❌ Páginas Com Texto Hardcoded (2/17)
Precisam ser traduzidas (ver seção de prioridades abaixo)

### 🆕 Páginas Recém Traduzidas (09/12/2025):

#### ✅ **BankrollSettings.tsx** - CONCLUÍDO
**Tempo real**: ~1 hora
**Status**: 100% traduzido e testado

**O que foi feito**:
- ✅ Adicionado hook `useTranslation`
- ✅ Traduzidos todos os títulos e tabs
- ✅ Traduzidas todas as seções (Banca, Aportes, Saques, Metas, Risco)
- ✅ Traduzidos formulários e labels
- ✅ Traduzidos tooltips e mensagens de ajuda
- ✅ Traduzidos diálogos de confirmação
- ✅ Traduzidas mensagens de erro e sucesso
- ✅ Formatação de moeda mantida em R$ (ambos idiomas)

**Chaves utilizadas**: Todas já existentes em `bankrollSettings` (90+ chaves)

**Arquivos modificados**:
- `/client/src/pages/BankrollSettings.tsx` (100% traduzido)

---

#### ✅ **ImportHistory.tsx** - CONCLUÍDO
**Tempo real**: ~30 minutos
**Status**: 100% traduzido e testado

**O que foi feito**:
- ✅ Adicionadas 20 novas chaves de tradução em `pt-br.json` e `en.json`
- ✅ Importado hook `useTranslation`
- ✅ Traduzidos título e subtítulo da página
- ✅ Traduzidos cards de resumo (Total, Apostas, Linhas, Taxa de Sucesso)
- ✅ Traduzida seção de última importação com formatação de data
- ✅ Traduzida busca de importações
- ✅ Traduzidas mensagens de estado vazio
- ✅ Traduzida seção de apostas expandidas
- ✅ Suporte a formatação de data PT-BR vs EN-US
- ✅ Badges de status traduzidos (Ganha, Perdida, Anulada, Pendente)

**Chaves adicionadas**:
```json
"importHistory": {
  "title", "subtitle", "back",
  "summary": { 4 chaves },
  "latestImport", "latestImportAt",
  "search": { 3 chaves },
  "allImports": { 3 chaves },
  "empty": { 3 chaves },
  "betsSection": { 2 chaves }
}
```

**Arquivos modificados**:
- `/client/src/pages/ImportHistory.tsx` (100% traduzido)
- `/client/src/locales/pt-br.json` (20 novas chaves)
- `/client/src/locales/en.json` (20 novas chaves)

---

#### ✅ **Reports.tsx** - CONCLUÍDO (09/12/2025)
**Tempo real**: ~45 minutos
**Status**: 100% traduzido e testado

**O que foi feito**:
- ✅ Adicionadas 50 novas chaves de tradução em `pt-br.json` e `en.json`
- ✅ Importado hook `useTranslation`
- ✅ Traduzidos título e subtítulo da página
- ✅ Traduzidos filtros de período (Hoje, Semana, Mês, Ano, Todo Período)
- ✅ Traduzidas abas principais (Por Time, Por Liga, Por Estratégia)
- ✅ Traduzida seção de estatísticas de times (títulos, gráficos, tabelas)
- ✅ Traduzida seção de estatísticas de ligas (títulos, gráficos, tabelas)
- ✅ Traduzida seção de estatísticas de estratégias (títulos, gráficos, tabelas)
- ✅ Traduzidos cabeçalhos de tabela (Time, Total de Apostas, Vitórias, etc)
- ✅ Traduzidas mensagens de estado vazio para cada seção
- ✅ Traduzido modal de detalhes com títulos dinâmicos
- ✅ Suporte a substituição de variáveis em strings ({value})

**Chaves adicionadas**:
```json
"reports": {
  "title", "subtitle",
  "periods": { 5 chaves },
  "tabs": { 3 chaves },
  "teamStats": { 4 chaves },
  "leagueStats": { 4 chaves },
  "strategyStats": { 4 chaves },
  "table": { 9 chaves },
  "chart": { 1 chave },
  "detailDialog": { 9 chaves }
}
```

**Arquivos modificados**:
- `/client/src/pages/Reports.tsx` (100% traduzido)
- `/client/src/locales/pt-br.json` (50 novas chaves)
- `/client/src/locales/en.json` (50 novas chaves)

---

#### ✅ **ImportPreview.tsx** - CONCLUÍDO (09/12/2025)
**Tempo real**: ~1 hora
**Status**: 100% traduzido e testado

**O que foi feito**:
- ✅ Adicionadas 40+ novas chaves de tradução em `pt-br.json` e `en.json`
- ✅ Importado hook `useTranslation`
- ✅ Traduzidos título e informações do arquivo
- ✅ Traduzidos cards de estatísticas (Total, Válidas, Erros, Avisos)
- ✅ Traduzido alerta de erros com contador dinâmico
- ✅ Traduzida seção de filtros completa (busca, checkboxes)
- ✅ Traduzida tabela de preview com contador dinâmico de linhas
- ✅ Traduzidos botões de ação (Cancelar Tudo, Importar)
- ✅ Traduzidos 2 diálogos de confirmação (Importação e Cancelamento)
- ✅ Traduzidas todas as mensagens toast (6 mensagens)
- ✅ Suporte a substituição de múltiplas variáveis em strings ({count}, {filtered}, {total})

**Chaves adicionadas**:
```json
"importPreview": {
  "title", "fileLabel", "backButton",
  "stats": { 4 chaves },
  "errorAlert": { 2 chaves },
  "filters": { 5 chaves },
  "table": { 3 chaves },
  "actions": { 3 chaves },
  "confirmDialog": { 8 chaves },
  "cancelDialog": { 3 chaves },
  "toasts": { 6 chaves }
}
```

**Arquivos modificados**:
- `/client/src/pages/ImportPreview.tsx` (100% traduzido)
- `/client/src/locales/pt-br.json` (40+ novas chaves)
- `/client/src/locales/en.json` (40+ novas chaves)

---

#### ✅ **Index.tsx + NotFound.tsx** - CONCLUÍDO (09/12/2025)
**Tempo real**: ~15 minutos
**Status**: 100% traduzido e testado (2 páginas)

**O que foi feito**:
- ✅ Adicionadas 6 novas chaves de tradução em `pt-br.json` e `en.json`
- ✅ Importado hook `useTranslation` em ambos os arquivos
- ✅ **Index.tsx**: Traduzidos título e subtítulo da página inicial
- ✅ **NotFound.tsx**: Traduzidos título 404, mensagem de erro e link de retorno

**Chaves adicionadas**:
```json
"index": {
  "title", "subtitle"
},
"notFound": {
  "title", "subtitle", "returnHome"
}
```

**Arquivos modificados**:
- `/client/src/pages/Index.tsx` (100% traduzido)
- `/client/src/pages/NotFound.tsx` (100% traduzido)
- `/client/src/locales/pt-br.json` (6 novas chaves)
- `/client/src/locales/en.json` (6 novas chaves)

---

#### ✅ **DepositsHistory.tsx** - CONCLUÍDO (10/12/2025)
**Tempo real**: ~1.5 horas
**Status**: 100% traduzido e testado

**O que foi feito**:
- ✅ Adicionadas 60+ novas chaves de tradução em `pt-br.json` e `en.json`
- ✅ Importado hook `useTranslation` em 4 arquivos
- ✅ Traduzidos título e subtítulo da página
- ✅ Traduzidos 4 cards de resumo (Total, Valor Total, Maior, Último)
- ✅ Traduzido componente DepositsFilters completo (busca, período, valor, ordenação)
- ✅ Traduzido componente DepositsTable completo (cabeçalhos, paginação)
- ✅ Traduzido componente EditManualDepositModal completo (formulário, preview, validações)
- ✅ Traduzido dialog de confirmação de exclusão
- ✅ Traduzidas todas as mensagens toast (6 mensagens)
- ✅ Suporte a formatação de data PT-BR vs EN-US (date-fns locale)
- ✅ Suporte a substituição de variáveis em strings ({start}, {end}, {total})

**Chaves adicionadas**:
```json
"depositsHistory": {
  "title", "subtitle", "back",
  "summary": { 4 chaves },
  "filters": { 11 chaves },
  "table": { 12 chaves },
  "empty": { 2 chaves },
  "editModal": { 14 chaves },
  "deleteDialog": { 3 chaves },
  "toasts": { 8 chaves }
}
```

**Arquivos modificados**:
- `/client/src/pages/DepositsHistory.tsx` (100% traduzido)
- `/client/src/components/betting/DepositsFilters.tsx` (100% traduzido)
- `/client/src/components/betting/DepositsTable.tsx` (100% traduzido)
- `/client/src/components/betting/EditManualDepositModal.tsx` (100% traduzido)
- `/client/src/locales/pt-br.json` (60+ novas chaves)
- `/client/src/locales/en.json` (60+ novas chaves)

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

#### ✅ **Import.tsx** - CONCLUÍDO (08/12/2025)
**Tempo real**: ~30 minutos
**Status**: 100% traduzido e testado

**O que foi feito**:
- ✅ Adicionadas 24 novas chaves de tradução em `pt-br.json` e `en.json`
- ✅ Importado hook `useTranslation`
- ✅ Traduzidos título e subtítulo da página
- ✅ Traduzido card de upload de arquivo
- ✅ Traduzidas todas as mensagens de erro (arquivo inválido, muito grande, vazio, etc)
- ✅ Traduzidos toast messages de sucesso e erro
- ✅ Traduzido botão de preview e estado de processamento
- ✅ Traduzidos passos de instrução (1-4)
- ✅ Traduzida seção de histórico de importações
- ✅ Suporte a substituição de variáveis em strings ({name}, {size}, {count})

**Chaves adicionadas**:
```json
"import": {
  "title", "subtitle",
  "uploadCard": { 7 chaves },
  "errors": { 5 chaves },
  "preview": { 2 chaves },
  "steps": { 5 chaves },
  "history": { 4 chaves }
}
```

**Arquivos modificados**:
- `/client/src/pages/Import.tsx` (100% traduzido)
- `/client/src/locales/pt-br.json` (24 novas chaves)
- `/client/src/locales/en.json` (24 novas chaves)

---

#### ✅ **Analytics.tsx** - CONCLUÍDO (08/12/2025)
**Tempo real**: ~2 horas
**Status**: 100% traduzido e testado

**O que foi feito**:
- ✅ Adicionadas 89 novas chaves de tradução em `pt-br.json` e `en.json`
- ✅ Importado hook `useTranslation`
- ✅ Traduzidos todos os títulos e labels de abas
- ✅ Traduzidos todos os cards de métricas
- ✅ Traduzidos todos os gráficos (Lucro, ROI, Status, Odds)
- ✅ Traduzidas todas as tabelas de performance
- ✅ Traduzida seção de risco e projeções
- ✅ Formatação de moeda e datas ajustada para PT-BR e EN
- ✅ Labels de status dinâmicos (Ganhas, Perdidas, Pendentes, etc)

**Chaves adicionadas**:
```json
"analytics": {
  "title", "subtitle",
  "tabs": { "overview", "performance", "trends", "risk" },
  "metrics": { 8 chaves },
  "charts": { 8 chaves },
  "tables": { 11 chaves },
  "status": { 5 chaves },
  "risk": { 16 chaves },
  "goalTracking": { 4 chaves },
  "legend": { 3 chaves }
}
```

**Arquivos modificados**:
- `/client/src/pages/Analytics.tsx` (100% traduzido)
- `/client/src/locales/pt-br.json` (89 novas chaves)
- `/client/src/locales/en.json` (89 novas chaves)

---

#### 1️⃣ **Dashboard.tsx** (PRIORIDADE MÁXIMA) ✅ CONCLUÍDO
**Tempo estimado**: 3-4 horas
**Motivo**: Primeira tela que o usuário vê
**Status**: ✅ 100% traduzido

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
- [x] 1. Dashboard.tsx ✅
- [x] 2. AddBet.tsx ✅
- [x] 3. BetsList.tsx ✅
- [x] 4. Analytics.tsx ✅ (08/12/2025)
- [x] 5. Import.tsx ✅ (CONCLUÍDO em 08/12/2025)

### 📦 Páginas Secundárias
- [x] 6. BankrollSettings.tsx ✅ (CONCLUÍDO em 09/12/2025)
- [x] 7. Reports.tsx ✅ (CONCLUÍDO em 09/12/2025)
- [x] 8. ImportHistory.tsx ✅ (CONCLUÍDO em 09/12/2025)
- [x] 9. ImportPreview.tsx ✅ (CONCLUÍDO em 09/12/2025)
- [x] 10. Index.tsx ✅ (CONCLUÍDO em 09/12/2025)
- [x] 11. NotFound.tsx ✅ (CONCLUÍDO em 09/12/2025)
- [x] 12. DepositsHistory.tsx ✅ (CONCLUÍDO em 10/12/2025)
- [ ] 13. WithdrawalsHistory.tsx

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

## 📊 Progresso Atual (Atualizado em 10/12/2025)

| Status | Páginas | Percentual |
|--------|---------|------------|
| ✅ Concluídas | 16/17 | 94% |
| 🔄 Em progresso | 0/17 | 0% |
| ❌ Pendentes | 1/17 | 6% |

### Progresso por Prioridade

**✅ Alta Prioridade (5/5 concluídas - 100%)**:
- ✅ Dashboard.tsx
- ✅ AddBet.tsx
- ✅ BetsList.tsx
- ✅ Analytics.tsx
- ✅ Import.tsx

**🎉 TODAS AS PÁGINAS DE ALTA PRIORIDADE CONCLUÍDAS!**

**Próximas páginas (Média Prioridade)**:
1. ~~BankrollSettings.tsx~~ ✅ CONCLUÍDO
2. ~~Reports.tsx~~ ✅ CONCLUÍDO
3. ~~ImportPreview.tsx~~ ✅ CONCLUÍDO
4. ~~ImportHistory.tsx~~ ✅ CONCLUÍDO
5. ~~Index.tsx~~ ✅ CONCLUÍDO
6. ~~NotFound.tsx~~ ✅ CONCLUÍDO

**🎊 Apenas 1 página restante!**
7. ~~DepositsHistory.tsx~~ ✅ CONCLUÍDO (10/12/2025)
8. WithdrawalsHistory.tsx (2-3h)

**Tempo restante estimado**: 2-3 horas para completar 100%

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
