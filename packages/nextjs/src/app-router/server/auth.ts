import type { SignedInAuthObject, SignedOutAuthObject } from '@clerk/backend/internal';
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
    protect: {
      (
        params?:
          | CheckAuthorizationParamsWithCustomPermissions
          | ((has: CheckAuthorizationWithCustomPermissions) => boolean),
        options?: { redirectUrl: string },
      ): AuthObjectWithoutResources<SignedInAuthObject>;

      (params?: { redirectUrl: string }): AuthObjectWithoutResources<SignedInAuthObject>;
    };
  }
>;

type ProtectGeneric = {
  protect: (params?: unknown, options?: unknown) => AuthObjectWithoutResources<SignedInAuthObject>;
};

type AuthSignedOut = AuthObjectWithoutResources<
  SignedOutAuthObject & {
    /**
     * @experimental
     * This function is experimental as it throws a Nextjs notFound error if user is not authenticated or authorized.
     * In the future we would investigate a way to throw a more appropriate error that clearly describes the not authorized of authenticated status.
     */
    protect: () => never;
  }
>;

export const auth = () => {
  const authObject = createGetAuth({
    debugLoggerName: 'auth()',
    noAuthStatusMessage: authAuthHeaderMissing(),
  })(buildRequestLike());

  (authObject as unknown as ProtectGeneric).protect = (params: any, options: any) => {
    const paramsOrFunction = params?.redirectUrl
      ? undefined
      : (params as
          | CheckAuthorizationParamsWithCustomPermissions
          | ((has: CheckAuthorizationWithCustomPermissions) => boolean));
    const redirectUrl = (params?.redirectUrl || options?.redirectUrl) as string | undefined;

    const handleUnauthorized = (): never => {
      if (redirectUrl) {
        redirect(redirectUrl);
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
    if (!paramsOrFunction) {
      return { ...authObject };
    }

    /**
     * if a function is passed and returns false then throw not found
     */
    if (typeof paramsOrFunction === 'function') {
      if (paramsOrFunction(authObject.has)) {
        return { ...authObject };
      }
      return handleUnauthorized();
    }

    /**
     * Checking if user is authorized when permission or role is passed
     */
    if (authObject.has(paramsOrFunction)) {
      return { ...authObject };
    }

    return handleUnauthorized();
  };

  return authObject as AuthSignedIn | AuthSignedOut;
};

export const initialState = () => {
  return buildClerkProps(buildRequestLike());
};
