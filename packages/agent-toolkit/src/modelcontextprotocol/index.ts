import type { ClerkTool } from '../lib/clerk-tool';
import { defaultCreateClerkToolkitParams } from '../lib/constants';
import { flatTools } from '../lib/tools';
import type { CreateClerkToolkitParams } from '../lib/types';
import { ClerkMcpServer } from './adapter';

type CreateClerkMcpServerParams = CreateClerkToolkitParams & {
  /**
   * Array of Clerk tools to enable in the server.
   */
  tools?: ClerkTool[];
};

/**
 * Creates a Clerk MCP Server with the given parameters.
 * For more details, refer to the [package's docs](https://github.com/clerk/javascript/blob/main/packages/agent-toolkit/README.md).
 */
export const createClerkMcpServer = async (params: CreateClerkMcpServerParams = {}): Promise<ClerkMcpServer> => {
  const { clerkClient, tools, ...rest } = { ...defaultCreateClerkToolkitParams, ...params };
  return Promise.resolve(new ClerkMcpServer(clerkClient, rest, tools || Object.values(flatTools)));
};
