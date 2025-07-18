import type { AnyRouter } from '@tanstack/react-router';
import type { CustomizeStartHandler, HandlerCallback, RequestHandler } from '@tanstack/react-start/server';

import { authenticateRequest } from './authenticateRequest';
import { ClerkHandshakeRedirect } from './errors';
import { loadOptions } from './loadOptions';
import type { LoaderOptions } from './types';
import { getResponseClerkState } from './utils';

export function createClerkHandler<TRouter extends AnyRouter>(
  eventHandler: CustomizeStartHandler<TRouter>,
  clerkOptions: LoaderOptions = {},
) {
  return (cb: HandlerCallback<TRouter>): RequestHandler => {
    return eventHandler(async ({ request, router, responseHeaders }) => {
      try {
        const loadedOptions = loadOptions(request, clerkOptions);

        const requestState = await authenticateRequest(request, {
          ...loadedOptions,
          acceptsToken: 'any',
        });

        const { clerkInitialState, headers } = getResponseClerkState(requestState, loadedOptions);

        // Merging the TanStack router context with the Clerk context and loading the router
        router.update({
          context: { ...router.options.context, clerkInitialState },
        });

        headers.forEach((value, key) => {
          responseHeaders.set(key, value);
        });

        await router.load();
      } catch (error) {
        if (error instanceof ClerkHandshakeRedirect) {
          // returning the response
          return new Response(null, {
            status: error.status,
            headers: error.headers,
          });
        }

        // rethrowing the error if it is not a Response
        throw error;
      }

      return cb({ request, router, responseHeaders });
    });
  };
}
