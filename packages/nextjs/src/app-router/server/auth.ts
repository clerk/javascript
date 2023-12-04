import type { SignedInAuthObject, SignedOutAuthObject } from '@clerk/backend';
import type {
  CheckAuthorizationWithCustomPermissions,
  OrganizationCustomPermissionKey,
  OrganizationCustomRoleKey,
} from '@clerk/types';
import { notFound } from 'next/navigation';

import { authAuthHeaderMissing } from '../../server/errors';
import { buildClerkProps, createGetAuth } from '../../server/getAuth';
import type { AuthObjectWithoutResources } from '../../server/types';
import { buildRequestLike } from './utils';

export const auth = () => {
  const authObject = createGetAuth({
    debugLoggerName: 'auth()',
    noAuthStatusMessage: authAuthHeaderMissing(),
  })(buildRequestLike()) as
    | AuthObjectWithoutResources<
        SignedInAuthObject & {
          protect: (
            params?:
              | {
                  role: OrganizationCustomRoleKey;
                  permission?: never;
                }
              | {
                  role?: never;
                  permission: OrganizationCustomPermissionKey;
                }
              | ((has: CheckAuthorizationWithCustomPermissions) => boolean),
          ) => AuthObjectWithoutResources<SignedInAuthObject>;
        }
      >
    /**
     * Add a comment
     */
    | AuthObjectWithoutResources<
        SignedOutAuthObject & {
          protect: never;
        }
      >;

  authObject.protect = params => {
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
      return notFound();
    }

    /**
     * Checking if user is authorized when permission or role is passed
     */
    if (authObject.has(params)) {
      return { ...authObject };
    }

    notFound();
  };

  return authObject;
};

export const initialState = () => {
  return buildClerkProps(buildRequestLike());
};
