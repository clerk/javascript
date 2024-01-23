import type { SignedInAuthObject, SignedOutAuthObject } from '@clerk/backend';
import type {
  CheckAuthorizationParamsWithCustomPermissions,
  CheckAuthorizationWithCustomPermissions,
} from '@clerk/types';

import { buildClerkProps } from '../../server/buildClerkProps';
import { createGetAuth } from '../../server/createGetAuth';
import { authAuthHeaderMissing } from '../../server/errors';
import type { AuthObjectWithDeprecatedResources } from '../../server/types';
import { buildRequestLike } from './utils';

type AuthSignedIn = AuthObjectWithDeprecatedResources<
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
      ): AuthObjectWithDeprecatedResources<SignedInAuthObject>;

      (params?: { redirectUrl: string }): AuthObjectWithDeprecatedResources<SignedInAuthObject>;
    };
  }
>;

type ProtectGeneric = {
  protect: (params?: unknown, options?: unknown) => AuthObjectWithDeprecatedResources<SignedInAuthObject>;
};

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

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { notFound, redirect } = require('next/navigation');

  (authObject as unknown as ProtectGeneric).protect = (params: any, options: any) => {
    const paramsOrFunction = params?.redirectUrl
      ? undefined
      : (params as
          | CheckAuthorizationParamsWithCustomPermissions
          | ((has: CheckAuthorizationWithCustomPermissions) => boolean));
    const redirectUrl = (params?.redirectUrl || options?.redirectUrl) as string | undefined;

    const handleUnauthorized = (): any => {
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
