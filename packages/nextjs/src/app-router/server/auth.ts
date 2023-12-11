import type { SignedInAuthObject, SignedOutAuthObject } from '@clerk/backend';
import type {
  CheckAuthorizationParamsWithCustomPermissions,
  CheckAuthorizationWithCustomPermissions,
} from '@clerk/types';
import { notFound } from 'next/navigation';

import { authAuthHeaderMissing } from '../../server/errors';
import { buildClerkProps, createGetAuth } from '../../server/getAuth';
import type { AuthObjectWithDeprecatedResources } from '../../server/types';
import { buildRequestLike } from './utils';

type AuthSignedIn = AuthObjectWithDeprecatedResources<
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
    ) => AuthObjectWithDeprecatedResources<SignedInAuthObject>;
  }
>;

type AuthSignedOut = AuthObjectWithDeprecatedResources<
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

  (authObject as AuthSignedIn).protect = params => {
    /**
     * User is not authenticated
     */
    if (!authObject.userId) {
      notFound();
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
      notFound();
    }

    /**
     * Checking if user is authorized when permission or role is passed
     */
    if (authObject.has(params)) {
      return { ...authObject };
    }

    notFound();
  };

  return authObject as AuthSignedIn | AuthSignedOut;
};

export const initialState = () => {
  return buildClerkProps(buildRequestLike());
};
