import type { SignedInAuthObject, SignedOutAuthObject } from '@clerk/backend';
import type {
  CheckAuthorizationParamsWithCustomPermissions,
  CheckAuthorizationWithCustomPermissions,
} from '@clerk/types';
import { notFound, redirect } from 'next/navigation';

import { authAuthHeaderMissing } from '../../server/errors';
import { buildClerkProps, createGetAuth } from '../../server/getAuth';
import type { AuthObjectWithoutResources } from '../../server/types';
import { buildRequestLike } from './utils';

type AuthSignedIn = AuthObjectWithoutResources<
  SignedInAuthObject & {
    /**
     * @experimental
     * This function is experimental as it throws a Nextjs notFound error if user is not authenticated or authorized.
     * In the future we would investigate a way to throw a more appropriate error that clearly describes the not authorized of authenticated status.
     */
    protect: (
      params?:
        | CheckAuthorizationParamsWithCustomPermissions
        | ((has: CheckAuthorizationWithCustomPermissions) => boolean),
      options?: { redirectUrl: string },
    ) => AuthObjectWithoutResources<SignedInAuthObject>;
  }
>;

type AuthSignedOut = AuthObjectWithoutResources<
  SignedOutAuthObject & {
    /**
     * @experimental
     * This function is experimental as it throws a Nextjs notFound error if user is not authenticated or authorized.
     * In the future we would investigate a way to throw a more appropriate error that clearly describes the not authorized of authenticated status.
     */
    protect: never;
  }
>;

export const auth = () => {
  const authObject = createGetAuth({
    debugLoggerName: 'auth()',
    noAuthStatusMessage: authAuthHeaderMissing(),
  })(buildRequestLike());

  (authObject as AuthSignedIn).protect = (params, options) => {
    const handleUnauthorized = (): never => {
      if (options?.redirectUrl) {
        redirect(options.redirectUrl);
      }
      notFound();
    };
    /**
     * User is not authenticated
     */
    if (!authObject.userId) {
      return handleUnauthorized();
    }

    /**
     * User is authenticated
     */
    if (!params) {
      return { ...authObject };
    }

    /**
     * if a function is passed and returns false then throw not found
     */
    if (typeof params === 'function') {
      if (params(authObject.has)) {
        return { ...authObject };
      }
      return handleUnauthorized();
    }

    /**
     * Checking if user is authorized when permission or role is passed
     */
    if (authObject.has(params)) {
      return { ...authObject };
    }

    return handleUnauthorized();
  };

  return authObject as AuthSignedIn | AuthSignedOut;
};

export const initialState = () => {
  return buildClerkProps(buildRequestLike());
};
