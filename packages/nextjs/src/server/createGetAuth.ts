import { constants } from '@clerk/backend/internal';
import { isTruthy } from '@clerk/shared/underscore';

import { withLogger } from '../utils/debugLogger';
import { isNextWithUnstableServerActions } from '../utils/sdk-versions';
import { getAuthDataFromRequest } from './data/getAuthDataFromRequest';
import { getAuthAuthHeaderMissing } from './errors';
import { detectClerkMiddleware, getHeader } from './headers-utils';
import type { RequestLike } from './types';
import { assertAuthStatus } from './utils';

export const createAsyncGetAuth = ({
  debugLoggerName,
  noAuthStatusMessage,
}: {
  debugLoggerName: string;
  noAuthStatusMessage: string;
}) =>
  withLogger(debugLoggerName, logger => {
    return async (req: RequestLike, opts?: { secretKey?: string }) => {
      if (isTruthy(getHeader(req, constants.Headers.EnableDebug))) {
        logger.enable();
      }

      if (!detectClerkMiddleware(req)) {
        // Keep the same behaviour for versions that may have issues with bundling `node:fs`
        if (isNextWithUnstableServerActions) {
          assertAuthStatus(req, noAuthStatusMessage);
        }

        // eslint-disable-next-line import/no-unresolved
        const missConfiguredMiddlewareLocation = await import('./keyless-node.js')
          .then(m => m.suggestMiddlewareLocation())
          .catch(() => undefined);

        if (missConfiguredMiddlewareLocation) {
          throw new Error(missConfiguredMiddlewareLocation);
        }

        // still throw there is no suggested move location
        assertAuthStatus(req, noAuthStatusMessage);
      }

      return getAuthDataFromRequest(req, { ...opts, logger });
    };
  });

export const createSyncGetAuth = ({
  debugLoggerName,
  noAuthStatusMessage,
}: {
  debugLoggerName: string;
  noAuthStatusMessage: string;
}) =>
  withLogger(debugLoggerName, logger => {
    return (req: RequestLike, opts?: { secretKey?: string }) => {
      if (isTruthy(getHeader(req, constants.Headers.EnableDebug))) {
        logger.enable();
      }

      assertAuthStatus(req, noAuthStatusMessage);
      return getAuthDataFromRequest(req, { ...opts, logger });
    };
  });

export const getAuth = createSyncGetAuth({
  debugLoggerName: 'getAuth()',
  noAuthStatusMessage: getAuthAuthHeaderMissing(),
});
