import type { AnyRouter } from '@tanstack/react-router';
import type { EventHandler } from 'vinxi/http';

import { authenticateRequest } from './authenticateRequest';
import { loadOptions } from './loadOptions';
import type { LoaderOptions } from './types';
import { getResponseClerkState } from './utils';

export type RequestHandler<TRouter extends AnyRouter> = (ctx: {
  request: Request;
  router: TRouter;
  responseHeaders: Headers;
}) => Promise<Response>;
export type CustomizeRequestHandler<TRouter extends AnyRouter> = (cb: RequestHandler<TRouter>) => EventHandler;

export function createClerkHandler<TRouter extends AnyRouter>(
  eventHandler: CustomizeRequestHandler<TRouter>,
  clerkOptions: LoaderOptions = {},
) {
  return (cb: RequestHandler<TRouter>): EventHandler => {
    return eventHandler(async ({ request, router, responseHeaders }) => {
      try {
        const loadedOptions = loadOptions(request, clerkOptions);

        const requestState = await authenticateRequest(request, loadedOptions);

        const clerkInitialState = getResponseClerkState(requestState, loadedOptions);

        // Updating the TanStack router context with the Clerk context and loading the router
        router.update({
          context: clerkInitialState,
        });

        await router.load();
      } catch (error) {
        if (error instanceof Response) {
          // returning the response
          return error;
        }

        // rethrowing the error if it is not a Response
        throw error;
      }

      return cb({ request, router, responseHeaders });
    });
  };
}
