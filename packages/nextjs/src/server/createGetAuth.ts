import type { SignedInAuthObject, SignedOutAuthObject } from '@clerk/backend';
import { AuthStatus, constants, decodeJwt, signedInAuthObject, signedOutAuthObject } from '@clerk/backend';
import { deprecatedObjectProperty } from '@clerk/shared/deprecated';
import type { SecretKeyOrApiKey } from '@clerk/types';

import { withLogger } from '../utils/debugLogger';
import { API_KEY, API_URL, API_VERSION, SECRET_KEY } from './clerkClient';
import { getAuthAuthHeaderMissing } from './errors';
import type { AuthObjectWithDeprecatedResources, RequestLike } from './types';
import { getAuthKeyFromRequest, getCookie, getHeader } from './utils';

type GetAuthOpts = Partial<SecretKeyOrApiKey>;

export const createGetAuth = ({
  debugLoggerName,
  noAuthStatusMessage,
}: {
  noAuthStatusMessage: string;
  debugLoggerName: string;
}) =>
  withLogger(debugLoggerName, logger => {
    return (
      req: RequestLike,
      opts?: GetAuthOpts,
    ):
      | AuthObjectWithDeprecatedResources<SignedInAuthObject>
      | AuthObjectWithDeprecatedResources<SignedOutAuthObject> => {
      if (getHeader(req, constants.Headers.EnableDebug) === 'true') {
        logger.enable();
      }

      // When the auth status is set, we trust that the middleware has already run
      // Then, we don't have to re-verify the JWT here,
      // we can just strip out the claims manually.
      const authToken = getAuthKeyFromRequest(req, 'AuthToken') as string;
      const authStatus = getAuthKeyFromRequest(req, 'AuthStatus') as AuthStatus;
      const authMessage = getAuthKeyFromRequest(req, 'AuthMessage');
      const authReason = getAuthKeyFromRequest(req, 'AuthReason');

      logger.debug('Debug', {
        authReason,
        authMessage,
        authStatus,
        authToken,
      });

      if (!authStatus) {
        throw new Error(noAuthStatusMessage);
      }

      const options = {
        apiKey: opts?.apiKey || API_KEY,
        authStatus,
        authMessage,
        secretKey: opts?.secretKey || SECRET_KEY,
        authReason,
        authToken,
        apiUrl: API_URL,
        apiVersion: API_VERSION,
      };
      logger.debug('Options debug', options);

      if (authStatus !== AuthStatus.SignedIn) {
        return signedOutAuthObject(options);
      }

      const jwt = decodeJwt(authToken);
      logger.debug('JWT debug', jwt.raw.text);

      const signedIn = signedInAuthObject(jwt.payload, {
        ...options,
        token: jwt.raw.text,
      });

      if (signedIn) {
        if (signedIn.user) {
          deprecatedObjectProperty(signedIn, 'user', 'Use `clerkClient.users.getUser` instead.');
        }

        if (signedIn.organization) {
          deprecatedObjectProperty(
            signedIn,
            'organization',
            'Use `clerkClient.organizations.getOrganization` instead.',
          );
        }

        if (signedIn.session) {
          deprecatedObjectProperty(signedIn, 'session', 'Use `clerkClient.sessions.getSession` instead.');
        }
      }

      return signedIn;
    };
  });

export const parseJwt = (req: RequestLike) => {
  const cookieToken = getCookie(req, constants.Cookies.Session);
  const headerToken = getHeader(req, 'authorization')?.replace('Bearer ', '');
  return decodeJwt(cookieToken || headerToken || '');
};

export const getAuth = createGetAuth({
  debugLoggerName: 'getAuth()',
  noAuthStatusMessage: getAuthAuthHeaderMissing(),
});
