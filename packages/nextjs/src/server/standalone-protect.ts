import { constants } from '@clerk/backend/internal';
import type { CheckAuthorizationParamsWithCustomPermissions } from '@clerk/types';

// import { actionAsyncStorage } from 'next/dist/client/components/action-async-storage.external';
import { buildRequestLike } from '../app-router/server/utils';
import { constants as nextConstants } from '../constants';
import { createGetAuth } from './createGetAuth';
import { authAuthHeaderMissing } from './errors';
import { isNextFetcher } from './nextFetcher';

export const createStandaloneProtect = () => {
  return <T>(handlerOrComponent: T, params?: CheckAuthorizationParamsWithCustomPermissions & { fallback: any }): T => {
    // @ts-ignore
    return (req: any) => {
      const request = buildRequestLike();
      const authObject = createGetAuth({
        debugLoggerName: 'auth()',
        noAuthStatusMessage: authAuthHeaderMissing(),
      })(request);

      // const { headers } = request;
      if (isPageRequest(req.headers)) {
        console.log('is page');
        // console.log('----lllllll', actionAsyncStorage.getStore());
        /**
         * User is not assured
         */
        if (authObject.has(params!)) {
          return handlerOrComponent;
        }
        return params?.fallback;
      } else if (isApiRouteRequest()) {
        console.log('is api');
        // console.log('----lllllll', actionAsyncStorage.getStore());
        // if (authObject.has(params!)) {
        // @ts-ignore
        return handlerOrComponent(req);
        // }

        // @ts-ignore

        // return new Response(
        //   JSON.stringify({
        //     clerk_error: 'forbidden',
        //     reason: 'assurance',
        //     assurance: params?.assurance,
        //   }),
        //   {
        //     status: 403,
        //   },
        // );
      }

      console.log('is server');

      // @ts-ignore
      return {
        clerk_error: 'forbidden',
        reason: 'assurance',
        assurance: params?.assurance,
      };
    };

    // const handleUnauthenticated = () => {
    //   if (unauthenticatedUrl) {
    //     return redirect(unauthenticatedUrl);
    //   }
    //   if (isPageRequest(request)) {
    //     // TODO: Handle runtime values. What happens if runtime values are set in middleware and in ClerkProvider as well?
    //     return redirectToSignIn();
    //   }
    //   return notFound();
    // };
    //
    // const handleUnauthorized = () => {
    //   if (unauthorizedUrl) {
    //     return redirect(unauthorizedUrl);
    //   }
    //   return notFound();
    // };
    //
    // /**
    //  * User is not authenticated
    //  */
    // if (!authObject.userId) {
    //   return handleUnauthenticated();
    // }
    //
    // /**
    //  * User is authenticated
    //  */
    // if (!paramsOrFunction) {
    //   return authObject;
    // }
    //
    // /**
    //  * if a function is passed and returns false then throw not found
    //  */
    // if (typeof paramsOrFunction === 'function') {
    //   if (paramsOrFunction(authObject.has)) {
    //     return authObject;
    //   }
    //   return handleUnauthorized();
    // }
    //
    // /**
    //  * Checking if user is authorized when permission or role is passed
    //  */
    // if (authObject.has(paramsOrFunction)) {
    //   return authObject;
    // }
    //
    // return handleUnauthorized();
  };
};

export const isServerActionRequest = (headers: Headers) => {
  return !!headers.get(nextConstants.Headers.NextAction);
};

const isPageRequest = (headers: Headers): boolean => {
  return (
    headers.get(constants.Headers.SecFetchDest) === 'document' ||
    headers.get(constants.Headers.SecFetchDest) === 'iframe' ||
    headers.get(constants.Headers.Accept)?.includes('text/html') ||
    isAppRouterInternalNavigation(headers) ||
    isPagesRouterInternalNavigation(headers)
  );
};

const isAppRouterInternalNavigation = (headers: Headers) =>
  // Works for nextjs <= 14.2.3
  (!!headers.get(nextConstants.Headers.NextUrl) || getPagePathAvailable().endsWith('/page')) &&
  !isServerActionRequest(headers);

const getPagePathAvailable = () => {
  const __fetch = globalThis.fetch;
  return isNextFetcher(__fetch) ? __fetch.__nextGetStaticStore().getStore()?.pagePath || '' : '';
};

const isPagesRouterInternalNavigation = (headers: Headers) => !!headers.get(nextConstants.Headers.NextjsData);

/**
 * In case we want to handle router handlers and server actions differently in the future
 */
const isApiRouteRequest = () => {
  return getPagePathAvailable().endsWith('/route');
  // return !isPageRequest(headers) && !isServerActionRequest(headers);
};
