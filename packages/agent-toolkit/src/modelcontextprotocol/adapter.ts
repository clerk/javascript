import type { ClerkClient } from '@clerk/backend';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import type { ClerkTool } from '../lib/clerk-tool';
import type { ToolkitParams } from '../lib/types';

export class ClerkMcpServer extends McpServer {
  constructor(clerkClient: ClerkClient, params: ToolkitParams, tools: ClerkTool[]) {
    super({ name: 'Clerk', version: PACKAGE_VERSION });

    tools.forEach(tool => {
      this.tool(tool.name, tool.description, tool.parameters.shape, async (arg: unknown) => {
        const res = await tool.bindExecute(clerkClient, params)(arg);
        return { content: [{ type: 'text' as const, text: JSON.stringify(res) }] };
      });
    });
  }
}
