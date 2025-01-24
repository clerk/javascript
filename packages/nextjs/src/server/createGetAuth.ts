import type { AuthObject } from '@clerk/backend';
import { constants } from '@clerk/backend/internal';
import { isTruthy } from '@clerk/shared/underscore';

import { withLogger } from '../utils/debugLogger';
import { getAuthDataFromRequest } from './data/getAuthDataFromRequest';
import { getAuthAuthHeaderMissing } from './errors';
import { getHeader } from './headers-utils';
import type { RequestLike } from './types';
import { assertAuthStatus } from './utils';

export const createGetAuth = ({
  noAuthStatusMessage,
  debugLoggerName,
}: {
  debugLoggerName: string;
  noAuthStatusMessage: string;
}) =>
  withLogger(debugLoggerName, logger => {
    return (req: RequestLike, opts?: { secretKey?: string }): AuthObject => {
      if (isTruthy(getHeader(req, constants.Headers.EnableDebug))) {
        logger.enable();
      }

      assertAuthStatus(req, noAuthStatusMessage);

      return getAuthDataFromRequest(req, { ...opts, logger });
    };
  });

export const getAuth = createGetAuth({
  debugLoggerName: 'getAuth()',
  noAuthStatusMessage: getAuthAuthHeaderMissing(),
});
