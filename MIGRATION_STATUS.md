# Status da Migração para Zustand - Projeto Betting Management

## 📊 Resumo Geral

Migração de hooks customizados (`useBettingData`, `useExtendedData`) para gerenciamento de estado global com Zustand.

**Data de início:** 03/12/2025
**Última atualização:** 03/12/2025

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

## 🔄 PRÓXIMAS FASES

### FASE 3: Migração Analytics (PRÓXIMA SESSÃO)
- [ ] Migrar `client/src/pages/Analytics.tsx`
- [ ] Substituir useState de filtros por `useAnalyticsFilterStore`
- [ ] Testar persistência de filtros em sessionStorage
- [ ] Validar cálculos complexos

**Arquivos envolvidos:**
- `client/src/pages/Analytics.tsx`
- `client/src/components/betting/AnalyticsFilters.tsx` (pode precisar ajustar props)

### FASE 4: Migração BetsList (FUTURA)
- [ ] Criar `client/src/stores/filters/betsListFilterStore.ts`
- [ ] Migrar `client/src/pages/BetsList.tsx`
- [ ] Testar filtros e paginação

**Filtros a incluir:**
- searchTerm, filterBookmaker, filterType, filterStatus
- filterPeriod, filterProfit, filterTeam
- oddsRange, amountRange
- filterHasBoost, filterHasCashout, filterUsedCredits, filterIsProtected
- sortColumn, sortDirection
- currentPage, itemsPerPage

### FASE 5+: Demais Páginas (FUTURAS)
- [ ] AddBet.tsx
- [ ] BankrollSettings.tsx
- [ ] Import.tsx
- [ ] Watchlist.tsx
- [ ] Tips.tsx
- [ ] Outras páginas

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
