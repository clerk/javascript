/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import { sessionsList } from '../../funcs/sessionsList.js';
import * as operations from '../../models/operations/index.js';
import { formatResult, ToolDefinition } from '../tools.js';

const args = {
  request: operations.GetSessionListRequest$inboundSchema,
};

export const tool$sessionsList: ToolDefinition<typeof args> = {
  name: 'sessions-list',
  description: `List all sessions

Returns a list of all sessions.
The sessions are returned sorted by creation date, with the newest sessions appearing first.
**Deprecation Notice (2024-01-01):** All parameters were initially considered optional, however
moving forward at least one of \`client_id\` or \`user_id\` parameters should be provided.`,
  args,
  tool: async (client, args, ctx) => {
    const [result, apiCall] = await sessionsList(client, args.request, {
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
