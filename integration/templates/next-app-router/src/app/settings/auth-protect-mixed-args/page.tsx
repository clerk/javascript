import { auth } from '@clerk/nextjs/server';

// Regression guard for the "mixed auth params + options in a single argument"
// bypass. When callers assign the argument to a variable (which defeats TS's
// excess-property check), the role check must still run.
const opts = { role: 'org:admin', unauthorizedUrl: '/settings/denied' } as const;

export default async function Page() {
  await auth.protect(opts);
  return <p>User has access</p>;
}
