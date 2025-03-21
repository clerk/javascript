/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import { redirectUrlsList } from '../../funcs/redirectUrlsList.js';
import * as operations from '../../models/operations/index.js';
import { formatResult, ToolDefinition } from '../tools.js';

const args = {
  request: operations.ListRedirectURLsRequest$inboundSchema,
};

export const tool$redirectUrlsList: ToolDefinition<typeof args> = {
  name: 'redirect-urls-list',
  description: `List all redirect URLs

Lists all whitelisted redirect_urls for the instance`,
  args,
  tool: async (client, args, ctx) => {
    const [result, apiCall] = await redirectUrlsList(client, args.request, {
      fetchOptions: { signal: ctx.signal },
    }).$inspect();

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
