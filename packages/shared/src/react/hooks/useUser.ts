import type { UseUserReturn } from '@clerk/types';

import { useAssertWrappedByClerkProvider, useUserContext } from '../contexts';

/**
 * The `useUser()` hook provides access to the current user's [`User`](https://clerk.com/docs/references/javascript/user/user) object, which contains all the data for a single user in your application and provides methods to manage their account. This hook also allows you to check if the user is signed in and if Clerk has loaded and initialized.
 *
 * @example
 * ### Get the current user
 *
 * The following example uses the `useUser()` hook to access the [`User`](https://clerk.com/docs/references/javascript/user/user) object, which contains the current user's data such as their full name. The `isLoaded` and `isSignedIn` properties are used to handle the loading state and to check if the user is signed in, respectively.
 *
 * ```tsx {{ filename: 'src/Example.tsx' }}
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
 * The following example uses the `useUser()` hook to access the [`User`](https://clerk.com/docs/references/javascript/user/user) object, which calls the [`update()`](https://clerk.com/docs/references/javascript/user/user#update) method to update the current user's information.
 *
 * ```tsx {{ filename: 'src/Home.tsx' }}
 * import { useUser } from '@clerk/clerk-react'
 *
 * export default function Home() {
 *   const { isLoaded, user } = useUser()
 *
 *   if (!isLoaded) {
 *     // Handle loading state
 *     return null
 *   }
 *
 *   if (!user) return null
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
 *       <p>user.firstName: {user?.firstName}</p>
 *       <p>user.lastName: {user?.lastName}</p>
 *     </>
 *   )
 * }
 * ```
 *
 * @example
 * ### Reload user data
 *
 * The following example uses the `useUser()` hook to access the [`User`](https://clerk.com/docs/references/javascript/user/user) object, which calls the [`reload()`](https://clerk.com/docs/references/javascript/user/user#reload) method to get the latest user's information.
 *
 * ```tsx {{ filename: 'src/Home.tsx' }}
 * import { useUser } from '@clerk/clerk-react'
 *
 * export default function Home() {
 *   const { isLoaded, user } = useUser()
 *
 *   if (!isLoaded) {
 *     // Handle loading state
 *     return null
 *   }
 *
 *   if (!user) return null
 *
 *   const updateUser = async () => {
 *     // Update data via an API endpoint
 *     const updateMetadata = await fetch('/api/updateMetadata')
 *
 *     // Check if the update was successful
 *     if (updateMetadata.message !== 'success') {
 *       throw new Error('Error updating')
 *     }
 *
 *     // If the update was successful, reload the user data
 *     await user.reload()
 *   }
 *
 *   return (
 *     <>
 *       <button onClick={updateUser}>Update your metadata</button>
 *       <p>user role: {user?.publicMetadata.role}</p>
 *     </>
 *   )
 * }
 * ```
 */
export const useUser = (): UseUserReturn => {
  useAssertWrappedByClerkProvider('useUser');

  const user = useUserContext();

  if (user === undefined) {
    return { isLoaded: false, isSignedIn: undefined, user: undefined };
  }

  if (user === null) {
    return { isLoaded: true, isSignedIn: false, user: null };
  }

  return { isLoaded: true, isSignedIn: true, user };
};
