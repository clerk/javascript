import type { StructuredTool } from '@langchain/core/tools';
import { tool } from '@langchain/core/tools';

import type { SdkAdapter } from '../lib/types';

/**
 * Converts a `ClerkTool` to a LangChain `StructuredTool`.
 * For more details, take a look at the LangChain docs https://js.langchain.com/docs/how_to/custom_tools
 */
export const adapter: SdkAdapter<StructuredTool> = (clerkClient, context, clerkTool) => {
  const executeFn = clerkTool.bindExecute(clerkClient, context as any) as any;
  const toolConfig = {
    name: clerkTool.name,
    description: clerkTool.description,
    schema: clerkTool.parameters,
  } as any;
  return tool(executeFn, toolConfig) as StructuredTool;
};
