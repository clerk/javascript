import type { AuthObject } from '@clerk/backend';
import { constants } from '@clerk/backend/internal';
import { decodeJwt } from '@clerk/backend/jwt';
import { isTruthy } from '@clerk/shared/underscore';

import { withLogger } from '../utils/debugLogger';
import { getAuthDataFromRequest } from './data/getAuthDataFromRequest';
import { getAuthAuthHeaderMissing } from './errors';
import { getHeader } from './headers-utils';
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

export const parseJwt = (req: RequestLike) => {
  const cookieToken = getCookie(req, constants.Cookies.Session);
  const headerToken = getHeader(req, 'authorization')?.replace('Bearer ', '');
  return decodeJwt(cookieToken || headerToken || '');
};
