import { AuthData } from '../types';

/**
 *
 * Removes sensitive data from User and Session
 * This allows for sensitive fields like `user.privateMetadata` to be available
 * inside the `withServerSideAuth` callback, while ensuring that these fields
 * will not get serialized into the client-accessible __NEXT_DATA__ script
 *
 * @internal
 */
export function sanitizeAuthData(authData: AuthData): any {
  const user = authData.user ? { ...authData.user } : authData.user;
  if (user) {
    // @ts-expect-error;
    delete user['privateMetadata'];
  }
  return { ...authData, user };
}
