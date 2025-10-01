import type { UseSessionListReturn } from '@clerk/types';

import { eventMethodCalled } from '../../telemetry/events/method-called';
import { useAssertWrappedByClerkProvider, useClerkInstanceContext, useClientContext } from '../contexts';

const hookName = 'useSessionList';
/**
 * The `useSessionList()` hook returns an array of [`Session`](https://clerk.com/docs/reference/javascript/session) objects that have been registered on the client device.
 *
 * ### Get a list of sessions
 *
 * The following example uses `useSessionList()` to get a list of sessions that have been registered on the client device. The `sessions` property is used to show the number of times the user has visited the page.
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
 */
export const useSessionList = (): UseSessionListReturn => {
  useAssertWrappedByClerkProvider(hookName);

  const isomorphicClerk = useClerkInstanceContext();
  const client = useClientContext();
  const clerk = useClerkInstanceContext();

  clerk.telemetry?.record(eventMethodCalled(hookName));

  if (!client) {
    return { isLoaded: false, sessions: undefined, setActive: undefined };
  }

  return {
    isLoaded: true,
    sessions: client.sessions,
    setActive: isomorphicClerk.setActive,
  };
};
