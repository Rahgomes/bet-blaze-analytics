# Status da Migração para Zustand - Projeto Betting Management

## 📊 Resumo Geral

Migração de hooks customizados (`useBettingData`, `useExtendedData`) para gerenciamento de estado global com Zustand.

**Data de início:** 03/12/2025
**Última atualização:** 04/12/2025

---

## ✅ FASE 1: Setup Base - CONCLUÍDA

### Dependências Instaladas
- [x] zustand (já estava instalado)

### Estrutura de Pastas Criada
```
client/src/stores/
├── betting/
│   ├── betsSlice.ts           ✅ Criado
│   ├── bankrollSlice.ts       ✅ Criado
│   ├── transactionsSlice.ts   ✅ Criado
│   ├── bookmakersSlice.ts     ✅ Criado
│   ├── selectors.ts           ✅ Criado
│   └── index.ts               ✅ Criado (store principal)
├── filters/
│   └── analyticsFilterStore.ts ✅ Criado
└── middleware/
    └── sessionStorageMiddleware.ts ✅ Criado
```

### Arquivos Modificados
- [x] `client/src/App.tsx` - Adicionada inicialização da store no useEffect

### Recursos Implementados
- [x] Middleware de sessionStorage para filtros
- [x] DevTools habilitado para debug
- [x] Slices separados para betting store
- [x] Selectors computados (todayBets, weekBets, monthBets, stats)
- [x] Store de filtros do Analytics com persistência

---

## ✅ FASE 2: Migração Dashboard - CONCLUÍDA

### Arquivos Migrados
- [x] `client/src/pages/Dashboard.tsx`

### Mudanças Realizadas no Dashboard
**Antes:**
```typescript
const { bets, bankroll, loading } = useBettingData();
const todayBets = useMemo(() => filterBetsByPeriod(bets, 'today'), [bets]);
const todayStats = useMemo(() => calculateStats(todayBets), [todayBets]);
// ... mais useMemo duplicados
```

**Depois:**
```typescript
const bets = useBettingStore(state => state.bets);
const bankroll = useBettingStore(state => state.bankroll);
const loading = useBettingStore(state => state.loading);
const todayBets = useBettingStore(selectTodayBets);
const todayStats = useBettingStore(selectTodayStats);
// ... usando selectors da store
```

### Benefícios Obtidos
- Removidos 6 useMemo duplicados (todayBets, todayStats, weekBets, weekStats, monthBets, monthStats)
- Dados computados agora vêm de selectors centralizados
- Código mais limpo e reutilizável

---

## ✅ FASE 3: Migração Analytics - CONCLUÍDA

### Arquivos Migrados
- [x] `client/src/pages/Analytics.tsx`

### Mudanças Realizadas no Analytics
**Antes:**
```typescript
const { bets, bankroll } = useBettingData();
const [period, setPeriod] = useState('30days');
const [selectedBookmakers, setSelectedBookmakers] = useState<string[]>([]);
const [selectedLeagues, setSelectedLeagues] = useState<string[]>([]);
const [selectedBetTypes, setSelectedBetTypes] = useState<string[]>([]);
const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
const [oddsRange, setOddsRange] = useState({ min: 1.01, max: 10 });
const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
```

**Depois:**
```typescript
// Dados da betting store
const bets = useBettingStore(state => state.bets);
const bankroll = useBettingStore(state => state.bankroll);

// Filtros da analytics filter store
const {
  period, selectedBookmakers, selectedLeagues, selectedBetTypes,
  selectedMarkets, oddsRange, selectedStatuses, selectedTeams,
  setPeriod, setSelectedBookmakers, setSelectedLeagues,
  setSelectedBetTypes, setSelectedMarkets, setOddsRange,
  setSelectedStatuses, setSelectedTeams, clearFilters,
} = useAnalyticsFilterStore();
```

### Benefícios Obtidos
- **8 useState removidos** - todos os filtros agora vêm da store
- **Filtros persistem em sessionStorage** - usuário volta e os filtros continuam aplicados
- **Função clearFilters centralizada** - mais simples e consistente
- Código mais limpo e organizado

---

## ✅ FASE 4: Migração BetsList - CONCLUÍDA

### Arquivos Criados
- [x] `client/src/stores/filters/betsListFilterStore.ts`

### Arquivos Migrados
- [x] `client/src/pages/BetsList.tsx`

### Mudanças Realizadas no BetsList
**Antes:**
```typescript
const { bets: realBets, bookmakers, deleteBet, updateBet } = useBettingData();
const [searchTerm, setSearchTerm] = useState('');
const [filterBookmaker, setFilterBookmaker] = useState<string>('all');
const [filterType, setFilterType] = useState<string>('all');
const [filterStatus, setFilterStatus] = useState<string>('all');
const [filterPeriod, setFilterPeriod] = useState<PeriodFilter>('all');
const [filterProfit, setFilterProfit] = useState<string>('all');
const [filterTeam, setFilterTeam] = useState<string>('all');
const [oddsRange, setOddsRange] = useState({min: 1, max: 10});
const [amountRange, setAmountRange] = useState({min: 0, max: 1000});
const [filterHasBoost, setFilterHasBoost] = useState(false);
const [filterHasCashout, setFilterHasCashout] = useState(false);
const [filterUsedCredits, setFilterUsedCredits] = useState(false);
const [filterIsProtected, setFilterIsProtected] = useState(false);
const [sortColumn, setSortColumn] = useState<string>('date');
const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(50);
const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
```

**Depois:**
```typescript
// Dados da betting store
const realBets = useBettingStore(state => state.bets);
const bookmakers = useBettingStore(state => state.bookmakers);
const deleteBet = useBettingStore(state => state.deleteBet);
const updateBet = useBettingStore(state => state.updateBet);

// Filtros da BetsList filter store (19 filtros!)
const {
  searchTerm, filterBookmaker, filterType, filterStatus, filterPeriod,
  filterProfit, filterTeam, oddsRange, amountRange, filterHasBoost,
  filterHasCashout, filterUsedCredits, filterIsProtected, sortColumn,
  sortDirection, currentPage, itemsPerPage, showAdvancedFilters,
  setSearchTerm, setFilterBookmaker, setFilterType, setFilterStatus,
  setFilterPeriod, setFilterProfit, setFilterTeam, setOddsRange,
  setAmountRange, setFilterHasBoost, setFilterHasCashout,
  setFilterUsedCredits, setFilterIsProtected, setSortColumn,
  setSortDirection, setCurrentPage, setItemsPerPage, setShowAdvancedFilters,
} = useBetsListFilterStore();
```

### Benefícios Obtidos
- **19 useState removidos** - todos os filtros e controles de UI agora vêm da store
- **Filtros persistem em sessionStorage** - usuário volta e os filtros, ordenação e paginação continuam aplicados
- **Store mais complexa** - suporte para filtros avançados (ranges, características especiais)
- **Melhor UX** - usuário não perde contexto ao navegar entre páginas

---

## ✅ FASE 5: Migração AddBet - CONCLUÍDA

### Arquivos Migrados
- [x] `client/src/pages/AddBet.tsx`

### Mudanças Realizadas no AddBet
**Antes:**
```typescript
const { addBet, bookmakers, bankroll } = useBettingData();
```

**Depois:**
```typescript
// Dados e actions da betting store
const addBet = useBettingStore(state => state.addBet);
const bookmakers = useBettingStore(state => state.bookmakers);
const bankroll = useBettingStore(state => state.bankroll);
```

### Benefícios Obtidos
- **Hook antigo removido** - não usa mais `useBettingData`
- **Estados locais preservados** - formulários mantidos com useState/useForm (correto!)
- **Actions da store** - criação de apostas via Zustand

---

## ✅ FASE 6: Migração BankrollSettings - CONCLUÍDA

### Arquivos Migrados
- [x] `client/src/pages/BankrollSettings.tsx`

### Mudanças Realizadas no BankrollSettings
**Antes:**
```typescript
const { bankroll, updateBankrollSettings, bets, transactions,
        addTransaction, updateTransaction, deleteTransaction } = useBettingData();
```

**Depois:**
```typescript
// Dados e actions da betting store
const bankroll = useBettingStore(state => state.bankroll);
const updateBankrollSettings = useBettingStore(state => state.updateBankrollSettings);
const bets = useBettingStore(state => state.bets);
const transactions = useBettingStore(state => state.transactions);
const addTransaction = useBettingStore(state => state.addTransaction);
const updateTransaction = useBettingStore(state => state.updateTransaction);
const deleteTransaction = useBettingStore(state => state.deleteTransaction);
```

### Benefícios Obtidos
- **Hook antigo removido** - não usa mais `useBettingData`
- **Acesso completo à store** - bankroll, transactions e todas as actions
- **Estados locais preservados** - modais e formulários mantidos locais (correto!)

---

## ✅ FASE 7: Migração DepositsHistory - CONCLUÍDA

### Arquivos Migrados
- [x] `client/src/pages/DepositsHistory.tsx`

### Mudanças Realizadas no DepositsHistory
**Antes:**
```typescript
const { bankroll, transactions, updateTransaction, deleteTransaction } = useBettingData();
```

**Depois:**
```typescript
// Dados e actions da betting store
const bankroll = useBettingStore(state => state.bankroll);
const transactions = useBettingStore(state => state.transactions);
const updateTransaction = useBettingStore(state => state.updateTransaction);
const deleteTransaction = useBettingStore(state => state.deleteTransaction);
```

### Benefícios Obtidos
- **Hook antigo removido** - não usa mais `useBettingData`
- **Acesso a transactions** - filtra por tipo 'deposit' localmente
- **Estados locais preservados** - filtros e modais mantidos com useState (correto!)

---

## ✅ FASE 8: Migração WithdrawalsHistory - CONCLUÍDA

### Arquivos Migrados
- [x] `client/src/pages/WithdrawalsHistory.tsx`

### Mudanças Realizadas no WithdrawalsHistory
**Antes:**
```typescript
const { bankroll, transactions, updateTransaction, deleteTransaction } = useBettingData();
```

**Depois:**
```typescript
// Dados e actions da betting store
const bankroll = useBettingStore(state => state.bankroll);
const transactions = useBettingStore(state => state.transactions);
const updateTransaction = useBettingStore(state => state.updateTransaction);
const deleteTransaction = useBettingStore(state => state.deleteTransaction);
```

### Benefícios Obtidos
- **Hook antigo removido** - não usa mais `useBettingData`
- **Acesso a transactions** - filtra por tipo 'withdrawal' localmente
- **Estados locais preservados** - filtros e modais mantidos com useState (correto!)

---

## ✅ FASE 9: Migração Import.tsx - CONCLUÍDA

### Arquivos Migrados
- [x] `client/src/pages/Import.tsx`

### Mudanças Realizadas no Import
**Antes:**
```typescript
const { getImportSessions } = useBettingData();
const importSessions = getImportSessions();
```

**Depois:**
```typescript
const getImportSessions = useBettingStore(state => state.getImportSessions);
const importSessions = getImportSessions();
```

### Benefícios Obtidos
- **Hook antigo removido** - não usa mais `useBettingData`
- **Acesso a import sessions** - busca sessões de importação da store
- **Estados locais preservados** - file upload e UI states mantidos locais (correto!)

---

## ✅ FASE 10: Migração ImportHistory.tsx - CONCLUÍDA

### Arquivos Migrados
- [x] `client/src/pages/ImportHistory.tsx`

### Mudanças Realizadas no ImportHistory
**Antes:**
```typescript
const { getImportSessions, bets } = useBettingData();
const sessions = getImportSessions();
```

**Depois:**
```typescript
const getImportSessions = useBettingStore(state => state.getImportSessions);
const bets = useBettingStore(state => state.bets);
const sessions = getImportSessions();
```

### Benefícios Obtidos
- **Hook antigo removido** - não usa mais `useBettingData`
- **Acesso a bets e sessions** - relaciona apostas com sessões de importação
- **Estados locais preservados** - filtros e expansão mantidos com useState (correto!)

---

## ✅ FASE 11: Migração ImportPreview.tsx - CONCLUÍDA

### Arquivos Migrados
- [x] `client/src/pages/ImportPreview.tsx`

### Mudanças Realizadas no ImportPreview
**Antes:**
```typescript
const { addBet, bookmakers, addImportSession } = useBettingData();
```

**Depois:**
```typescript
const addBet = useBettingStore(state => state.addBet);
const bookmakers = useBettingStore(state => state.bookmakers);
const addImportSession = useBettingStore(state => state.addImportSession);
```

### Benefícios Obtidos
- **Hook antigo removido** - não usa mais `useBettingData`
- **Actions da store** - importação em massa via Zustand
- **Estados locais preservados** - preview state, filtros e modais mantidos locais (correto!)

---

## 🔄 PRÓXIMAS FASES

### FASES 12-13: Migração Watchlist Pages (PRÓXIMAS)
- [ ] Watchlist.tsx
- [ ] WatchlistTeams.tsx

### FASE 14: Reports
- [ ] Reports.tsx

---

## 📁 Arquivos Criados na Sessão Atual

1. `/home/runner/workspace/client/src/stores/middleware/sessionStorageMiddleware.ts`
2. `/home/runner/workspace/client/src/stores/betting/betsSlice.ts`
3. `/home/runner/workspace/client/src/stores/betting/bankrollSlice.ts`
4. `/home/runner/workspace/client/src/stores/betting/transactionsSlice.ts`
5. `/home/runner/workspace/client/src/stores/betting/bookmakersSlice.ts`
6. `/home/runner/workspace/client/src/stores/betting/selectors.ts`
7. `/home/runner/workspace/client/src/stores/betting/index.ts`
8. `/home/runner/workspace/client/src/stores/filters/analyticsFilterStore.ts`

## 📝 Arquivos Modificados na Sessão Atual

1. `/home/runner/workspace/client/src/App.tsx` - Inicialização de stores
2. `/home/runner/workspace/client/src/pages/Dashboard.tsx` - Migrado para Zustand
3. `/home/runner/workspace/client/src/pages/Analytics.tsx` - Fix de homeTeam/awayTeam

---

## 🚀 Como Retomar Amanhã

### Prompt para Próxima Sessão:

```
Continuando a migração para Zustand do projeto de betting management.

CONTEXTO:
- Estamos migrando hooks customizados (useBettingData, useExtendedData) para Zustand
- Estrutura: múltiplas stores separadas com slices
- Filtros persistem em sessionStorage
- Modais locais com useState
- DevTools habilitado

JÁ CONCLUÍDO:
✅ Fase 1: Setup Base (8 arquivos criados)
  - Middleware sessionStorage
  - Slices: bets, bankroll, transactions, bookmakers
  - Store principal de betting com DevTools
  - Store de filtros Analytics
  - Selectors computados
  - Inicialização no App.tsx

✅ Fase 2: Migração Dashboard
  - Dashboard.tsx migrado para useBettingStore
  - Removidos 6 useMemo duplicados
  - Usando selectors centralizados

PRÓXIMO PASSO:
Migrar a página Analytics.tsx para usar:
1. useBettingStore para bets e bankroll
2. useAnalyticsFilterStore para todos os filtros (8 filtros no total)

ARQUIVOS A MIGRAR:
- /home/runner/workspace/client/src/pages/Analytics.tsx
- Possível ajuste em: /home/runner/workspace/client/src/components/betting/AnalyticsFilters.tsx

Por favor, continue a migração da página Analytics conforme o plano.
```

### Checklist para Analytics:

**Substituir:**
```typescript
// ANTES
const { bets, bankroll } = useBettingData();
const [period, setPeriod] = useState('30days');
const [selectedBookmakers, setSelectedBookmakers] = useState<string[]>([]);
const [selectedLeagues, setSelectedLeagues] = useState<string[]>([]);
const [selectedBetTypes, setSelectedBetTypes] = useState<string[]>([]);
const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
const [oddsRange, setOddsRange] = useState({ min: 1.01, max: 10 });
const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
```

**DEPOIS:**
```typescript
// Dados da betting store
const bets = useBettingStore(state => state.bets);
const bankroll = useBettingStore(state => state.bankroll);

// Filtros da analytics filter store
const {
  period,
  selectedBookmakers,
  selectedLeagues,
  selectedBetTypes,
  selectedMarkets,
  oddsRange,
  selectedStatuses,
  selectedTeams,
  setPeriod,
  setSelectedBookmakers,
  setSelectedLeagues,
  setSelectedBetTypes,
  setSelectedMarkets,
  setOddsRange,
  setSelectedStatuses,
  setSelectedTeams,
  clearFilters,
} = useAnalyticsFilterStore();
```

**Benefícios:**
- 8 useState removidos
- Filtros persistem em sessionStorage (usuário volta e filtros estão salvos)
- Código mais limpo

---

## 📚 Decisões Arquiteturais

### Confirmadas na Sessão Inicial:
1. **Estrutura:** Múltiplas stores separadas ✅
2. **Modais:** Manter useState local ✅
3. **Filtros:** Persistir em sessionStorage ✅
4. **Migração:** Gradual, página por página ✅
5. **Selectors:** Hooks customizados + acesso direto ao store ✅
6. **Organização:** Slices separados para stores grandes ✅
7. **DevTools:** Habilitado ✅

### Padrões de Uso:

**Acessar dados da store:**
```typescript
// Opção 1: Acesso direto (preferido para dados simples)
const bets = useBettingStore(state => state.bets);
const bankroll = useBettingStore(state => state.bankroll);

// Opção 2: Com selector (preferido para dados computados)
const todayStats = useBettingStore(selectTodayStats);
```

**Chamar actions:**
```typescript
const addBet = useBettingStore(state => state.addBet);
const updateBankroll = useBettingStore(state => state.updateBankrollSettings);

// Usar normalmente
addBet(betData);
updateBankroll({ currentBankroll: 1000 });
```

---

## 🔍 Debugging

### Como usar DevTools:
1. Instalar Redux DevTools Extension no navegador
2. Abrir DevTools (F12)
3. Ir na aba "Redux"
4. Você verá as stores: "BettingStore" e "AnalyticsFilterStore"
5. Pode inspecionar state, actions, e fazer time-travel debugging

### Verificar localStorage:
```javascript
// Console do navegador
localStorage.getItem('betting_bets')
localStorage.getItem('betting_bankroll')
localStorage.getItem('betting_transactions')
localStorage.getItem('betting_bookmakers')
```

### Verificar sessionStorage (filtros):
```javascript
sessionStorage.getItem('analytics-filters')
```

---

## ⚠️ Arquivos NÃO Modificados (Ainda)

**Hooks antigos ainda funcionando:**
- `client/src/hooks/useBettingData.ts` - Manter até migração completa
- `client/src/hooks/useExtendedData.ts` - Manter até migração completa

**Páginas ainda usando hooks antigos:**
- BetsList.tsx
- AddBet.tsx
- BankrollSettings.tsx
- Analytics.tsx (próxima a migrar)
- Import.tsx
- Watchlist.tsx
- Tips.tsx
- Outras páginas

---

## 🎯 Objetivos Atingidos Hoje

1. ✅ Estrutura base de stores criada
2. ✅ Middleware de sessionStorage funcionando
3. ✅ Slices bem organizados e separados
4. ✅ Selectors centralizados para cálculos
5. ✅ Dashboard migrado com sucesso
6. ✅ DevTools habilitado
7. ✅ Documentação completa para retomada

---

## 📌 Observações Importantes

1. **Compatibilidade:** Hooks antigos e stores Zustand funcionam em paralelo durante a migração
2. **Testes:** Testar cada página após migração antes de prosseguir
3. **Performance:** Selectors só recalculam quando dados relevantes mudam
4. **Persistência:**
   - localStorage para dados principais (bets, bankroll, etc)
   - sessionStorage para filtros de UI (Analytics, BetsList)

---

**Fim do documento de status** 🚀
