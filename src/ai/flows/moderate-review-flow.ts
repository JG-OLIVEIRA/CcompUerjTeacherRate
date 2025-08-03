
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
    feedback: z.string().describe('Feedback para o usuário. Se for inapropriado, contém o motivo e uma sugestão de reescrita. Se for apropriado, uma mensagem de confirmação.'),
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
        Você é um moderador de conteúdo para uma plataforma de avaliação de professores universitários. Seu trabalho é crucial para manter um ambiente seguro, justo e construtivo.
        Seu objetivo é garantir que as avaliações sejam respeitosas e focadas estritamente na performance profissional e didática do professor.

        Analise a seguinte avaliação:
        Avaliação: "{{reviewText}}"

        Critérios para uma avaliação ser considerada INAPROPRIADA. Seja extremamente rigoroso e literal. Qualquer violação, por menor que seja, torna a avaliação inapropriada.
        1.  **Ataques Pessoais:** Contém insultos, discurso de ódio, ameaças, bullying, assédio ou linguagem depreciativa.
        2.  **Comentários sobre Características Pessoais:** Foca em características do professor que não têm relação com sua capacidade de ensinar (aparência física, peso, altura, estilo de vestimenta, voz, deficiências, etc.). Exemplos inaceitáveis: "ele é feio", "ela é gorda", "a voz dele é irritante", "professor fudido".
        3.  **Feedback Vago e Ofensivo:** Usa adjetivos pejorativos que não descrevem uma ação ou comportamento didático. Exemplos: "professor chato", "ele é lerdo", "insuportável". Isso não é construtivo.
        4.  **Linguagem Ofensiva:** Usa qualquer tipo de palavrão, linguagem vulgar, obscena, sexualmente explícita ou depreciativa.
        5.  **Acusações Graves Sem Provas:** Faz acusações que podem ser difamatórias (ex: "ele me perseguiu", "ela reprova todo mundo de propósito", "ele cometeu um crime").
        6.  **Spam ou Fora de Contexto:** O texto é irrelevante para a avaliação de um professor.
        
        Sua tarefa:
        1.  Analise o texto da avaliação com base nos critérios acima.
        2.  Se a avaliação violar QUALQUER um dos critérios:
            -   Defina 'isAppropriate' como 'false'.
            -   No campo 'feedback', explique de forma clara e direta qual regra foi violada e por quê.
            -   Se possível, ofereça uma sugestão de como a ideia central poderia ser reescrita de forma construtiva e respeitosa. Por exemplo, se o texto for "professor chato", o feedback deve ser: "O termo 'chato' é vago e ofensivo. Tente focar em aspectos específicos, como 'A didática poderia ser mais dinâmica e com mais exemplos práticos'." Se for um ataque pessoal direto como "professor gordo e feio", o feedback deve ser: "Comentários sobre a aparência física são estritamente proibidos e constituem um ataque pessoal.".
        3.  Se a avaliação for APROPRIADA e não violar nenhuma regra:
            -   Defina 'isAppropriate' como 'true'.
            -   No campo 'feedback', coloque a mensagem: "Avaliação apropriada.".

        Lembre-se: Críticas à didática ("não explica bem"), à metodologia ("a prova foi muito difícil") ou ao material ("os slides são confusos") são permitidas e apropriadas, desde que escritas de forma respeitosa.
    `,
    config: {
        temperature: 0.1, 
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
    const { output } = await moderationPrompt(input);
    
    if (!output) {
        throw new GenkitError({
            source: 'moderateReviewFlow',
            status: 'UNAVAILABLE',
            message: 'A IA não conseguiu gerar uma resposta. A resposta estava vazia.',
        });
    }
    
    return output;
  }
);
