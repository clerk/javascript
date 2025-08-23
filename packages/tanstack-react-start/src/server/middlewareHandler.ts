import { AuthStatus, constants } from '@clerk/backend/internal';
import { handleNetlifyCacheInDevInstance } from '@clerk/shared/netlifyCacheHandler';
import type { PendingSessionOptions } from '@clerk/types';
import type { AnyRouter } from '@tanstack/react-router';
import {
  type CustomizeStartHandler,
  getEvent,
  getWebRequest,
  type HandlerCallback,
  type RequestHandler,
} from '@tanstack/react-start/server';

import { errorThrower } from '../utils';
import { authenticateRequest } from './authenticateRequest';
import { loadOptions } from './loadOptions';
import type { LoaderOptions } from './types';
import { getResponseClerkState } from './utils';

export function createClerkHandler<TRouter extends AnyRouter>(
  eventHandler: CustomizeStartHandler<TRouter>,
  clerkOptions: LoaderOptions = {},
) {
  return async (cb: HandlerCallback<TRouter>): Promise<RequestHandler> => {
    const request = getWebRequest();
    const event = getEvent();
    const loadedOptions = loadOptions(request, clerkOptions);

    const requestState = await authenticateRequest(request, {
      ...loadedOptions,
      acceptsToken: 'any',
    });

    // Set auth object here so it is available immediately in server functions via getAuth()
    event.context.auth = (options?: PendingSessionOptions) => requestState.toAuth(options);

    return eventHandler(async ({ request, router, responseHeaders }) => {
      const locationHeader = requestState.headers.get(constants.Headers.Location);
      if (locationHeader) {
        handleNetlifyCacheInDevInstance({
          locationHeader,
          requestStateHeaders: requestState.headers,
          publishableKey: requestState.publishableKey,
        });

        return new Response(null, {
          status: 307,
          headers: requestState.headers,
        });
      }

      if (requestState.status === AuthStatus.Handshake) {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw errorThrower.throw('Clerk: unexpected handshake without redirect');
      }

      const { clerkInitialState, headers } = getResponseClerkState(requestState, loadedOptions);

      // Merging the TanStack router context with the Clerk context and loading the router
      router.update({
        context: { ...router.options.context, clerkInitialState },
      });

      headers.forEach((value, key) => {
        responseHeaders.set(key, value);
      });

      await router.load();

      return cb({ request, router, responseHeaders });
    });
  };
}
