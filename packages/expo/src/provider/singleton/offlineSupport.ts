import { isClerkRuntimeError } from '@clerk/clerk-js/headless';
import type { BrowserClerk, HeadlessBrowserClerk } from '@clerk/clerk-react';
import { is4xxError } from '@clerk/shared/error';
import type { ClientJSONSnapshot, EnvironmentJSONSnapshot } from '@clerk/types';

import {
  ClientResourceCache,
  DUMMY_CLERK_CLIENT_RESOURCE,
  DUMMY_CLERK_ENVIRONMENT_RESOURCE,
  EnvironmentResourceCache,
  SessionJWTCache,
} from '../../cache';
import type { BuildClerkOptions } from './types';

type OfflineSupportParams = {
  publishableKey: string;
  createResourceCache?: BuildClerkOptions['__experimental_resourceCache'];
  __internal_clerk: HeadlessBrowserClerk | BrowserClerk;
};

// Experimental Offline Support
export const __experimental_enableOfflineSupport = ({
  __internal_clerk,
  publishableKey,
  createResourceCache,
}: OfflineSupportParams): void => {
  if (!__internal_clerk || !publishableKey || !createResourceCache) {
    return;
  }

  const retryInitilizeResourcesFromFAPI = async () => {
    const isClerkNetworkError = (err: unknown) => isClerkRuntimeError(err) && err.code === 'network_error';
    try {
      await __internal_clerk?.__internal_reloadInitialResources();
    } catch (err) {
      // Retry after 3 seconds if the error is a network error or a 5xx error
      if (isClerkNetworkError(err) || !is4xxError(err)) {
        // Retry after 2 seconds if the error is a network error
        // Retry after 10 seconds if the error is a 5xx FAPI error
        const timeout = isClerkNetworkError(err) ? 2000 : 10000;
        setTimeout(() => void retryInitilizeResourcesFromFAPI(), timeout);
      }
    }
  };

  EnvironmentResourceCache.init({ publishableKey, storage: createResourceCache });
  ClientResourceCache.init({ publishableKey, storage: createResourceCache });
  SessionJWTCache.init({ publishableKey, storage: createResourceCache });

  __internal_clerk.addListener(({ client }) => {
    // @ts-expect-error - This is an internal API
    const environment = __internal_clerk?.__unstable__environment as EnvironmentResource;
    if (environment) {
      void EnvironmentResourceCache.save(environment.__internal_toSnapshot());
    }

    if (client) {
      void ClientResourceCache.save(client.__internal_toSnapshot());
      if (client.lastActiveSessionId) {
        const currentSession = client.signedInSessions.find(s => s.id === client.lastActiveSessionId);
        const token = currentSession?.lastActiveToken?.getRawString();
        if (token) {
          void SessionJWTCache.save(token);
        }
      } else {
        void SessionJWTCache.remove();
      }
    }
  });

  __internal_clerk.__internal_getCachedResources = async (): Promise<{
    client: ClientJSONSnapshot | null;
    environment: EnvironmentJSONSnapshot | null;
  }> => {
    let environment = await EnvironmentResourceCache.load();
    let client = await ClientResourceCache.load();
    if (!environment || !client) {
      environment = DUMMY_CLERK_ENVIRONMENT_RESOURCE;
      client = DUMMY_CLERK_CLIENT_RESOURCE;
      setTimeout(() => void retryInitilizeResourcesFromFAPI(), 3000);
    }
    return { client, environment };
  };
};
