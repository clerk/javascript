import type { AuthObject } from '@clerk/backend';
import type {
  AuthenticatedMachineObject,
  SignedInAuthObject,
  SignedOutAuthObject,
  UnauthenticatedMachineObject,
} from '@clerk/backend/internal';
import { constants } from '@clerk/backend/internal';
import { isTruthy } from '@clerk/shared/underscore';

import { withLogger } from '../utils/debugLogger';
import type { GetAuthDataFromRequestOptions } from './data/getAuthDataFromRequest';
import { getAuthDataFromRequest as getAuthDataFromRequestOriginal } from './data/getAuthDataFromRequest';
import { getAuthAuthHeaderMissing } from './errors';
import { getHeader } from './headers-utils';
import type { RequestLike } from './types';
import { assertAuthStatus } from './utils';

type GetAuthOptions = { entity?: 'user' | 'machine' };
export const createGetAuth = ({
  noAuthStatusMessage,
  debugLoggerName,
  options,
}: {
  debugLoggerName: string;
  noAuthStatusMessage: string;
  options?: GetAuthOptions;
}) =>
  withLogger(debugLoggerName, logger => {
    return (req: RequestLike, opts?: { secretKey?: string }): AuthObject => {
      if (isTruthy(getHeader(req, constants.Headers.EnableDebug))) {
        logger.enable();
      }

      assertAuthStatus(req, noAuthStatusMessage);

      // Explicitly declare overloads at the top level
      function getAuthDataFromRequest(
        req: RequestLike,
        opts: GetAuthDataFromRequestOptions & { entity: 'machine' },
      ): Exclude<AuthObject, SignedInAuthObject | SignedOutAuthObject>;
      function getAuthDataFromRequest(
        req: RequestLike,
        opts: GetAuthDataFromRequestOptions & { entity: 'user' },
      ): Exclude<AuthObject, AuthenticatedMachineObject | UnauthenticatedMachineObject>;
      function getAuthDataFromRequest(req: RequestLike, opts?: GetAuthDataFromRequestOptions): AuthObject;
      function getAuthDataFromRequest(req: RequestLike, opts: GetAuthDataFromRequestOptions = {}) {
        // Ensure you spread and pass the correct options, including the logger
        return getAuthDataFromRequestOriginal(req, { ...opts, logger, entity: options?.entity });
      }
      return getAuthDataFromRequest(req, { ...opts, logger, entity: options?.entity });
    };
  });

export const getAuth = createGetAuth({
  debugLoggerName: 'getAuth()',
  noAuthStatusMessage: getAuthAuthHeaderMissing(),
});
