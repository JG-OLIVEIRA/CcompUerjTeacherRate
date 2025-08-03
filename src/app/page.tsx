'use client';

import { useState, useRef, useTransition } from 'react';
import { getAiAnalysis } from './actions';
import type { AnalysisResult } from '@/lib/types';
import { Code, Github, Upload, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { LanguageSelect } from '@/components/language-select';
import { CodeEditor } from '@/components/code-editor';
import AnalysisResults from '@/components/analysis-results';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  const [code, setCode] = useState<string>('');
  const [language, setLanguage] = useState<string>('javascript');
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleAnalyze = () => {
    startTransition(async () => {
      try {
        const analysisResults = await getAiAnalysis(code, language);
        setResults(analysisResults);
        toast({
          title: "Análise Concluída!",
          description: "As sugestões, resumo e explicação do seu código estão prontas.",
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
        toast({
          variant: "destructive",
          title: "Erro na Análise",
          description: errorMessage,
        });
        setResults(null);
      }
    });
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setCode(text);
        toast({
          title: "Arquivo importado",
          description: `${file.name} foi carregado com sucesso.`,
        });
      };
      reader.readAsText(file);
    }
    // Reset file input to allow re-uploading the same file
    if(event.target) {
      event.target.value = '';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-headline">
      <header className="flex items-center justify-between p-4 border-b sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <Code className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Otimizador de Aplicativos</h1>
        </div>
        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
          <Github className="h-5 w-5" />
          <span className="hidden md:inline">Ver no GitHub</span>
        </a>
      </header>

      <main className="flex-grow p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <div className="flex flex-col gap-6">
          <Card className="flex-grow flex flex-col shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl">Seu Código</CardTitle>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileImport}
                  className="hidden"
                  accept=".js,.ts,.py,.java,.cs,.go,.rs,.cpp,.php,.html,.css"
                />
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isPending}>
                  <Upload className="mr-2 h-4 w-4" />
                  Importar Arquivo
                </Button>
                <LanguageSelect language={language} setLanguage={setLanguage} disabled={isPending} />
              </div>
            </CardHeader>
            <CardContent className="flex-grow min-h-[400px]">
              <CodeEditor code={code} setCode={setCode} disabled={isPending} />
            </CardContent>
          </Card>
          <Button onClick={handleAnalyze} disabled={isPending || !code} size="lg" className="w-full text-lg">
            <Wand2 className="mr-2 h-5 w-5" />
            {isPending ? 'Analisando...' : 'Analisar Código'}
          </Button>
        </div>

        <div className="min-h-[400px] lg:min-h-0">
          <AnalysisResults results={results} isLoading={isPending} />
        </div>
      </main>

      <footer className="text-center p-4 border-t text-sm text-muted-foreground">
          Desenvolvido com a ajuda da IA do Firebase.
      </footer>
    </div>
  );
}
