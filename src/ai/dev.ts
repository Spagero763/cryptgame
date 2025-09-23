/**
 * @fileOverview Genkit development server entry point.
 * This file is used to start the Genkit development server with the defined flows.
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// This is a development-only file and is not used in production.
// It allows you to run the Genkit development UI to inspect and test flows.
import './route';

genkit({
  plugins: [googleAI()],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
