/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import { signUpsGet } from '../../funcs/signUpsGet.js';
import * as operations from '../../models/operations/index.js';
import { formatResult, ToolDefinition } from '../tools.js';

const args = {
  request: operations.GetSignUpRequest$inboundSchema,
};

export const tool$signUpsGet: ToolDefinition<typeof args> = {
  name: 'sign-ups-get',
  description: `Retrieve a sign-up by ID

Retrieve the details of the sign-up with the given ID`,
  args,
  tool: async (client, args, ctx) => {
    const [result, apiCall] = await signUpsGet(client, args.request, {
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
