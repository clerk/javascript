/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import { domainsList } from '../../funcs/domainsList.js';
import { formatResult, ToolDefinition } from '../tools.js';

export const tool$domainsList: ToolDefinition = {
  name: 'domains-list',
  description: `List all instance domains

Use this endpoint to get a list of all domains for an instance.
The response will contain the primary domain for the instance and any satellite domains. Each domain in the response contains information about the URLs where Clerk operates and the required CNAME targets.`,
  tool: async (client, ctx) => {
    const [result, apiCall] = await domainsList(client, { fetchOptions: { signal: ctx.signal } }).$inspect();

    if (!result.ok) {
      return {
        content: [{ type: 'text', text: result.error.message }],
        isError: true,
      };
    }

    const value = result.value;

    return formatResult(value, apiCall);
  },
};
