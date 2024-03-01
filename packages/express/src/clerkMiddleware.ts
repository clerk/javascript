import { createClerkClient } from '@clerk/backend';
import type { RequestHandler } from 'express';

import { authenticateRequest, setResponseHeaders } from './authenticateRequest';
import { clerkClient as defaultClerkClient } from './clerkClient';
import type { ClerkMiddleware, ClerkMiddlewareOptions } from './types';
import { defaultHandler } from './utils';

const parseHandlerAndOptions = (args: unknown[]) => {
  return [
    typeof args[0] === 'function' ? args[0] : undefined,
    (args.length === 2 ? args[1] : typeof args[0] === 'function' ? {} : args[0]) || {},
  ] as [RequestHandler | undefined, ClerkMiddlewareOptions];
};

export const clerkMiddleware: ClerkMiddleware = (...args: unknown[]): RequestHandler[] => {
  const [handler, options] = parseHandlerAndOptions(args);

  const shouldInitializeClerkClient = Object.keys(options).length > 0;
  const clerkClient = shouldInitializeClerkClient ? createClerkClient(options) : defaultClerkClient;

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

  return [middleware, handler || defaultHandler];
};
