import { createClerkClient } from '@clerk/backend';
import type { RequestHandler } from 'express';

import { authenticateRequest, setResponseHeaders } from './authenticateRequest';
import { clerkClient as defaultClerkClient } from './clerkClient';
import { middlewareNotInvoked } from './errors';
import type { ClerkMiddleware, ClerkMiddlewareOptions } from './types';
import { defaultHandler } from './utils';

const usedWithoutInvocation = (args: unknown[]) => {
  return (
    args.length === 3 && typeof args[0] === 'object' && typeof args[1] === 'object' && typeof args[2] === 'function'
  );
};

const parseHandlerAndOptions = (args: unknown[]) => {
  return [
    typeof args[0] === 'function' ? args[0] : undefined,
    (args.length === 2 ? args[1] : typeof args[0] === 'function' ? {} : args[0]) || {},
  ] as [RequestHandler | undefined, ClerkMiddlewareOptions];
};

export const clerkMiddleware: ClerkMiddleware = (...args: unknown[]) => {
  const [handler, options] = parseHandlerAndOptions(args);

  const shouldInitializeClerkClient = Object.keys(options).length > 0;
  const clerkClient = shouldInitializeClerkClient ? createClerkClient(options) : defaultClerkClient;

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  const middleware: RequestHandler = async (request, response, next) => {
    const requestState = await authenticateRequest({
      clerkClient,
      request,
      options,
    });

    const err = setResponseHeaders(requestState, response);
    if (err || response.writableEnded) {
      if (err) {
        next(err);
      }
      return;
    }

    Object.assign(request, { auth: requestState.toAuth() });

    return next();
  };

  if (usedWithoutInvocation(args)) {
    throw new Error(middlewareNotInvoked);
  }

  return [middleware, handler || defaultHandler];
};
