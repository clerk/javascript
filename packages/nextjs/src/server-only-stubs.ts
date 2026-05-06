/**
 * Runtime stubs for server-only exports that are accidentally imported from the
 * main `@clerk/nextjs` entry point. Each stub is a Proxy that throws a
 * descriptive error pointing the developer to the correct import path.
 */

export const auth: never = new Proxy((() => {}) as never, {
  apply() {
    throw new Error(
      `Clerk: auth() was imported from '@clerk/nextjs'. The auth() helper is a server-side function and must be imported from '@clerk/nextjs/server'.\n\nTo fix this, update your import:\n  import { auth } from '@clerk/nextjs/server'`,
    );
  },
  get() {
    throw new Error(
      `Clerk: auth was imported from '@clerk/nextjs'. The auth() helper is a server-side function and must be imported from '@clerk/nextjs/server'.\n\nTo fix this, update your import:\n  import { auth } from '@clerk/nextjs/server'`,
    );
  },
});
