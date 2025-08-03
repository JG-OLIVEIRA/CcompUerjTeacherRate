
'use server';

import { analyzeCode, summarizeCode, codeExplanation } from '@/ai/flows';
import type { AnalysisResult } from '@/lib/types';

export async function getAiAnalysis(code: string, language: string): Promise<AnalysisResult> {
    if (!code || !code.trim()) {
        throw new Error("O campo de código não pode estar vazio.");
    }
    if (!language) {
        throw new Error("Por favor, selecione uma linguagem de programação.");
    }

    try {
        const [summaryResult, analysisResult, explanationResult] = await Promise.all([
            summarizeCode({ code, language }),
            analyzeCode({ code, language }),
            codeExplanation({ code, language })
        ]);

        return {
            summary: summaryResult.summary,
            suggestions: analysisResult.suggestions,
            explanation: explanationResult.explanation
        };
    } catch (error) {
        console.error("Erro ao obter análise da IA:", error);
        throw new Error("Ocorreu um erro ao analisar o código. Por favor, tente novamente mais tarde.");
    }
}
