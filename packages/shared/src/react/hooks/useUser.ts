import { eventMethodCalled } from '../../telemetry/events/method-called';
import type { UseUserReturn } from '../../types';
import { useAssertWrappedByClerkProvider, useClerkInstanceContext, useUserContext } from '../contexts';

const hookName = 'useUser';
/**
 * The `useUser()` hook provides access to the current user's [`User`](https://clerk.com/docs/reference/javascript/user) object, which contains all the data for a single user in your application and provides methods to manage their account. This hook also allows you to check if the user is signed in and if Clerk has loaded and initialized.
 *
 * @unionReturnHeadings
 * ["Initialization", "Signed out", "Signed in"]
 *
 * @example
 * ### Get the current user
 *
 * The following example uses the `useUser()` hook to access the [`User`](https://clerk.com/docs/reference/javascript/user) object, which contains the current user's data such as their full name. The `isLoaded` and `isSignedIn` properties are used to handle the loading state and to check if the user is signed in, respectively.
 *
 * ```tsx {{ filename: 'src/Example.tsx' }}
 * import { useUser } from '@clerk/react'
 *
 * export default function Example() {
 *   const { isSignedIn, user, isLoaded } = useUser()
 *
 *   if (!isLoaded) {
 *     return <div>Loading...</div>
 *   }
 *
 *   if (!isSignedIn) {
 *     return <div>Sign in to view this page</div>
 *   }
 *
 *   return <div>Hello {user.firstName}!</div>
 * }
 * ```
 *
 * @example
 * ### Update user data
 *
 * The following example uses the `useUser()` hook to access the [`User`](https://clerk.com/docs/reference/javascript/user) object, which calls the [`update()`](https://clerk.com/docs/reference/javascript/user#update) method to update the current user's information.
 *
 * <Tabs items='React,Next.js'>
 * <Tab>
 *
 * ```tsx {{ filename: 'src/Home.tsx' }}
 * import { useUser } from '@clerk/react'
 *
 * export default function Home() {
 *   const { isSignedIn, isLoaded, user } = useUser()
 *
 *   if (!isLoaded) {
 *     // Handle loading state
 *     return null
 *   }
 *
 *   if (!isSignedIn) return null
 *
 *   const updateUser = async () => {
 *     await user.update({
 *       firstName: 'John',
 *       lastName: 'Doe',
 *     })
 *   }
 *
 *   return (
 *     <>
 *       <button onClick={updateUser}>Update your name</button>
 *       <p>user.firstName: {user.firstName}</p>
 *       <p>user.lastName: {user.lastName}</p>
 *     </>
 *   )
 * }
 * ```
 * </Tab>
 * <Tab>
 *
 * {@include ../../../docs/use-user.md#nextjs-01}
 *
 * </Tab>
 * </Tabs>
 *
 * @example
 * ### Reload user data
 *
 * The following example uses the `useUser()` hook to access the [`User`](https://clerk.com/docs/reference/javascript/user) object, which calls the [`reload()`](https://clerk.com/docs/reference/javascript/user#reload) method to get the latest user's information.
 *
 * <Tabs items='React,Next.js'>
 * <Tab>
 *
 * ```tsx {{ filename: 'src/Home.tsx' }}
 * import { useUser } from '@clerk/react'
 *
 * export default function Home() {
 *   const { isSignedIn, isLoaded, user } = useUser();
 *
 *   if (!isLoaded) {
 *     // Handle loading state
 *     return null;
 *   }
 *
 *   if (!isSignedIn) return null;
 *
 *   const updateUser = async () => {
 *     // Update data via an API endpoint
 *     const updateMetadata = await fetch('/api/updateMetadata', {
 *       method: 'POST',
 *       body: JSON.stringify({
 *         role: 'admin'
 *       })
 *     });
 *
 *     // Check if the update was successful
 *     if ((await updateMetadata.json()).message !== 'success') {
 *       throw new Error('Error updating');
 *     }
 *
 *     // If the update was successful, reload the user data
 *     await user.reload();
 *   };
 *
 *   return (
 *     <>
 *       <button onClick={updateUser}>Update your metadata</button>
 *       <p>user role: {user.publicMetadata.role}</p>
 *     </>
 *   );
 * }
 * ```
 *
 * </Tab>
 * <Tab>
 *
 * {@include ../../../docs/use-user.md#nextjs-02}
 *
 * </Tab>
 * </Tabs>
 */
export function useUser(): UseUserReturn {
  useAssertWrappedByClerkProvider(hookName);

  const user = useUserContext();
  const clerk = useClerkInstanceContext();

  clerk.telemetry?.record(eventMethodCalled(hookName));

  if (user === undefined) {
    return { isLoaded: false, isSignedIn: undefined, user: undefined };
  }

  if (user === null) {
    return { isLoaded: true, isSignedIn: false, user: null };
  }

  return { isLoaded: true, isSignedIn: true, user };
}
