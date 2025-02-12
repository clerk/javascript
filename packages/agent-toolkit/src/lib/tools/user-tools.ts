import { z } from 'zod';

import { ClerkTool } from '../clerk-tool';
import { prunePrivateData } from '../utils';

const getUserId = ClerkTool({
  name: 'getUserId',
  description: `
    Get the userId of the current user if signed in, otherwise return null.
  `,
  parameters: z.object({}),
  bindRunnable: (clerkClient, context) => () => {
    return Promise.resolve(context.userId || null);
  },
});

const getUser = ClerkTool({
  name: 'getUser',
  description: `
    Retrieves information about a single User by their userId, if the userId is valid.
  `,
  parameters: z.object({
    userId: z.string().describe('(string): The userId of the User to retrieve'),
  }),
  bindRunnable: (clerkClient, context) => async params => {
    const res = await clerkClient.users.getUser(context.userId || params.userId);
    return prunePrivateData(context, res.raw);
  },
});

const updateUserPublicMetadata = ClerkTool({
  name: 'updateUserPublicMetadata',
  description: `
    Updates the public metadata associated with the specified user by merging existing values with the provided parameters.
    A "deep" merge will be performed - "deep" means that any nested JSON objects will be merged as well. You can remove metadata keys at any level by setting their value to null.
  `,
  parameters: z.object({
    userId: z.string().describe('(string): The userId of the User to update'),
    metadata: z.record(z.string(), z.any()).describe('(Record<string,any>): The new public metadata to set'),
  }),
  bindRunnable: (clerkClient, context) => async params => {
    const { userId, metadata } = params;
    const res = await clerkClient.users.updateUserMetadata(context.userId || userId, { publicMetadata: metadata });
    return prunePrivateData(context, res.raw);
  },
});

export const users = {
  getUserId,
  getUser,
  updateUserPublicMetadata,
} as const;
