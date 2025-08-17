
/**
 * @fileoverview This file initializes the Genkit AI framework and plugins.
 *
 * It sets up the Google AI plugin for use with Gemini models and configures
 * a global error handler for all Genkit flows.
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Initialize Genkit with the Google AI plugin.
// This makes the Gemini models available for use in flows.
export const ai = genkit({
  plugins: [
    googleAI(),
  ],
});
