
'use server';
/**
 * @fileOverview A flow to generate a witty, funny summary of teacher reviews.
 *
 * - summarizeReviews - A function that takes reviews and returns a humorous summary.
 * - SummarizeReviewsInput - The input type for the summarizeReviews function.
 * - SummarizeReviewsOutput - The return type for the summarizeReviews function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type {Review} from '@/lib/types';
import { gemini15Flash, type SafetySetting } from '@genkit-ai/googleai';

// Define the structure of a single review for the AI prompt
const ReviewSchema = z.object({
    rating: z.number(),
    text: z.string().optional(),
});

const SummarizeReviewsInputSchema = z.object({
  teacherName: z.string().describe('The name of the teacher being reviewed.'),
  reviews: z.array(ReviewSchema).describe('A list of reviews for the teacher.'),
});
export type SummarizeReviewsInput = z.infer<typeof SummarizeReviewsInputSchema>;

const SummarizeReviewsOutputSchema = z.object({
  summary: z.string().describe('A witty, funny, and insightful summary of the reviews.'),
});
export type SummarizeReviewsOutput = z.infer<typeof SummarizeReviewsOutputSchema>;


export async function summarizeReviews(input: SummarizeReviewsInput): Promise<SummarizeReviewsOutput> {
  // Filter out reviews that have no text content, as they aren't useful for summary
  const reviewsWithText = input.reviews.filter(r => r.text && r.text.trim() !== '');
  if (reviewsWithText.length === 0) {
      return { summary: `Ainda não há comentários suficientes sobre ${input.teacherName} para que nossa IA possa dar um palpite.` };
  }
  return summarizeReviewsFlow({ ...input, reviews: reviewsWithText });
}


const prompt = ai.definePrompt({
  name: 'summarizeReviewsPrompt',
  model: gemini15Flash,
  input: {schema: SummarizeReviewsInputSchema},
  output: {schema: SummarizeReviewsOutputSchema},
  prompt: `
    Você é um veterano sarcástico e divertido do curso de Ciência da Computação da UERJ. Sua missão é ler as avaliações sobre o professor {{teacherName}} e criar um resumo curto (no máximo 3-4 frases), espirituoso e útil para os calouros.

    Seu resumo deve capturar a essência das avaliações, destacando os pontos mais importantes de uma forma engraçada e memorável. Use um tom informal, como se estivesse conversando com um amigo no corredor da universidade.

    Regras Importantes:
    1.  Seja engraçado, mas nunca desrespeitoso. O objetivo é informar com humor.
    2.  Foque nos temas recorrentes: as provas são difíceis? Ele(a) cobra presença? As aulas são interessantes? A matéria é útil?
    3.  Não invente informações. Baseie-se APENAS nas avaliações fornecidas.
    4.  Mantenha o texto curto e direto.
    5.  Responda em português do Brasil.

    Aqui estão as avaliações dos alunos:
    {{#each reviews}}
    - Nota: {{rating}}/5. Comentário: "{{text}}"
    {{/each}}

    Agora, crie o seu resumo genial:
  `,
});


const summarizeReviewsFlow = ai.defineFlow(
  {
    name: 'summarizeReviewsFlow',
    inputSchema: SummarizeReviewsInputSchema,
    outputSchema: SummarizeReviewsOutputSchema,
  },
  async input => {
    // Set a lower safety threshold to allow for more "sarcastic" and "witty" responses
    // without being overly offensive.
    const customSafetyConfig: { safetySettings: SafetySetting[] } = {
        safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
    };

    const {output} = await prompt(input, { config: customSafetyConfig });
    return output!;
  }
);
