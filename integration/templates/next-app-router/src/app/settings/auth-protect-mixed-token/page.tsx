import { auth } from '@clerk/nextjs/server';

// Regression guard: `{ permission, token }` passed as a single object used to
// silently discard the permission check because `token` triggered the
// options-only fast path. The permission must now be enforced.
export default async function Page() {
  await auth.protect({ permission: 'org:sys_profile:delete', token: 'session_token' });
  return <p>User has access</p>;
}
