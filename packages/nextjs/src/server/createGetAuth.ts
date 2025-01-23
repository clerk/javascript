import type { AuthObject } from '@clerk/backend';
import { constants } from '@clerk/backend/internal';
import { decodeJwt } from '@clerk/backend/jwt';
import { isTruthy } from '@clerk/shared/underscore';

import { withLogger } from '../utils/debugLogger';
import { isNextWithUnstableServerActions } from '../utils/sdk-versions';
import { getAuthDataFromRequest } from './data/getAuthDataFromRequest';
import { getAuthAuthHeaderMissing } from './errors';
import { detectClerkMiddleware, getHeader } from './headers-utils';
import type { RequestLike } from './types';
import { assertAuthStatus, getCookie } from './utils';

export const createGetAuth = ({
  noAuthStatusMessage,
  debugLoggerName,
}: {
  debugLoggerName: string;
  noAuthStatusMessage: string;
}) =>
  withLogger(debugLoggerName, logger => {
    return async (req: RequestLike, opts?: { secretKey?: string }): Promise<AuthObject> => {
      if (isTruthy(getHeader(req, constants.Headers.EnableDebug))) {
        logger.enable();
      }

      if (!detectClerkMiddleware(req)) {
        // Keep the same behaviour for versions that may have issues with bundling `node:fs`
        if (isNextWithUnstableServerActions) {
          assertAuthStatus(req, noAuthStatusMessage);
        }

        const missConfiguredMiddlewareLocation = await import('./keyless-node.js')
          .then(m => m.suggestMiddlewareLocation())
          .catch(() => undefined);

        if (missConfiguredMiddlewareLocation) {
          throw new Error(missConfiguredMiddlewareLocation);
        }

        assertAuthStatus(req, noAuthStatusMessage);
      }

      return getAuthDataFromRequest(req, { ...opts, logger });
    };
  });

// Did this break ?
export const getAuth = createGetAuth({
  debugLoggerName: 'getAuth()',
  noAuthStatusMessage: getAuthAuthHeaderMissing(),
});

export const parseJwt = (req: RequestLike) => {
  const cookieToken = getCookie(req, constants.Cookies.Session);
  const headerToken = getHeader(req, 'authorization')?.replace('Bearer ', '');
  return decodeJwt(cookieToken || headerToken || '');
};
