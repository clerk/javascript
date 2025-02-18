import type { ClerkClient } from '@clerk/backend';
import type { ZodObject } from 'zod';

import type { ToolkitContext } from './types';

export interface ClerkTool {
  /**
   * The name of the tool. This can be used to reference the tool in the code.
   * A descriptive LLM-readable string.
   */
  name: string;
  /**
   * A descriptive prompt explaining the tool's purpose, usage and input parameters.
   * Ths is intended to be used by the underlying LLM.
   * To avoid duplication, the description can reference the parameters by using the `$parameters` prefix.
   */
  description: string;
  /**
   * The Zod schema for the input parameters of the tool
   */
  parameters: ZodObject<any>;
  /**
   * The actual implementation of the tool.
   */
  bindRunnable: (clerkClient: ClerkClient, context: ToolkitContext) => (input: any) => Promise<unknown>;
}

const trimLines = (text: string) =>
  text
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .join('\n');

export const ClerkTool = (params: ClerkTool): ClerkTool => {
  const schemaEntries = Object.entries(params.parameters.shape);
  const args =
    schemaEntries.length === 0
      ? 'Takes no arguments'
      : Object.entries(params.parameters.shape)
          .map(([key, value]) => {
            return `- ${key}: ${(value as any).description || ''}`;
          })
          .join('\n');

  const description = trimLines(`
  Tool name:
  ${params.name}
  Description:
  ${params.description}.
  Arguments:
  ${args}
  `);
  return { ...params, description };
};
