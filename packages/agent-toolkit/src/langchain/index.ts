import { clerkClient as _clerkClient } from '../lib/clerk-client';
import { defaultToolkitContext } from '../lib/constants';
import { injectSessionClaims } from '../lib/inject-session-claims';
import { flatTools, tools } from '../lib/tools';
import type { ClerkToolkitBase, CreateClerkToolkitParams } from '../lib/types';
import { shallowTransform } from '../lib/utils';
import { adapter } from './adapter';

export type ClerkToolkit = ClerkToolkitBase & {
  /**
   * Returns an array containing all tools from all categories in the Clerk toolkit.
   *
   * Most LLM providers recommend that for each LLM call, the number of available tools should be kept to a minimum,
   * usually around 10-20 tools. This increases the LLM's accuracy when picking the right tool.
   *
   * As a result, we also recommend to use the fine-grained tool categories, for example, `toolkit.users` instead.
   */
  allTools: () => Array<ReturnType<typeof adapter>>;
  /**
   * Returns an object with all the tools from all categories in the Clerk toolkit.
   * Useful when using tool calling with Langchain messages (e.g. `tool_calls`).
   */
  toolMap: () => { [key in keyof typeof flatTools]: ReturnType<typeof adapter> };
} & {
  [key in keyof typeof tools]: () => Array<ReturnType<typeof adapter>>;
};

export const createClerkToolkit = async (params: CreateClerkToolkitParams = {}): Promise<ClerkToolkit> => {
  const clerkClient = params.clerkClient || _clerkClient;
  const context = params.context || defaultToolkitContext;

  const adaptedTools = shallowTransform(tools, toolSection => {
    return () => Object.values(toolSection).map(t => adapter(clerkClient, context, t));
  });

  const allTools = () => {
    return Object.values(flatTools).map(t => adapter(clerkClient, context, t));
  };

  const toolMap = shallowTransform(flatTools, t => adapter(clerkClient, context, t));

  return {
    ...adaptedTools,
    allTools,
    toolMap: () => toolMap,
    injectSessionClaims: injectSessionClaims(context),
  };
};
