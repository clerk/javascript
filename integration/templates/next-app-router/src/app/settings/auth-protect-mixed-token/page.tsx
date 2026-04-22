import { auth } from '@clerk/nextjs/server';

// Regression guard: `{ permission, token }` passed as a single object used to
// silently discard the permission check because `token` triggered the
// options-only fast path. The permission must now be enforced.
const opts = { permission: 'org:posts:manage', token: 'session_token' } as any;

export default async function Page() {
  await auth.protect(opts);
  return <p>User has access</p>;
}
