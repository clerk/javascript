/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import { usersLock } from '../../funcs/usersLock.js';
import * as operations from '../../models/operations/index.js';
import { formatResult, ToolDefinition } from '../tools.js';

const args = {
  request: operations.LockUserRequest$inboundSchema,
};

export const tool$usersLock: ToolDefinition<typeof args> = {
  name: 'users-lock',
  description: `Lock a user

Marks the given user as locked, which means they are not allowed to sign in again until the lock expires.
Lock duration can be configured in the instance's restrictions settings.`,
  args,
  tool: async (client, args, ctx) => {
    const [result, apiCall] = await usersLock(client, args.request, {
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
