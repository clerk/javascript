import type { AuthObject, SignedInAuthObject } from '@clerk/backend/internal';
import { constants } from '@clerk/backend/internal';
// import { constants } from '@clerk/backend/internal';
import type {
  CheckAuthorizationParamsWithCustomPermissions,
  CheckAuthorizationWithCustomPermissions,
} from '@clerk/types';
import { headers } from 'next/headers';
// import { actionAsyncStorage } from 'next/dist/client/components/action-async-storage.external';
// import { headers } from 'next/headers';

type AuthProtectOptions = { redirectUrl?: string };
/**
 * @experimental
 * This function is experimental as it throws a Nextjs notFound error if user is not authenticated or authorized.
 * In the future we would investigate a way to throw a more appropriate error that clearly describes the not authorized of authenticated status.
 */
export interface AuthProtect {
  (params?: CheckAuthorizationParamsWithCustomPermissions, options?: AuthProtectOptions): SignedInAuthObject;
  (
    params?: (has: CheckAuthorizationWithCustomPermissions) => boolean,
    options?: AuthProtectOptions,
  ): SignedInAuthObject;
  (options?: AuthProtectOptions): SignedInAuthObject;
}

export const createProtect = (opts: {
  authObject: AuthObject;
  /**
   * middleware and pages throw a notFound error if signed out
   * but the middleware needs to throw an error it can catch
   * use this callback to customise the behavior
   */
  notFound: () => never;
  /**
   * see {@link notFound} above
   */
  redirect: (url: string) => void;
  /**
   * protect() in middleware redirects to signInUrl if signed out
   * protect() in pages throws a notFound error if signed out
   * use this callback to customise the behavior
   */
  handleUnauthenticated?: () => void;
}): AuthProtect => {
  const { handleUnauthenticated, authObject, redirect, notFound } = opts;

  return ((...args: any[]) => {
    const paramsOrFunction = args[0]?.redirectUrl
      ? undefined
      : (args[0] as
          | CheckAuthorizationParamsWithCustomPermissions
          | ((has: CheckAuthorizationWithCustomPermissions) => boolean));
    const redirectUrl = (args[0]?.redirectUrl || args[1]?.redirectUrl) as string | undefined;

    const handleUnauthorized = () => {
      if (redirectUrl) {
        redirect(redirectUrl);
      }

      /**
       * TODO:
       * - Detect if is page
       * - Detect if is component
       * - Detect if is api
       * - Detect if is server action
       */

      // if (headers().get(constants.Headers.SecFetchDest) === 'document' && !actionAsyncStorage.getStore()?.isAppRoute) {
      //   // redirect to sign-in
      //   redirect('/sign-in2');
      // }

      console.log('headers sec fetch', headers().get(constants.Headers.SecFetchDest));
      console.log('headers content type', headers().get(constants.Headers.ContentType));
      console.log('headers accept', headers().get(constants.Headers.Accept));
      console.log('headers action', headers().get('next-action'));
      console.log('headers tree', Object.fromEntries(headers().entries()));

      if (headers().get(constants.Headers.Accept) === 'text/x-component') {
        console.log('is server action');
        redirect('/sign-in2');
      }

      if (headers().get(constants.Headers.ContentType)?.startsWith('multipart/form-data')) {
        console.log('is server action');
      }

      if (typeof headers().get('next-action') === 'string') {
        console.log('is server action');
      }

      if (
        headers().get(constants.Headers.Accept)?.includes('text/html') &&
        headers().get(constants.Headers.SecFetchDest) === 'document'
      ) {
        console.log('Probably component or page');
      }

      if (
        // headers() is not populated with `Next-Router-State-Tree`😭
        typeof headers().get('Next-Router-State-Tree'.toLowerCase()) === 'string' &&
        headers().get(constants.Headers.SecFetchDest) === 'empty'
      ) {
        console.log('component or page in app');
      }
      // console.log('Is App Route', actionAsyncStorage.getStore()?.isAppRoute);
      console.log('headers sec fetch', headers().get(constants.Headers.SecFetchDest));
      console.log('headers content type', headers().get(constants.Headers.ContentType));
      console.log('headers accept', headers().get(constants.Headers.Accept));
      notFound();
    };

    /**
     * User is not authenticated
     */
    if (!authObject.userId) {
      return handleUnauthenticated ? handleUnauthenticated() : handleUnauthorized();
    }

    /**
     * User is authenticated
     */
    if (!paramsOrFunction) {
      return authObject;
    }

    /**
     * if a function is passed and returns false then continue as unauthorized
     */
    if (typeof paramsOrFunction === 'function') {
      if (paramsOrFunction(authObject.has)) {
        return authObject;
      }
      return handleUnauthorized();
    }

    /**
     * Checking if user is authorized when permission or role is passed
     */
    if (authObject.has(paramsOrFunction)) {
      return authObject;
    }

    return handleUnauthorized();
  }) as AuthProtect;
};
