import { useState, useMemo } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useExtendedData } from '@/hooks/useExtendedData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';

export default function FAQ() {
  const { t, language } = useTranslation();
  const { glossary } = useExtendedData();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredGlossary = useMemo(() => {
    return glossary.filter(entry => 
      entry.language === language &&
      (entry.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
       entry.definition.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [glossary, language, searchTerm]);

  const categories = ['general', 'betTypes', 'markets', 'strategies'];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">{t('faq.title')}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t('faq.title')}</CardTitle>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('faq.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              {categories.map(cat => (
                <TabsTrigger key={cat} value={cat}>
                  {t(`faq.${cat}`)}
                </TabsTrigger>
              ))}
            </TabsList>
            {categories.map(category => (
              <TabsContent key={category} value={category} className="space-y-4 mt-6">
                {filteredGlossary
                  .filter(entry => entry.category === category)
                  .map(entry => (
                    <div key={entry.id} className="border-b border-border pb-4 last:border-0">
                      <h3 className="font-semibold text-lg text-foreground mb-2">
                        {entry.term}
                      </h3>
                      <p className="text-muted-foreground">{entry.definition}</p>
                    </div>
                  ))}
                {filteredGlossary.filter(e => e.category === category).length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    {t('common.noData')}
                  </p>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
