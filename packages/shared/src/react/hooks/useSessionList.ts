import type { UseSessionListReturn } from '@clerk/types';

import { useAssertWrappedByClerkProvider, useClerkInstanceContext, useClientContext } from '../contexts';

/**
 * The `useSessionList()` hook returns an array of [`Session`](https://clerk.com/docs/references/javascript/session) objects that have been registered on the client device.
 *
 * @example
 * ### Get a list of sessions
 *
 * The following example uses `useSessionList()` to get a list of sessions that have been registered on the client device. The `sessions` property is used to show the number of times the user has visited the page.
 *
 * <Tabs items='React,Next.js'>
 * <Tab>
 *
 * ```tsx {{ filename: 'src/Home.tsx' }}
 * import { useSessionList } from '@clerk/clerk-react'
 *
 * export default function Home() {
 *   const { isLoaded, sessions } = useSessionList()
 *
 *   if (!isLoaded) {
 *     // Handle loading state
 *     return null
 *   }
 *
 *   return (
 *     <div>
 *       <p>Welcome back. You've been here {sessions.length} times before.</p>
 *     </div>
 *   )
 * }
 * ```
 *
 * </Tab>
 * <Tab>
 *
 * {@include ../../../examples/use-session-list.md#nextjs-01}
 *
 * </Tab>
 * </Tabs>
 */
export const useSessionList = (): UseSessionListReturn => {
  useAssertWrappedByClerkProvider('useSessionList');

  const isomorphicClerk = useClerkInstanceContext();
  const client = useClientContext();

  if (!client) {
    return { isLoaded: false, sessions: undefined, setActive: undefined };
  }

  return {
    isLoaded: true,
    sessions: client.sessions,
    setActive: isomorphicClerk.setActive,
  };
};
