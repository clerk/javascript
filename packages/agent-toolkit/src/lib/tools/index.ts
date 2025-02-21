import { users } from './user-tools';

export const tools = {
  /**
   * Tools for interacting with users.
   * This is a wrapper around the `clerkClient.users` API.
   * For more information, see the [Clerk API documentation](https://clerk.com/docs/reference/backend-api/tag/Users).
   */
  users,
} as const;

// Just to help with types later on
export const flatTools = {
  ...users,
};
