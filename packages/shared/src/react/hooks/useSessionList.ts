import { eventMethodCalled } from '../../telemetry/events/method-called';
import type { UseSessionListReturn } from '../../types';
import { useAssertWrappedByClerkProvider, useClerkInstanceContext } from '../contexts';
import { useClientBase } from './base/useClientBase';

const hookName = 'useSessionList';
/**
 * The `useSessionList()` hook returns an array of [`Session`](https://clerk.com/docs/reference/javascript/session) objects that have been registered on the client device.
 *
 * @unionReturnHeadings
 * ["Initialization", "Loaded"]
 *
 * @function
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
 * import { useSessionList } from '@clerk/react'
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
 * {@include ../../../docs/use-session-list.md#nextjs-01}
 *
 * </Tab>
 * </Tabs>
 */
export const useSessionList = (): UseSessionListReturn => {
  useAssertWrappedByClerkProvider(hookName);

  const isomorphicClerk = useClerkInstanceContext();
  const client = useClientBase();
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
