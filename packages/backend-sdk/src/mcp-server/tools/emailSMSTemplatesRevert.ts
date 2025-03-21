/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import { emailSMSTemplatesRevert } from '../../funcs/emailSMSTemplatesRevert.js';
import * as operations from '../../models/operations/index.js';
import { formatResult, ToolDefinition } from '../tools.js';

const args = {
  request: operations.RevertTemplateRequest$inboundSchema,
};

export const tool$emailSMSTemplatesRevert: ToolDefinition<typeof args> = {
  name: 'email-SMS-templates-revert',
  description: `Revert a template

Reverts an updated template to its default state`,
  args,
  tool: async (client, args, ctx) => {
    const [result, apiCall] = await emailSMSTemplatesRevert(client, args.request, {
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
