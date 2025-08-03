
'use server';
/**
 * @fileOverview Flow de moderação de avaliações usando IA.
 * 
 * - moderateReview: Analisa o texto de uma avaliação para garantir que seja construtivo e respeitoso.
 * - ModerateReviewInput: O tipo de entrada para a função moderateReview.
 * - ModerateReviewOutput: O tipo de retorno para a função moderateReview.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { GenkitError } from 'genkit';


// Definição do esquema de entrada para o fluxo de moderação.
const ModerateReviewInputSchema = z.object({
  reviewText: z.string().describe('O texto da avaliação a ser moderado.'),
});
export type ModerateReviewInput = z.infer<typeof ModerateReviewInputSchema>;

// Definição do esquema de saída para o fluxo de moderação.
const ModerateReviewOutputSchema = z.object({
    isAppropriate: z.boolean().describe('Indica se a avaliação é apropriada e construtiva.'),
    feedback: z.string().describe('Feedback para o usuário. Se for inapropriado, contém uma sugestão de reescrita. Se for apropriado, uma mensagem de confirmação.'),
});
export type ModerateReviewOutput = z.infer<typeof ModerateReviewOutputSchema>;

/**
 * Função pública que invoca o fluxo de moderação de avaliações.
 * @param input - O objeto contendo o texto da avaliação.
 * @returns Um objeto indicando se a avaliação é apropriada e o feedback correspondente.
 */
export async function moderateReview(input: ModerateReviewInput): Promise<ModerateReviewOutput> {
  return moderateReviewFlow(input);
}

// Definição do prompt de IA para moderação.
const moderationPrompt = ai.definePrompt({
    name: 'moderationPrompt',
    input: { schema: ModerateReviewInputSchema },
    output: { schema: ModerateReviewOutputSchema },
    prompt: `
        Você é um moderador de conteúdo para uma plataforma de avaliação de professores universitários.
        Seu objetivo é garantir que as avaliações sejam construtivas, respeitosas e úteis para a comunidade.
        Analise a seguinte avaliação de um aluno para um professor:

        Avaliação: "{{reviewText}}"

        Critérios para uma avaliação INAPROPRIADA:
        - Contém discurso de ódio, insultos, ameaças, ou ataques pessoais diretos.
        - Usa linguagem vulgar, obscena ou ofensiva.
        - Faz acusações sérias sem fundamentação (ex: "ele me perseguiu", "ela reprova todo mundo de propósito").
        - O texto é completamente fora de contexto (spam, propaganda, etc.).
        - Foca em características pessoais do professor (aparência, etc.) em vez da sua didática ou comportamento profissional.

        Sua tarefa:
        1.  Determine se a avaliação é apropriada ou não com base nos critérios acima.
        2.  Se a avaliação for INAPROPRIADA:
            -   Defina 'isAppropriate' como 'false'.
            -   Reescreva a avaliação para focar nos pontos válidos de forma construtiva e respeitosa. Remova as partes ofensivas. A reescrita deve ser uma sugestão útil para o usuário.
            -   Coloque a sugestão de reescrita no campo 'feedback'.
        3.  Se a avaliação for APROPRIADA:
            -   Defina 'isAppropriate' como 'true'.
            -   No campo 'feedback', coloque a mensagem: "Avaliação apropriada.".

        Seja rigoroso, mas justo. Críticas à didática, dificuldade da matéria ou método de avaliação são permitidas e consideradas apropriadas se forem escritas de forma respeitosa.
    `,
    config: {
        temperature: 0.3, // Baixa temperatura para manter a consistência e evitar alucinações.
    }
});

/**
 * Fluxo do Genkit que executa a lógica de moderação.
 */
const moderateReviewFlow = ai.defineFlow(
  {
    name: 'moderateReviewFlow',
    inputSchema: ModerateReviewInputSchema,
    outputSchema: ModerateReviewOutputSchema,
  },
  async (input) => {
    try {
        // Se o texto for muito curto, não há necessidade de chamar a IA.
        if (input.reviewText.trim().length < 10) {
            return {
                isAppropriate: true,
                feedback: 'Avaliação apropriada.',
            };
        }

        const { output } = await moderationPrompt(input);
        
        if (!output) {
            throw new GenkitError({
                source: 'moderateReviewFlow',
                status: 'unavailable',
                message: 'A IA não conseguiu gerar uma resposta. A resposta estava vazia.',
            });
        }
        
        return output;

    } catch (error) {
        console.error('[moderateReviewFlow] Erro durante a moderação com IA:', error);
        
        // Em caso de erro com a API da IA, consideramos a avaliação como apropriada para não bloquear o usuário.
        // A moderação do lado do servidor (se houver) pode pegar problemas mais tarde.
        return {
            isAppropriate: true,
            feedback: 'Não foi possível validar o texto, mas a avaliação foi enviada.',
        };
    }
  }
);
