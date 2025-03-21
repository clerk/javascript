/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import { sessionsGet } from '../../funcs/sessionsGet.js';
import * as operations from '../../models/operations/index.js';
import { formatResult, ToolDefinition } from '../tools.js';

const args = {
  request: operations.GetSessionRequest$inboundSchema,
};

export const tool$sessionsGet: ToolDefinition<typeof args> = {
  name: 'sessions-get',
  description: `Retrieve a session

Retrieve the details of a session`,
  args,
  tool: async (client, args, ctx) => {
    const [result, apiCall] = await sessionsGet(client, args.request, {
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
