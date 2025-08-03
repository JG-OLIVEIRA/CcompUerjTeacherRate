
'use server';
/**
 * @fileoverview This file initializes the Genkit AI framework and plugins.
 *
 * It sets up the Google AI plugin for use with Gemini models and configures
 * a global error handler for all Genkit flows.
 */

import { genkit, GenkitError } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Initialize Genkit with the Google AI plugin.
// This makes the Gemini models available for use in flows.
export const ai = genkit({
  plugins: [
    googleAI(),
  ],
  // This callback is triggered when a flow fails.
  // It is used to add custom error handling.
  flowErrorCallback: (err: GenkitError) => {
    switch (err.code) {
      case 'aborted':
      case 'cancelled':
        // These are expected errors when a user cancels a flow.
        // We don't need to log them as errors.
        break;
      default:
        // Log all other errors to the console.
        console.error(err);
    }
  },
});
