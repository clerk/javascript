/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import { organizationDomainsCreate } from '../../funcs/organizationDomainsCreate.js';
import * as operations from '../../models/operations/index.js';
import { formatResult, ToolDefinition } from '../tools.js';

const args = {
  request: operations.CreateOrganizationDomainRequest$inboundSchema,
};

export const tool$organizationDomainsCreate: ToolDefinition<typeof args> = {
  name: 'organization-domains-create',
  description: `Create a new organization domain.

Creates a new organization domain. By default the domain is verified, but can be optionally set to unverified.`,
  args,
  tool: async (client, args, ctx) => {
    const [result, apiCall] = await organizationDomainsCreate(client, args.request, {
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
