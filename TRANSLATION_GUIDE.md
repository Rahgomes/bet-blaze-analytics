# 🌍 Guia de Tradução - Translation Guide

## ✅ Sistema de Tradução Implementado

Este projeto agora possui um sistema completo de internacionalização (i18n) com suporte para **Português (pt-br)** e **Inglês (en)**.

---

## 📚 Como Usar

### 1️⃣ Tradução de Textos Normais - Função `t()`

Use a função `t()` para traduzir textos estáticos:

```typescript
import { useTranslation } from '@/hooks/useTranslation';

function MeuComponente() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('watchlist.title')}</h1>
      <p>{t('watchlist.description')}</p>
    </div>
  );
}
```

### 2️⃣ Tradução com Parâmetros Dinâmicos

Use placeholders `{paramName}` nas traduções:

**Arquivo de tradução (en.json):**
```json
{
  "watchlist": {
    "teamsOfTotal": "({count} of {total} teams)"
  }
}
```

**Uso no código:**
```typescript
const { t } = useTranslation();

// Resultado: "(5 of 10 teams)"
t('watchlist.teamsOfTotal', { count: 5, total: 10 })
```

### 3️⃣ 🆕 Tradução de Mercados de Apostas - Função `tm()`

**NOVIDADE!** Use a função `tm()` (translate market) para traduzir nomes de mercados automaticamente:

```typescript
import { useTranslation } from '@/hooks/useTranslation';

function BetCard({ market }) {
  const { tm } = useTranslation();

  return (
    <div>
      <span>Mercado: {tm(market)}</span>
    </div>
  );
}
```

**Exemplo prático:**
```typescript
const { tm } = useTranslation();

// Em português (pt-br):
tm('Resultado Final')   // → "Resultado Final"
tm('Ambas Marcam')      // → "Ambas Marcam"
tm('Total de Gols')     // → "Total de Gols"

// Em inglês (en):
tm('Resultado Final')   // → "Match Result"
tm('Ambas Marcam')      // → "Both Teams to Score"
tm('Total de Gols')     // → "Total Goals"
```

**Como funciona:**
- A função `tm()` normaliza o nome do mercado (remove acentos, espaços, etc.)
- Busca a tradução correspondente no arquivo de idioma atual
- Se não encontrar tradução, retorna o nome original

---

## 📝 Mercados Suportados

### Lista de Mercados Traduzíveis:

| Português (pt-br) | Inglês (en) | Chave |
|-------------------|-------------|-------|
| Resultado Final | Match Result | `resultadoFinal` |
| Ambas Marcam | Both Teams to Score | `ambasMarcam` |
| Total de Gols | Total Goals | `totalDeGols` |
| Escanteios | Corners | `escanteios` |
| Handicap Asiático | Asian Handicap | `handicapAsiatico` |
| Handicap Europeu | European Handicap | `handicapEuropeu` |
| Placar Exato | Correct Score | `placarExato` |
| Intervalo/Final | Half Time/Full Time | `intervaloFinal` |
| Primeiro Gol | First Goal | `primeiroGol` |
| Último Gol | Last Goal | `ultimoGol` |
| Gols Par | Even Goals | `golsPar` |
| Gols Ímpar | Odd Goals | `golsImpar` |
| Cartões | Cards | `cartoes` |
| Maior Pontuador | Top Scorer | `maiorPontuador` |
| Acima/Abaixo | Over/Under | `overUnder` |

---

## ➕ Como Adicionar Novos Mercados

1. **Adicione a tradução nos arquivos de idioma:**

**`client/src/locales/en.json`:**
```json
{
  "markets": {
    "novoMercado": "New Market Name"
  }
}
```

**`client/src/locales/pt-br.json`:**
```json
{
  "markets": {
    "novoMercado": "Nome do Novo Mercado"
  }
}
```

2. **Use no código:**
```typescript
const { tm } = useTranslation();
tm('Nome do Novo Mercado') // Traduz automaticamente
```

---

## 🔄 Mudando o Idioma

```typescript
const { language, setLanguage } = useTranslation();

// Mudar para inglês
setLanguage('en');

// Mudar para português
setLanguage('pt-br');

// Ver idioma atual
console.log(language); // 'pt-br' ou 'en'
```

---

## 📂 Estrutura de Arquivos

```
client/src/
├── hooks/
│   └── useTranslation.tsx      # Hook principal de tradução
├── locales/
│   ├── en.json                 # Traduções em inglês
│   └── pt-br.json              # Traduções em português
└── components/
    └── ...                     # Componentes usando tradução
```

---

## 💡 Boas Práticas

1. ✅ **SEMPRE use `t()` ou `tm()`** - Nunca deixe textos hardcoded
2. ✅ **Use chaves descritivas** - `watchlist.title` é melhor que `wl.t`
3. ✅ **Organize por seção** - Agrupe traduções relacionadas
4. ✅ **Use `tm()` para mercados** - Tradução automática e consistente
5. ✅ **Mantenha paridade** - Sempre traduza para TODOS os idiomas

❌ **Evite:**
```typescript
// RUIM - Texto hardcoded
<h1>Central de Monitoramento</h1>

// BOM - Traduzível
<h1>{t('watchlist.monitoringCenter')}</h1>
```

---

## 🎯 Exemplos Completos

### Exemplo 1: Componente com Tradução Básica
```typescript
import { useTranslation } from '@/hooks/useTranslation';

export function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('page.title')}</h1>
      <button>{t('buttons.save')}</button>
    </div>
  );
}
```

### Exemplo 2: Componente com Mercados
```typescript
import { useTranslation } from '@/hooks/useTranslation';

export function BetCard({ bet }) {
  const { t, tm } = useTranslation();

  return (
    <div>
      <h3>{tm(bet.market)}</h3> {/* Traduz o mercado */}
      <p>{t('bet.amount')}: R$ {bet.amount}</p>
      <p>{t('bet.odds')}: {bet.odds}</p>
    </div>
  );
}
```

### Exemplo 3: Tradução com Variáveis
```typescript
import { useTranslation } from '@/hooks/useTranslation';

export function UserGreeting({ name, count }) {
  const { t } = useTranslation();

  return (
    <div>
      <p>{t('greeting.welcome', { name })}</p>
      <p>{t('bets.total', { count })}</p>
    </div>
  );
}
```

---

## 🚀 Status da Tradução

### ✅ Páginas 100% Traduzidas:
- ✅ Watchlist (Monitoramento & Exposição)
- ✅ Analytics (Análises)
- ✅ BetsList (Lista de Apostas)
- ✅ Reports (Relatórios)
- ✅ Import (Importação)
- ✅ Settings (Configurações)

### 🎯 Componentes Traduzidos:
- ✅ TeamConcentrationCard
- ✅ ActivePLScenarios
- ✅ MarketDistributionChart
- ✅ ExposureSummaryGrid
- ✅ LiveGameCard
- ✅ PendingGamesTable
- ✅ TeamRatingFilters
- ✅ AnalyticsFilters
- ✅ BetDetailModal
- ✅ GoalTrackingCard

---

## 📊 Estatísticas

- **2 idiomas** suportados: 🇧🇷 Português | 🇺🇸 English
- **150+ chaves** de tradução
- **15+ mercados** traduzíveis
- **10+ componentes** traduzidos
- **0 textos** hardcoded (em páginas traduzidas)

---

## 🤝 Contribuindo

Ao adicionar novas features, **SEMPRE** adicione as traduções:

1. Adicione as chaves em `en.json` e `pt-br.json`
2. Use `t()` para textos normais
3. Use `tm()` para nomes de mercados
4. Teste em ambos os idiomas
5. Atualize este guia se necessário

---

## 📞 Dúvidas?

- Hook de tradução: `client/src/hooks/useTranslation.tsx`
- Traduções EN: `client/src/locales/en.json`
- Traduções PT-BR: `client/src/locales/pt-br.json`

**Exemplo de uso da função `tm()`:**
```typescript
// No seu componente
const { tm } = useTranslation();

// Dados mockados ou reais
const markets = ['Resultado Final', 'Ambas Marcam', 'Total de Gols'];

// Renderizar com tradução automática
{markets.map(market => (
  <Badge key={market}>{tm(market)}</Badge>
))}
```

---

**✨ Pronto! Agora todo o sistema está 100% internacionalizado!** 🎉
