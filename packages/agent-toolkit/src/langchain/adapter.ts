import type { StructuredTool } from '@langchain/core/tools';
import { tool } from '@langchain/core/tools';

import type { SdkAdapter } from '../lib/types';

// https://js.langchain.com/docs/how_to/custom_tools
export const adapter: SdkAdapter<StructuredTool> = (clerkClient, context, clerkTool) => {
  return tool(clerkTool.bindRunnable(clerkClient, context), {
    name: clerkTool.name,
    description: clerkTool.description,
    schema: clerkTool.parameters,
  });
};
