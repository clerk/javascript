import type { LoadedClerk } from '@clerk/types';

import { useAssertWrappedByClerkProvider, useClerkInstanceContext } from '../contexts';

/**
 * The `useClerk()` hook provides access to the [`Clerk`](https://clerk.com/docs/references/javascript/clerk/clerk) object, allowing you to build alternatives to any Clerk Component.
 *
 * @warning
 * This composable should only be used for advanced use cases, such as building a completely custom OAuth flow or as an escape hatch to access to the `Clerk` object.
 *
 * @returns The `Clerk` object, which includes all the methods and properties listed in the [`Clerk` reference](https://clerk.com/docs/references/javascript/clerk/clerk).
 *
 * @example
 *
 * The following example uses the `useClerk()` hook to access the `clerk` object. The `clerk` object is used to call the [`openSignIn()`](https://clerk.com/docs/references/javascript/clerk/clerk#sign-in) method to open the sign-in modal.
 *
 * ```tsx {{ filename: 'src/Home.tsx' }}
 * import { useClerk } from '@clerk/clerk-react'
 *
 * export default function Home() {
 *   const clerk = useClerk()
 *
 *   return <button onClick={() => clerk.openSignIn({})}>Sign in</button>
 * }
 * ```
 */
export const useClerk = (): LoadedClerk => {
  useAssertWrappedByClerkProvider('useClerk');
  return useClerkInstanceContext();
};
