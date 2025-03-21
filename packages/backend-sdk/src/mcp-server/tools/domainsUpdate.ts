/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import { domainsUpdate } from '../../funcs/domainsUpdate.js';
import * as operations from '../../models/operations/index.js';
import { formatResult, ToolDefinition } from '../tools.js';

const args = {
  request: operations.UpdateDomainRequest$inboundSchema,
};

export const tool$domainsUpdate: ToolDefinition<typeof args> = {
  name: 'domains-update',
  description: `Update a domain

The \`proxy_url\` can be updated only for production instances.
Update one of the instance's domains. Both primary and satellite domains can be updated.
If you choose to use Clerk via proxy, use this endpoint to specify the \`proxy_url\`.
Whenever you decide you'd rather switch to DNS setup for Clerk, simply set \`proxy_url\`
to \`null\` for the domain. When you update a production instance's primary domain name,
you have to make sure that you've completed all the necessary setup steps for DNS and
emails to work. Expect downtime otherwise. Updating a primary domain's name will also
update the instance's home origin, affecting the default application paths.`,
  args,
  tool: async (client, args, ctx) => {
    const [result, apiCall] = await domainsUpdate(client, args.request, {
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
