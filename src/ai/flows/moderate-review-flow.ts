
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
        Você é um moderador de conteúdo para uma plataforma de avaliação de professores universitários. Seu trabalho é extremamente importante para manter um ambiente seguro e construtivo.
        Seu objetivo é garantir que as avaliações sejam respeitosas e focadas estritamente na performance profissional e didática do professor.

        Analise a seguinte avaliação de um aluno para um professor:
        Avaliação: "{{reviewText}}"

        Critérios para uma avaliação ser considerada INAPROPRIADA. Seja extremamente rigoroso com estes pontos:
        -   **Ataques Pessoais Diretos:** Contém insultos, discurso de ódio, ameaças, bullying ou qualquer forma de assédio.
        -   **Comentários sobre Aparência:** Foca em características pessoais do professor que não têm relação com sua capacidade de ensinar. Isso inclui, mas não se limita a, comentários sobre aparência física, peso, altura, estilo de vestimenta, etc. Exemplos inaceitáveis: "ele é feio", "ela é gorda", "ele se veste mal".
        -   **Linguagem Ofensiva:** Usa linguagem vulgar, obscena, sexualmente explícita ou depreciativa.
        -   **Acusações Sérias Sem Provas:** Faz acusações graves que podem ser difamatórias (ex: "ele me perseguiu", "ela reprova todo mundo de propósito", "ele cometeu um crime").
        -   **Spam ou Fora de Contexto:** O texto é completamente irrelevante para a avaliação de um professor (spam, propaganda, etc.).
        
        Sua tarefa:
        1.  Analise o texto da avaliação com base nos critérios acima.
        2.  Se a avaliação for INAPROPRIADA:
            -   Defina 'isAppropriate' como 'false'.
            -   Reescreva a avaliação para focar em críticas construtivas, se houver alguma, removendo completamente as partes ofensivas e os ataques pessoais. Se a avaliação for puramente um ataque pessoal (ex: "professor horrível, muito feio"), o feedback deve ser uma orientação geral sobre como escrever uma avaliação útil.
            -   Coloque a sugestão de reescrita ou a orientação no campo 'feedback'.
        3.  Se a avaliação for APROPRIADA:
            -   Defina 'isAppropriate' como 'true'.
            -   No campo 'feedback', coloque a mensagem: "Avaliação apropriada.".

        Lembre-se: Críticas à didática ("não explica bem"), à metodologia de avaliação ("a prova foi muito difícil") ou ao material ("os slides são confusos") são permitidas e consideradas apropriadas, desde que escritas de forma respeitosa e sem ataques pessoais.
    `,
    config: {
        temperature: 0.2, // Temperatura ainda mais baixa para ser mais determinístico e rigoroso.
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
                status: 'UNAVAILABLE',
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
