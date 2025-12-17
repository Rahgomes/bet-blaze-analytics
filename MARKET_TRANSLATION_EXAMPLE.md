# 🎯 Exemplo Prático - Tradução de Mercados

## Problema Anterior (Hardcoded)

```typescript
// ❌ ANTES - Mercados em português hardcoded
const markets = ['Resultado Final', 'Ambas Marcam', 'Total de Gols', 'Escanteios'];

// Quando o usuário muda para inglês, os mercados continuam em português!
```

## Solução com `tm()` (Traduzível)

```typescript
import { useTranslation } from '@/hooks/useTranslation';

function BettingComponent() {
  const { tm } = useTranslation();
  
  // ✅ AGORA - Mercados traduzíveis
  const markets = ['Resultado Final', 'Ambas Marcam', 'Total de Gols', 'Escanteios'];

  return (
    <div>
      {markets.map(market => (
        <Badge key={market}>
          {tm(market)} {/* Traduz automaticamente! */}
        </Badge>
      ))}
    </div>
  );
}
```

## Resultado

**Quando o idioma é Português (pt-br):**
```
Resultado Final | Ambas Marcam | Total de Gols | Escanteios
```

**Quando o idioma é Inglês (en):**
```
Match Result | Both Teams to Score | Total Goals | Corners
```

## Casos de Uso Reais

### 1️⃣ LiveGameCard - Exibir Mercados Traduzidos

```typescript
export function LiveGameCard({ game }: LiveGameCardProps) {
  const { t, tm } = useTranslation();

  return (
    <Card>
      {/* Outros elementos... */}
      
      {/* Mercados envolvidos - TRADUZIDOS */}
      {game.markets.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {game.markets.map((market, i) => (
            <Badge key={i} variant="outline" className="text-xs">
              {tm(market)} {/* 🎯 Tradução automática */}
            </Badge>
          ))}
        </div>
      )}
    </Card>
  );
}
```

### 2️⃣ BetDetailModal - Mostrar Mercado da Aposta

```typescript
export function BetDetailModal({ bet }: BetDetailModalProps) {
  const { t, tm } = useTranslation();

  return (
    <Dialog>
      <DialogContent>
        <h2>{t('bet.details')}</h2>
        
        {/* Mercado traduzido */}
        <div>
          <label>{t('bet.market')}:</label>
          <span>{tm(bet.market)}</span> {/* 🎯 Tradução */}
        </div>
        
        <div>
          <label>{t('bet.odds')}:</label>
          <span>{bet.odds}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### 3️⃣ MarketDistributionChart - Gráfico de Distribuição

```typescript
export function MarketDistributionChart({ distribution }: Props) {
  const { t, tm } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('watchlist.components.marketDistribution.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        {distribution.map((market, i) => (
          <div key={i}>
            {/* Nome do mercado traduzido */}
            <span className="text-sm font-medium">{tm(market.market)}</span>
            <Progress value={market.percentage} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
```

## Como a Função `tm()` Funciona

```typescript
// Internamente no useTranslation.tsx
const tm = (marketName: string): string => {
  // 1. Normaliza o nome (remove acentos, espaços, caracteres especiais)
  const normalizeToKey = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/\s+/g, '')             // Remove espaços
      .replace(/[^\w]/g, '');           // Remove especiais
  };

  // 2. Gera a chave: "Resultado Final" → "resultadofinal"
  const key = normalizeToKey(marketName);

  // 3. Busca a tradução no idioma atual
  const translation = translations[language]?.markets?.[key];

  // 4. Retorna tradução ou original se não encontrar
  return translation || marketName;
};
```

## Tabela de Conversão

| Input Original | Chave Gerada | PT-BR | EN |
|----------------|--------------|-------|-----|
| `"Resultado Final"` | `resultadofinal` | Resultado Final | Match Result |
| `"Ambas Marcam"` | `ambasmarcam` | Ambas Marcam | Both Teams to Score |
| `"Total de Gols"` | `totaldegols` | Total de Gols | Total Goals |
| `"Escanteios"` | `escanteios` | Escanteios | Corners |

## Vantagens

✅ **Automático** - Não precisa criar switch/case manual  
✅ **Flexível** - Aceita variações de escrita  
✅ **Seguro** - Se não encontrar tradução, mantém original  
✅ **Limpo** - Código muito mais legível  
✅ **Manutenível** - Fácil adicionar novos mercados  

## Migrando Código Existente

### Antes (❌):
```typescript
// Componente precisa saber as traduções
const getMarketName = (market: string) => {
  switch(market) {
    case 'Resultado Final': return language === 'en' ? 'Match Result' : 'Resultado Final';
    case 'Ambas Marcam': return language === 'en' ? 'Both Teams to Score' : 'Ambas Marcam';
    // ... muitos casos
  }
}

return <span>{getMarketName(bet.market)}</span>
```

### Depois (✅):
```typescript
// Simples e direto!
const { tm } = useTranslation();

return <span>{tm(bet.market)}</span>
```

## 🎉 Resultado Final

Todo o sistema de mercados agora é **100% traduzível** de forma automática e elegante!

**Use sempre:**
- `t()` para textos estáticos
- `tm()` para nomes de mercados
- Nunca deixe textos hardcoded!

