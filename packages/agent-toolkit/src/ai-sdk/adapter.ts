import type { Tool } from 'ai';
import { tool } from 'ai';

import type { SdkAdapter } from '../lib/types';

/**
 * Converts a `ClerkTool` to an AI SDK `Tool`.
 */
export const adapter: SdkAdapter<Tool> = (clerkClient, context, clerkTool) => {
  return tool({
    description: clerkTool.description,
    parameters: clerkTool.parameters,
    execute: clerkTool.bindRunnable(clerkClient, context),
  });
};
