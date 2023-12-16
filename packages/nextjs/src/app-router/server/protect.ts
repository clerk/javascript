import type { AuthObject, SignedInAuthObject } from '@clerk/backend/internal';
import type {
  CheckAuthorizationParamsWithCustomPermissions,
  CheckAuthorizationWithCustomPermissions,
} from '@clerk/types';
import { notFound, redirect } from 'next/navigation';

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

export const createProtect = (authObj: AuthObject): AuthProtect => {
  return (...args: any[]) => {
    const paramsOrFunction = args[0]?.redirectUrl
      ? undefined
      : (args[0] as
          | CheckAuthorizationParamsWithCustomPermissions
          | ((has: CheckAuthorizationWithCustomPermissions) => boolean));
    const redirectUrl = (args[0]?.redirectUrl || args[1]?.redirectUrl) as string | undefined;

    const handleUnauthorized = (): never => {
      if (redirectUrl) {
        redirect(redirectUrl);
      }
      notFound();
    };

    /**
     * User is not authenticated
     */
    if (!authObj.userId) {
      return handleUnauthorized();
    }

    /**
     * User is authenticated
     */
    if (!paramsOrFunction) {
      return authObj;
    }

    /**
     * if a function is passed and returns false then throw not found
     */
    if (typeof paramsOrFunction === 'function') {
      if (paramsOrFunction(authObj.has)) {
        return authObj;
      }
      return handleUnauthorized();
    }

    /**
     * Checking if user is authorized when permission or role is passed
     */
    if (authObj.has(paramsOrFunction)) {
      return authObj;
    }

    return handleUnauthorized();
  };
};
