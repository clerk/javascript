/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import { organizationInvitationsGetAll } from '../../funcs/organizationInvitationsGetAll.js';
import * as operations from '../../models/operations/index.js';
import { formatResult, ToolDefinition } from '../tools.js';

const args = {
  request: operations.ListInstanceOrganizationInvitationsRequest$inboundSchema,
};

export const tool$organizationInvitationsGetAll: ToolDefinition<typeof args> = {
  name: 'organization-invitations-get-all',
  description: `Get a list of organization invitations for the current instance

This request returns the list of organization invitations for the instance.
Results can be paginated using the optional \`limit\` and \`offset\` query parameters.
You can filter them by providing the 'status' query parameter, that accepts multiple values.
You can change the order by providing the 'order' query parameter, that accepts multiple values.
You can filter by the invited user email address providing the \`query\` query parameter.
The organization invitations are ordered by descending creation date by default.`,
  args,
  tool: async (client, args, ctx) => {
    const [result, apiCall] = await organizationInvitationsGetAll(client, args.request, {
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
