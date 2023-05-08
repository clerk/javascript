import type { Organization, Session, SignedInAuthObject, SignedOutAuthObject, User } from '@clerk/backend';
import {
  AuthStatus,
  constants,
  decodeJwt,
  makeAuthObjectSerializable,
  sanitizeAuthObject,
  signedInAuthObject,
  signedOutAuthObject,
} from '@clerk/backend';
import type { SecretKeyOrApiKey } from '@clerk/types';

import { withLogger } from '../utils/debugLogger';
import { API_KEY, API_URL, API_VERSION, SECRET_KEY } from './clerkClient';
import { getAuthAuthHeaderMissing } from './errors';
import type { RequestLike } from './types';
import { getAuthKeyFromRequest, getCookie, getHeader, injectSSRStateIntoObject } from './utils';

type GetAuthOpts = Partial<SecretKeyOrApiKey>;

export const createGetAuth = ({
  debugLoggerName,
  noAuthStatusMessage,
}: {
  noAuthStatusMessage: string;
  debugLoggerName: string;
}) =>
  withLogger(debugLoggerName, logger => {
    return (req: RequestLike, opts?: GetAuthOpts): SignedInAuthObject | SignedOutAuthObject => {
      const debug = getHeader(req, constants.Headers.EnableDebug) === 'true';
      if (debug) {
        logger.enable();
      }

      // When the auth status is set, we trust that the middleware has already run
      // Then, we don't have to re-verify the JWT here,
      // we can just strip out the claims manually.
      const authStatus = getAuthKeyFromRequest(req, 'AuthStatus');
      const authMessage = getAuthKeyFromRequest(req, 'AuthMessage');
      const authReason = getAuthKeyFromRequest(req, 'AuthReason');
      logger.debug('Headers debug', { authStatus, authMessage, authReason });

      if (!authStatus) {
        throw new Error(noAuthStatusMessage);
      }

      const options = {
        apiKey: opts?.apiKey || API_KEY,
        secretKey: opts?.secretKey || SECRET_KEY,
        apiUrl: API_URL,
        apiVersion: API_VERSION,
        authStatus,
        authMessage,
        authReason,
      };
      logger.debug('Options debug', options);

      if (authStatus !== AuthStatus.SignedIn) {
        return signedOutAuthObject(options);
      }

      const jwt = parseJwt(req);
      logger.debug('JWT debug', jwt.raw.text);
      return signedInAuthObject(jwt.payload, { ...options, token: jwt.raw.text });
    };
  });

export const getAuth = createGetAuth({
  debugLoggerName: 'getAuth()',
  noAuthStatusMessage: getAuthAuthHeaderMissing(),
});

type BuildClerkPropsInitState = { user?: User | null; session?: Session | null; organization?: Organization | null };

/**
 * To enable Clerk SSR support, include this object to the `props`
 * returned from `getServerSideProps`. This will automatically make the auth state available to
 * the Clerk components and hooks during SSR, the hydration phase and CSR.
 * @example
 * import { getAuth } from '@clerk/nextjs/server';
 *
 * export const getServerSideProps = ({ req }) => {
 *   const { authServerSideProps } = getAuth(req);
 *   const myData = getMyData();
 *
 *   return {
 *     props: { myData, authServerSideProps },
 *   };
 * };
 */
type BuildClerkProps = (req: RequestLike, authState?: BuildClerkPropsInitState) => Record<string, unknown>;

export const buildClerkProps: BuildClerkProps = (req, initState = {}) => {
  const authStatus = getAuthKeyFromRequest(req, 'AuthStatus');
  const authMessage = getAuthKeyFromRequest(req, 'AuthMessage');
  const authReason = getAuthKeyFromRequest(req, 'AuthReason');

  const options = {
    apiKey: API_KEY,
    secretKey: SECRET_KEY,
    apiUrl: API_URL,
    apiVersion: API_VERSION,
    authStatus,
    authMessage,
    authReason,
  };

  let authObject;
  if (!authStatus || authStatus !== AuthStatus.SignedIn) {
    authObject = signedOutAuthObject(options);
  } else {
    const { payload, raw } = parseJwt(req);
    authObject = signedInAuthObject(payload, { ...options, token: raw.text });
  }

  const sanitizedAuthObject = makeAuthObjectSerializable(sanitizeAuthObject({ ...authObject, ...initState }));
  return injectSSRStateIntoObject({}, sanitizedAuthObject);
};

const parseJwt = (req: RequestLike) => {
  const cookieToken = getCookie(req, constants.Cookies.Session);
  const headerToken = getHeader(req, 'authorization')?.replace('Bearer ', '');
  return decodeJwt(cookieToken || headerToken || '');
};
