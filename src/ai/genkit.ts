
// src/ai/genkit.ts
import { genkit, type GenkitError } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Configure Genkit with the Google AI plugin
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
        // These error codes are not considered to be unexpected.
        return;
      default:
        // Log all other errors to the console.
        console.error(`Encountered an error: [${err.code}] ${err.message}`);
        console.error(err.stack);
    }
  },
});
