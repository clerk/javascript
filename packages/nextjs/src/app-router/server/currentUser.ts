import type { User } from '@clerk/backend';

import { clerkClient } from '../../server/clerkClient';
import { auth } from './auth';

/**
 * The `currentUser` helper returns the [Backend User](https://clerk.com/docs/references/backend/types/backend-user) object of the currently active user. It can be used in Server Components, Route Handlers, and Server Actions.
 *
 * Under the hood, this helper:
 * - calls `fetch()`, so it is automatically deduped per request.
 * - uses the [`GET /v1/users/{user_id}`](https://clerk.com/docs/reference/backend-api/tag/Users#operation/GetUser) endpoint.
 * - counts towards the [Backend API request rate limit](https://clerk.com/docs/backend-requests/resources/rate-limits#rate-limits).
 *
 * @example
 * ```tsx {{ filename: 'app/page.tsx' }}
 * import { currentUser } from '@clerk/nextjs/server'
 *
 * export default async function Page() {
 *  const user = await currentUser()
 *
 *  if (!user) return <div>Not signed in</div>
 *
 *  return <div>Hello {user?.firstName}</div>
 * }
 * ```
 */
export async function currentUser(): Promise<User | null> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('server-only');

  const { userId } = await auth();
  if (!userId) {
    return null;
  }

  return (await clerkClient()).users.getUser(userId);
}
