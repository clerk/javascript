import { clerkClient as _clerkClient } from '../lib/clerk-client';
import { defaultToolkitContext } from '../lib/constants';
import { injectSessionClaims } from '../lib/inject-session-claims';
import { flatTools, tools } from '../lib/tools';
import type { ClerkToolkitBase, CreateClerkToolkitParams } from '../lib/types';
import { shallowTransform } from '../lib/utils';
import { adapter } from './adapter';

type AdaptedTools = {
  [key in keyof typeof tools]: () => { [tool in keyof (typeof tools)[key]]: ReturnType<typeof adapter> };
};

export type ClerkToolkit = ClerkToolkitBase & {
  /**
   * Returns an object with all the tools from all categories in the Clerk toolkit.
   *
   * Most LLM providers recommend that for each LLM call, the number of available tools should be kept to a minimum,
   * usually around 10-20 tools. This increases the LLM's accuracy when picking the right tool.
   *
   * As a result, we also recommend to use the fine-grained tool categories, for example, `toolkit.users` instead.
   */
  allTools: () => { [key in keyof typeof flatTools]: ReturnType<typeof adapter> };
} & AdaptedTools;

/**
 * Creates a Clerk toolkit with the given parameters.
 * The toolkit is a collection of tools that can be used to augment the AI's capabilities,
 * For more details, refer to the [package's docs](https://github.com/clerk/javascript/blob/main/packages/agent-toolkit/README.md).
 */
export const createClerkToolkit = async (params: CreateClerkToolkitParams = {}): Promise<ClerkToolkit> => {
  const clerkClient = params.clerkClient || _clerkClient;
  const context = params.context || defaultToolkitContext;

  const adaptedTools = shallowTransform(tools, toolSection => {
    return () =>
      shallowTransform(toolSection, t => {
        return adapter(clerkClient, context, t);
      });
  }) as AdaptedTools;

  const allTools = () => {
    return shallowTransform(flatTools, t => adapter(clerkClient, context, t));
  };

  adaptedTools.organizations();

  return Promise.resolve({
    ...adaptedTools,
    allTools,
    injectSessionClaims: injectSessionClaims(context),
  });
};
