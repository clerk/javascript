import type { AuthObject } from '@clerk/backend';
import { constants } from '@clerk/backend/internal';
import { isTruthy } from '@clerk/shared/underscore';

import { type LoggerNoCommit, withLogger } from '../utils/debugLogger';
import { isNextWithUnstableServerActions } from '../utils/sdk-versions';
import { getAuthDataFromRequest } from './data/getAuthDataFromRequest';
import { getAuthAuthHeaderMissing } from './errors';
import { detectClerkMiddleware, getHeader } from './headers-utils';
import type { RequestLike } from './types';
import { assertAuthStatus } from './utils';

// Utility type to determine if a type is a Promise
type IsPromise<T> = T extends Promise<any> ? true : false;

const createGetAuth = <
  TTransformer extends (param: {
    options: { secretKey?: string };
    logger: LoggerNoCommit;
    request: RequestLike;
  }) => AuthObject | Promise<AuthObject>,
>({
  debugLoggerName,
  transformer,
}: {
  debugLoggerName: string;
  transformer: TTransformer;
}) =>
  withLogger(debugLoggerName, logger => {
    return (req: RequestLike, opts?: { secretKey?: string }) => {
      if (isTruthy(getHeader(req, constants.Headers.EnableDebug))) {
        logger.enable();
      }

      return transformer({
        request: req,
        options: { ...opts },
        logger,
      }) as unknown as IsPromise<ReturnType<TTransformer>> extends true
        ? Promise<Awaited<ReturnType<TTransformer>>>
        : ReturnType<TTransformer>;
    };
  });

export const createGetAuthAsync = ({
  debugLoggerName,
  noAuthStatusMessage,
}: {
  debugLoggerName: string;
  noAuthStatusMessage: string;
}) =>
  createGetAuth({
    debugLoggerName: debugLoggerName,
    transformer: async ({ request, options, logger }) => {
      if (!detectClerkMiddleware(request)) {
        // Keep the same behaviour for versions that may have issues with bundling `node:fs`
        if (isNextWithUnstableServerActions) {
          assertAuthStatus(request, noAuthStatusMessage);
        }

        const missConfiguredMiddlewareLocation = await import('./keyless-node.js')
          .then(m => m.suggestMiddlewareLocation())
          .catch(() => undefined);

        if (missConfiguredMiddlewareLocation) {
          throw new Error(missConfiguredMiddlewareLocation);
        }

        assertAuthStatus(request, noAuthStatusMessage);
      }

      return getAuthDataFromRequest(request, { ...options, logger });
    },
  });

export const createGetAuthSync = ({
  debugLoggerName,
  noAuthStatusMessage,
}: {
  debugLoggerName: string;
  noAuthStatusMessage: string;
}) =>
  createGetAuth({
    debugLoggerName: debugLoggerName,
    transformer: ({ request, options, logger }) => {
      assertAuthStatus(request, noAuthStatusMessage);
      return getAuthDataFromRequest(request, { ...options, logger });
    },
  });

export const getAuth = createGetAuthSync({
  debugLoggerName: 'getAuth()',
  noAuthStatusMessage: getAuthAuthHeaderMissing(),
});
