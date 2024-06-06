import type { AnyRouter } from '@tanstack/react-router';
import type { EventHandler } from 'vinxi/http';

import { authenticateRequest } from './authenticateRequest';
import { loadOptions } from './loadOptions';
import { getResponseClerkState } from './utils/utils';

export type RequestHandler<TRouter extends AnyRouter> = (ctx: {
  request: Request;
  router: TRouter;
  responseHeaders: Headers;
}) => Promise<Response>;
export type CustomizeRequestHandler<TRouter extends AnyRouter> = (cb: RequestHandler<TRouter>) => EventHandler;

export function clerkMiddlewareHandler<TRouter extends AnyRouter>(eventHandler: CustomizeRequestHandler<TRouter>) {
  return (cb: RequestHandler<TRouter>): EventHandler => {
    return eventHandler(async ({ request, router, responseHeaders }) => {
      try {
        const loadedOptions = loadOptions(request);

        const requestState = await authenticateRequest(request, loadedOptions);

        const clerkContext = getResponseClerkState(requestState);

        // Updating the TanStack router context with the Clerk context and loading the router
        router.update({
          context: clerkContext,
        });

        await router.load();
      } catch (error) {
        if (error instanceof Response) {
          // returning the response
          return error;
        }

        throw error;
      }

      return cb({ request, router, responseHeaders });
    });
  };
}
