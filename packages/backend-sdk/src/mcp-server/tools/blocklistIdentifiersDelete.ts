/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import { blocklistIdentifiersDelete } from '../../funcs/blocklistIdentifiersDelete.js';
import * as operations from '../../models/operations/index.js';
import { formatResult, ToolDefinition } from '../tools.js';

const args = {
  request: operations.DeleteBlocklistIdentifierRequest$inboundSchema,
};

export const tool$blocklistIdentifiersDelete: ToolDefinition<typeof args> = {
  name: 'blocklist-identifiers-delete',
  description: `Delete identifier from block-list

Delete an identifier from the instance block-list`,
  args,
  tool: async (client, args, ctx) => {
    const [result, apiCall] = await blocklistIdentifiersDelete(client, args.request, {
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
