import { z } from 'zod';

import { ClerkTool } from '../clerk-tool';
import { prunePrivateData } from '../utils';

const getUserId = ClerkTool({
  name: 'getUserId',
  description: `
    Get the userId of the current authenticated user if signed in, otherwise return null.
    Use this tool when you need to identify the current user but don't need their profile details.
    This tool takes no parameters and is the quickest way to check if a user is authenticated.
    Example use case: When you need to verify if a user is logged in before performing user-specific operations.
  `,
  parameters: z.object({}),
  bindRunnable: (clerkClient, context) => () => {
    return Promise.resolve(context.userId || null);
  },
});

const getUser = ClerkTool({
  name: 'getUser',
  description: `
    Retrieves detailed information about a user by their userId, including email addresses,
    username, profile image, created/updated timestamps, and public metadata.
    Use this tool when you need comprehensive user information beyond just their ID.
    If the userId parameter is not provided, it will use the current authenticated user's ID.
    Example use case: When you need to display user profile information or check user attributes.
  `,
  parameters: z.object({
    userId: z.string().describe('(string): The userId of the User to retrieve.'),
  }),
  bindRunnable: (clerkClient, context) => async params => {
    const res = await clerkClient.users.getUser(context.userId || params.userId);
    return prunePrivateData(context, res.raw);
  },
});

const getUserCount = ClerkTool({
  name: 'getUserCount',
  description: `
    Retrieves the total count of users in your Clerk instance.
    Use this tool when you need to know the total number of users in the system.
    This tool takes no parameters and is an efficient way to get just the count without retrieving user details.
  `,
  parameters: z.object({}),
  bindRunnable: (clerkClient, _) => async () => {
    return await clerkClient.users.getCount();
  },
});

const updateUserPublicMetadata = ClerkTool({
  name: 'updateUserPublicMetadata',
  description: `
    Updates the public metadata associated with a user by merging existing values with the provided parameters.
    Use this tool when you need to store or update user preferences, settings, or other non-sensitive information.

    Important characteristics:
    1. A "deep" merge is performed - any nested JSON objects will be merged recursively.
    2. You can remove metadata keys at any level by setting their value to null.
    3. Public metadata is visible to the frontend and should NOT contain sensitive information.

    Example use case: Storing user preferences, feature flags, or application-specific data that persists across sessions.
  `,
  parameters: z.object({
    userId: z.string().describe('(string): The userId of the User to update.'),
    metadata: z
      .record(z.string(), z.any())
      .describe('(Record<string,any>): The public metadata to set or update. Use null values to remove specific keys.'),
  }),
  bindRunnable: (clerkClient, context) => async params => {
    const { userId, metadata } = params;
    const res = await clerkClient.users.updateUserMetadata(context.userId || userId, { publicMetadata: metadata });
    return prunePrivateData(context, res.raw);
  },
});

const updateUserUnsafeMetadata = ClerkTool({
  name: 'updateUserUnsafeMetadata',
  description: `
    Updates the unsafe metadata associated with a user by merging existing values with the provided parameters.
    Use this tool when you need to store data that should be accessible both on the frontend and backend.

    Important characteristics:
    1. A "deep" merge is performed - any nested JSON objects will be merged recursively.
    2. You can remove metadata keys at any level by setting their value to null.
    3. Unsafe metadata is accessible from both frontend and backend code.
    4. Unlike public metadata, unsafe metadata is NOT included in JWT tokens.

    Example use case: Storing user data that should be modifiable from the frontend but not included in authentication tokens.
  `,
  parameters: z.object({
    userId: z.string().describe('(string): The userId of the User to update.'),
    metadata: z
      .record(z.string(), z.any())
      .describe('(Record<string,any>): The unsafe metadata to set or update. Use null values to remove specific keys.'),
  }),
  bindRunnable: (clerkClient, context) => async params => {
    const { userId, metadata } = params;
    const res = await clerkClient.users.updateUserMetadata(context.userId || userId, { unsafeMetadata: metadata });
    return prunePrivateData(context, res.raw);
  },
});

const updateUser = ClerkTool({
  name: 'updateUser',
  description: `
    Updates an existing user's attributes in your Clerk instance.
    Use this tool when you need to modify core user information (NOT metadata).

    Important notes:
    1. If the userId parameter is not provided, it will use the current authenticated user's ID
    2. Only the provided fields will be updated, other fields remain unchanged
    3. For updating metadata, use the specialized metadata update tools instead
    4. Email and phone verification status cannot be changed with this tool

    Example use cases:
    1. Updating a user's name, username, or other profile information
    2. Enabling or disabling a user account
    3. Setting a user's primary contact information
  `,
  parameters: z.object({
    userId: z.string().describe('(string): The userId of the User to update.'),
    firstName: z.string().optional().describe('(string): New first name for the user'),
    lastName: z.string().optional().describe('(string): New last name for the user'),
    username: z.string().optional().describe('(string): New username for the user'),
    profileImageUrl: z.string().optional().describe('(string): URL for the user profile image'),
  }),
  bindRunnable: (clerkClient, context) => async params => {
    const { userId, ...updateParams } = params;
    const res = await clerkClient.users.updateUser(context.userId || userId, updateParams);
    return prunePrivateData(context, res.raw);
  },
});

export const users = {
  getUserId,
  getUser,
  getUserCount,
  updateUser,
  updateUserPublicMetadata,
  updateUserUnsafeMetadata,
} as const satisfies Record<string, ClerkTool>;
