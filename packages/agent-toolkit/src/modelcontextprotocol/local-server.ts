#!/usr/bin/env node

import { createClerkClient } from '@clerk/backend';
import { getEnvVariable } from '@clerk/shared/getEnvVariable';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { default as yargs } from 'yargs';
import { hideBin } from 'yargs/helpers';

import { tools } from '../lib/tools';
import { filterTools } from '../lib/utils';
import { createClerkMcpServer } from './index';

/**
 * Main entry point for the Clerk MCP server.
 * Runs as a standalone process, as defined in package.json#bin.
 * An entrypoint for this file exists in the tsup configuration of the package.
 */
const main = async () => {
  const {
    tools: patterns,
    apiUrl,
    secretKey,
  } = await yargs(hideBin(process.argv))
    .version(PACKAGE_VERSION)
    .option('tools', {
      alias: 't',
      type: 'string',
      array: true,
      description: `List of tools to enable in the server. Use "*" to enable all tools. Use "category" or "category.*" to enable all tools from a category. Use "category.toolName" to pick a single tool. Available categories: ${Object.keys(tools)}`,
    })
    .option('secret-key', {
      alias: 'sk',
      type: 'string',
      description: `Clerk secret key`,
    })
    .option('api-url', {
      type: 'string',
      description: `Clerk API URL`,
    })
    .parse();

  const SECRET_KEY = secretKey || getEnvVariable('CLERK_SECRET_KEY');
  const API_URL = apiUrl || getEnvVariable('CLERK_API_URL');

  const clerkClient = createClerkClient({
    secretKey: SECRET_KEY,
    apiUrl: API_URL,
    userAgent: `${PACKAGE_NAME}_mcp_server@${PACKAGE_VERSION}`,
  });

  const filteredTools = patterns ? patterns.map(pattern => filterTools(tools, pattern)).flat() : undefined;

  const mcpServer = await createClerkMcpServer({ clerkClient, tools: filteredTools });
  const transport = new StdioServerTransport();
  await mcpServer.connect(transport);
};

main().catch(error => {
  console.error('\nClerk: Error initializing MCP server:\n', error.message);
});
