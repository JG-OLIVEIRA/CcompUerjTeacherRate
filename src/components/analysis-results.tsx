'use client';

import type { AnalysisResult } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Skeleton } from "./ui/skeleton";
import { BookOpen, FileText, Lightbulb } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";

interface AnalysisResultsProps {
  results: AnalysisResult | null;
  isLoading: boolean;
}

const LoadingSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-1/3" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
  </div>
);

export default function AnalysisResults({ results, isLoading }: AnalysisResultsProps) {
  const renderContent = (content: string) => (
    <ScrollArea className="h-full">
      <pre className="text-sm font-code whitespace-pre-wrap break-words p-1">
        {content}
      </pre>
    </ScrollArea>
  );
  
  return (
    <Card className="h-full flex flex-col shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl">Resultados da Análise</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow min-h-0">
        <Tabs defaultValue="suggestions" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="suggestions">
              <Lightbulb className="mr-2 h-4 w-4" /> Sugestões
            </TabsTrigger>
            <TabsTrigger value="summary">
              <FileText className="mr-2 h-4 w-4" /> Resumo
            </TabsTrigger>
            <TabsTrigger value="explanation">
              <BookOpen className="mr-2 h-4 w-4" /> Explicação
            </TabsTrigger>
          </TabsList>
          <div className="flex-grow mt-4 min-h-0">
            <TabsContent value="suggestions" className="h-full">
              {isLoading ? <LoadingSkeleton /> : renderContent(results?.suggestions ?? "Nenhuma sugestão gerada.")}
            </TabsContent>
            <TabsContent value="summary" className="h-full">
              {isLoading ? <LoadingSkeleton /> : renderContent(results?.summary ?? "Nenhum resumo gerado.")}
            </TabsContent>
            <TabsContent value="explanation" className="h-full">
              {isLoading ? <LoadingSkeleton /> : renderContent(results?.explanation ?? "Nenhuma explicação gerada.")}
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
