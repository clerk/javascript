import type { ClerkClient } from '@clerk/backend';
import type { ZodObject } from 'zod';

import type { CreateClerkToolkitParams, ToolsContext } from './types';

export interface ClerkToolParams {
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
  execute: (clerkClient: ClerkClient, params: ToolsContext) => (input: any) => Promise<unknown>;
}

export interface ClerkTool extends Omit<ClerkToolParams, 'execute'> {
  bindExecute: (clerkClient: ClerkClient, params: CreateClerkToolkitParams) => (input: any) => Promise<unknown>;
}

const trimLines = (text: string) =>
  text
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .join('\n');

export const ClerkTool = (_params: ClerkToolParams): ClerkTool => {
  const { execute, ...params } = _params;
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

  return {
    ...params,
    description,
    bindExecute: (clerkClient, params) => {
      const toolContext = { ...params.authContext, allowPrivateMetadata: params.allowPrivateMetadata };
      return execute(clerkClient, toolContext);
    },
  };
};
