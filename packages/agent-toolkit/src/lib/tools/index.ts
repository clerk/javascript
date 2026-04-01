import { invitations } from './invitations';
import { organizations } from './organizations';
import { users } from './users';

export const tools = {
  /**
   * Tools for interacting with users.
   * This is a wrapper around the `clerkClient.users` API.
   * For more information, see the [Clerk API documentation](https://clerk.com/docs/reference/backend-api/tag/Users).
   */
  users,

  /**
   * Tools for interacting with Organizations.
   * This is a wrapper around the `clerkClient.organizations` API.
   * For more information, see the [Clerk API documentation](https://clerk.com/docs/reference/backend-api/tag/Organizations).
   */
  organizations,

  /**
   * Tools for interacting with invitations.
   * This is a wrapper around the `clerkClient.invitations` API.
   * For more information, see the [Clerk API documentation](https://clerk.com/docs/reference/backend-api/tag/Invitations).
   */
  invitations,
} as const;

// Just to help with types later on
export const flatTools = {
  ...users,
  ...organizations,
  ...invitations,
} as const;
