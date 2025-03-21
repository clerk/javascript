/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import { usersDisableMfa } from '../../funcs/usersDisableMfa.js';
import * as operations from '../../models/operations/index.js';
import { formatResult, ToolDefinition } from '../tools.js';

const args = {
  request: operations.DisableMFARequest$inboundSchema,
};

export const tool$usersDisableMfa: ToolDefinition<typeof args> = {
  name: 'users-disable-mfa',
  description: `Disable a user's MFA methods

Disable all of a user's MFA methods (e.g. OTP sent via SMS, TOTP on their authenticator app) at once.`,
  args,
  tool: async (client, args, ctx) => {
    const [result, apiCall] = await usersDisableMfa(client, args.request, {
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
