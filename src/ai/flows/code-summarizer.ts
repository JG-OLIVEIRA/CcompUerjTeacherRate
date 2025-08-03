// src/ai/flows/code-summarizer.ts
'use server';

/**
 * @fileOverview A code summarization AI agent.
 *
 * - summarizeCode - A function that handles the code summarization process.
 * - SummarizeCodeInput - The input type for the summarizeCode function.
 * - SummarizeCodeOutput - The return type for the summarizeCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeCodeInputSchema = z.object({
  code: z.string().describe('The code to be summarized.'),
  language: z.string().describe('The programming language of the code.'),
});
export type SummarizeCodeInput = z.infer<typeof SummarizeCodeInputSchema>;

const SummarizeCodeOutputSchema = z.object({
  summary: z.string().describe('A summary of the code, highlighting key functionalities and potential issues.'),
});
export type SummarizeCodeOutput = z.infer<typeof SummarizeCodeOutputSchema>;

export async function summarizeCode(input: SummarizeCodeInput): Promise<SummarizeCodeOutput> {
  return summarizeCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeCodePrompt',
  input: {schema: SummarizeCodeInputSchema},
  output: {schema: SummarizeCodeOutputSchema},
  prompt: `You are an expert software developer. You will be provided with code and your task is to summarize the code, highlighting key functionalities and potential issues.

  Language: {{{language}}}
  Code: {{{code}}}`,
});

const summarizeCodeFlow = ai.defineFlow(
  {
    name: 'summarizeCodeFlow',
    inputSchema: SummarizeCodeInputSchema,
    outputSchema: SummarizeCodeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
