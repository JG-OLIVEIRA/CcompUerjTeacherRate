// src/ai/flows/code-explanation.ts
'use server';
/**
 * @fileOverview A code explanation AI agent.
 *
 * - codeExplanation - A function that handles the code explanation process.
 * - CodeExplanationInput - The input type for the codeExplanation function.
 * - CodeExplanationOutput - The return type for the codeExplanation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CodeExplanationInputSchema = z.object({
  code: z.string().describe('The code snippet to be explained.'),
  language: z.string().describe('The programming language of the code snippet.'),
});
export type CodeExplanationInput = z.infer<typeof CodeExplanationInputSchema>;

const CodeExplanationOutputSchema = z.object({
  explanation: z.string().describe('The explanation of the code snippet.'),
});
export type CodeExplanationOutput = z.infer<typeof CodeExplanationOutputSchema>;

export async function codeExplanation(input: CodeExplanationInput): Promise<CodeExplanationOutput> {
  return codeExplanationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'codeExplanationPrompt',
  input: {schema: CodeExplanationInputSchema},
  output: {schema: CodeExplanationOutputSchema},
  prompt: `You are an expert software developer specializing in explaining code simply and concisely.

You will use this information to explain the code in a way that is easy to understand for developers of all skill levels.

Language: {{{language}}}
Code: {{{code}}}`,
});

const codeExplanationFlow = ai.defineFlow(
  {
    name: 'codeExplanationFlow',
    inputSchema: CodeExplanationInputSchema,
    outputSchema: CodeExplanationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
