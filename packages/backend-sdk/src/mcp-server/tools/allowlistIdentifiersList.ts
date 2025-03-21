/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import { allowlistIdentifiersList } from '../../funcs/allowlistIdentifiersList.js';
import * as operations from '../../models/operations/index.js';
import { formatResult, ToolDefinition } from '../tools.js';

const args = {
  request: operations.ListAllowlistIdentifiersRequest$inboundSchema,
};

export const tool$allowlistIdentifiersList: ToolDefinition<typeof args> = {
  name: 'allowlist-identifiers-list',
  description: `List all identifiers on the allow-list

Get a list of all identifiers allowed to sign up to an instance`,
  args,
  tool: async (client, args, ctx) => {
    const [result, apiCall] = await allowlistIdentifiersList(client, args.request, {
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
