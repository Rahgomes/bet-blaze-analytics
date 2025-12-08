import { useState, useMemo } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useBettingStore } from '@/stores/betting';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  BookOpen, 
  Target, 
  TrendingUp, 
  Calculator,
  Filter,
  SortAsc,
  SortDesc,
  HelpCircle,
  Lightbulb,
  Star,
  BarChart3,
  Zap,
  Shield,
  Coins,
  Trophy
} from 'lucide-react';

export default function FAQ() {
  const { t, language } = useTranslation();
  const glossary = useBettingStore(state => state.glossary);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('glossary');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('alphabetical');
  const [sortOrder, setSortOrder] = useState('asc');

  // Estatísticas do glossário
  const glossaryStats = useMemo(() => {
    const filtered = glossary.filter(entry => entry.language === language);
    return {
      total: filtered.length,
      byCategory: {
        general: filtered.filter(e => e.category === 'general').length,
        betTypes: filtered.filter(e => e.category === 'betTypes').length,
        markets: filtered.filter(e => e.category === 'markets').length,
        strategies: filtered.filter(e => e.category === 'strategies').length,
      }
    };
  }, [glossary, language]);

  // Filtros e busca avançada
  const filteredAndSortedGlossary = useMemo(() => {
    let filtered = glossary.filter(entry => {
      const matchesLanguage = entry.language === language;
      const matchesSearch = searchTerm === '' || 
        entry.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.definition.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || entry.category === selectedCategory;
      
      return matchesLanguage && matchesSearch && matchesCategory;
    });

    // Ordenação
    filtered.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'alphabetical') {
        comparison = a.term.localeCompare(b.term);
      } else if (sortBy === 'category') {
        comparison = a.category.localeCompare(b.category);
      } else if (sortBy === 'length') {
        comparison = a.definition.length - b.definition.length;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [glossary, language, searchTerm, selectedCategory, sortBy, sortOrder]);

  const categories = [
    { value: 'all', label: 'Todos', icon: BookOpen, count: glossaryStats.total },
    { value: 'general', label: 'Geral', icon: HelpCircle, count: glossaryStats.byCategory.general },
    { value: 'betTypes', label: 'Tipos de Aposta', icon: Target, count: glossaryStats.byCategory.betTypes },
    { value: 'markets', label: 'Mercados', icon: BarChart3, count: glossaryStats.byCategory.markets },
    { value: 'strategies', label: 'Estratégias', icon: TrendingUp, count: glossaryStats.byCategory.strategies },
  ];

  // FAQ real com perguntas frequentes
  const faqItems = [
    {
      question: "Como calcular meu ROI?",
      answer: "ROI = (Lucro Total / Stake Total) × 100. Por exemplo: se você apostou R$ 1000 e teve R$ 150 de lucro, seu ROI é 15%.",
      category: "basics"
    },
    {
      question: "Qual percentual da banca devo apostar?",
      answer: "Recomenda-se 1-5% da banca por aposta. Apostadores conservadores usam 1-2%, mais agressivos 3-5%. Nunca mais que 10%.",
      category: "bankroll"
    },
    {
      question: "O que são Value Bets?",
      answer: "São apostas onde você acredita que as odds oferecidas são maiores que a probabilidade real. Por exemplo, se um time tem 60% de chance de ganhar mas as odds dão 40%, é value bet.",
      category: "strategy"
    },
    {
      question: "Como identificar surebets/arbitragem?",
      answer: "Compare odds de diferentes casas. Se a soma dos inversos das odds for menor que 1, há arbitragem. Use calculadoras especializadas para encontrar essas oportunidades.",
      category: "advanced"
    },
    {
      question: "O que fazer durante uma sequência de derrotas?",
      answer: "Mantenha a disciplina! Não aumente stakes para recuperar perdas. Revise sua estratégia, pare se necessário, e mantenha o controle emocional.",
      category: "psychology"
    },
  ];

  // Ferramentas calculadoras
  const tools = [
    {
      title: "Calculadora de ROI",
      description: "Calcule seu retorno sobre investimento",
      icon: Calculator,
      color: "bg-blue-500"
    },
    {
      title: "Conversor de Odds",
      description: "Converta entre decimal, fracionário e americano",
      icon: Zap,
      color: "bg-green-500"
    },
    {
      title: "Simulador de Stake",
      description: "Simule diferentes estratégias de stake",
      icon: Target,
      color: "bg-purple-500"
    },
    {
      title: "Calculadora de Arbitragem",
      description: "Identifique oportunidades de surebet",
      icon: Trophy,
      color: "bg-orange-500"
    },
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'general': return HelpCircle;
      case 'betTypes': return Target;
      case 'markets': return BarChart3;
      case 'strategies': return TrendingUp;
      default: return BookOpen;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'general': return 'bg-blue-100 text-blue-800';
      case 'betTypes': return 'bg-green-100 text-green-800';
      case 'markets': return 'bg-purple-100 text-purple-800';
      case 'strategies': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Central de Conhecimento</h1>
        <p className="text-muted-foreground">Glossário, FAQ e ferramentas para aprimorar suas apostas</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="glossary" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Glossário
          </TabsTrigger>
          <TabsTrigger value="faq" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            FAQ
          </TabsTrigger>
          <TabsTrigger value="tools" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Ferramentas
          </TabsTrigger>
          <TabsTrigger value="tips" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Dicas & Guias
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: GLOSSÁRIO AVANÇADO */}
        <TabsContent value="glossary" className="space-y-6">
          {/* Estatísticas do Glossário */}
          <div className="grid gap-4 md:grid-cols-4">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Card key={cat.value} className="hover:shadow-md transition-shadow cursor-pointer" 
                      onClick={() => setSelectedCategory(cat.value)}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getCategoryColor(cat.value)}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-lg">{cat.count}</div>
                        <div className="text-sm text-muted-foreground">{cat.label}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Controles de Busca e Filtro */}
          <Card>
            <CardHeader>
              <CardTitle>Glossário de Termos de Apostas</CardTitle>
              <CardDescription>
                {glossaryStats.total} termos disponíveis em {language === 'pt-br' ? 'Português' : 'English'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                {/* Busca */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar termo ou definição..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Filtro por Categoria */}
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full md:w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label} ({cat.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Ordenação */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alphabetical">A-Z</SelectItem>
                    <SelectItem value="category">Categoria</SelectItem>
                    <SelectItem value="length">Tamanho</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </Button>
              </div>

              {/* Lista de Termos */}
              <div className="space-y-4">
                {filteredAndSortedGlossary.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Nenhum termo encontrado</p>
                  </div>
                ) : (
                  filteredAndSortedGlossary.map((entry, index) => {
                    const Icon = getCategoryIcon(entry.category);
                    return (
                      <Card key={entry.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className={`p-2 rounded-lg ${getCategoryColor(entry.category)} flex-shrink-0`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-grow">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-lg">{entry.term}</h3>
                                <Badge variant="outline" className="text-xs">
                                  {entry.category === 'general' ? 'Geral' : 
                                   entry.category === 'betTypes' ? 'Tipos' :
                                   entry.category === 'markets' ? 'Mercados' : 'Estratégias'}
                                </Badge>
                              </div>
                              <p className="text-muted-foreground leading-relaxed">
                                {entry.definition}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: FAQ REAL */}
        <TabsContent value="faq" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Perguntas Frequentes</CardTitle>
              <CardDescription>Respostas para as dúvidas mais comuns sobre apostas esportivas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {faqItems.map((item, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <HelpCircle className="h-5 w-5 text-blue-500" />
                        {item.question}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
                      <Badge variant="outline" className="mt-3 text-xs">
                        {item.category}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: FERRAMENTAS */}
        <TabsContent value="tools" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {tools.map((tool, index) => {
              const Icon = tool.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`p-3 rounded-lg ${tool.color} text-white`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{tool.title}</h3>
                        <p className="text-sm text-muted-foreground">{tool.description}</p>
                      </div>
                    </div>
                    <Button className="w-full">
                      Usar Ferramenta
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* TAB 4: DICAS & GUIAS */}
        <TabsContent value="tips" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dicas & Guias de Apostas</CardTitle>
              <CardDescription>Conselhos práticos para melhorar sua estratégia</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-500" />
                    Gestão de Banca
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Nunca aposte mais que 5% da banca em uma aposta</li>
                    <li>• Defina stop loss semanal e mensal</li>
                    <li>• Mantenha registros detalhados de todas as apostas</li>
                    <li>• Reavalie sua estratégia mensalmente</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-500" />
                    Value Betting
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Compare odds entre diferentes casas</li>
                    <li>• Estude estatísticas dos times profundamente</li>
                    <li>• Foque em mercados que você conhece bem</li>
                    <li>• Seja paciente para encontrar value real</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Zap className="h-5 w-5 text-purple-500" />
                    Controle Emocional
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Nunca persiga perdas aumentando stakes</li>
                    <li>• Aposte apenas quando estiver em bom estado mental</li>
                    <li>• Celebre vitórias, mas mantenha disciplina</li>
                    <li>• Faça pausas regulares das apostas</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Coins className="h-5 w-5 text-orange-500" />
                    Análise de Mercados
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Especialize-se em poucos mercados</li>
                    <li>• Acompanhe lesões e notícias dos times</li>
                    <li>• Considere fatores como motivação e histórico</li>
                    <li>• Use estatísticas como apoio, não decisão final</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
