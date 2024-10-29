import type { AnyRouter } from '@tanstack/react-router';
import type { EventHandler } from 'vinxi/http';

import { authenticateRequest } from './authenticateRequest';
import { loadOptions } from './loadOptions';
import type { LoaderOptions } from './types';
import { getResponseClerkState } from './utils';

export type HandlerCallback<TRouter extends AnyRouter> = (ctx: {
  request: Request;
  router: TRouter;
  responseHeaders: Headers;
}) => Response | Promise<Response>;
export type CustomizeStartHandler<TRouter extends AnyRouter> = (cb: HandlerCallback<TRouter>) => EventHandler;

export function createClerkHandler<TRouter extends AnyRouter>(
  eventHandler: CustomizeStartHandler<TRouter>,
  clerkOptions: LoaderOptions = {},
) {
  return (cb: HandlerCallback<TRouter>): EventHandler => {
    return eventHandler(async ({ request, router, responseHeaders }) => {
      try {
        const loadedOptions = loadOptions(request, clerkOptions);

        const requestState = await authenticateRequest(request, loadedOptions);

        const clerkInitialState = getResponseClerkState(requestState, loadedOptions);

        // Merging the TanStack router context with the Clerk context and loading the router
        router.update({
          context: { ...router.options.context, ...clerkInitialState },
        });
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
