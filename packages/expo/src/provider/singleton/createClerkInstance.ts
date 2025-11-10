import type { FapiRequestInit, FapiResponse } from '@clerk/clerk-js/dist/types/core/fapiClient';
import { type Clerk, isClerkRuntimeError } from '@clerk/clerk-js/headless';
import type { BrowserClerk, HeadlessBrowserClerk } from '@clerk/react';
import { is4xxError } from '@clerk/shared/error';
import type {
  ClientJSONSnapshot,
  EnvironmentJSONSnapshot,
  PublicKeyCredentialCreationOptionsWithoutExtensions,
  PublicKeyCredentialRequestOptionsWithoutExtensions,
} from '@clerk/shared/types';
import { Platform } from 'react-native';

import packageJson from '../../../package.json';
import {
  ClientResourceCache,
  DUMMY_CLERK_CLIENT_RESOURCE,
  DUMMY_CLERK_ENVIRONMENT_RESOURCE,
  EnvironmentResourceCache,
  SessionJWTCache,
} from '../../cache';
import { MemoryTokenCache } from '../../cache/MemoryTokenCache';
import { errorThrower } from '../../errorThrower';
import { isNative } from '../../utils';
import type { BuildClerkOptions } from './types';

const KEY = '__clerk_client_jwt';

/**
 * @deprecated Use `getClerkInstance()` instead. `Clerk` will be removed in the next major version.
 */
export let clerk: HeadlessBrowserClerk | BrowserClerk;
let __internal_clerk: HeadlessBrowserClerk | BrowserClerk | undefined;

export function createClerkInstance(ClerkClass: typeof Clerk) {
  return (options?: BuildClerkOptions): HeadlessBrowserClerk | BrowserClerk => {
    const {
      publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.CLERK_PUBLISHABLE_KEY || '',
      tokenCache = MemoryTokenCache,
      __experimental_resourceCache: createResourceCache,
    } = options || {};

    if (!__internal_clerk && !publishableKey) {
      errorThrower.throwMissingPublishableKeyError();
    }

    // Support "hot-swapping" the Clerk instance at runtime. See JS-598 for additional details.
    const hasKeyChanged = __internal_clerk && !!publishableKey && publishableKey !== __internal_clerk.publishableKey;

    if (!__internal_clerk || hasKeyChanged) {
      if (hasKeyChanged) {
        tokenCache.clearToken?.(KEY);
      }

      const getToken = tokenCache.getToken;
      const saveToken = tokenCache.saveToken;
      __internal_clerk = clerk = new ClerkClass(publishableKey);

      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        // @ts-expect-error - This is an internal API
        __internal_clerk.__internal_createPublicCredentials = (
          publicKeyCredential: PublicKeyCredentialCreationOptionsWithoutExtensions,
        ) => {
          return options?.__experimental_passkeys?.create
            ? options?.__experimental_passkeys?.create(publicKeyCredential)
            : errorThrower.throw('create() for passkeys is missing');
        };

        // @ts-expect-error - This is an internal API
        __internal_clerk.__internal_getPublicCredentials = ({
          publicKeyOptions,
        }: {
          publicKeyOptions: PublicKeyCredentialRequestOptionsWithoutExtensions;
        }) => {
          return options?.__experimental_passkeys?.get
            ? options?.__experimental_passkeys?.get({ publicKeyOptions })
            : errorThrower.throw('get() for passkeys is missing');
        };
        // @ts-expect-error - This is an internal API
        __internal_clerk.__internal_isWebAuthnSupported = () => {
          return options?.__experimental_passkeys?.isSupported
            ? options?.__experimental_passkeys?.isSupported()
            : errorThrower.throw('isSupported() for passkeys is missing');
        };

        // @ts-expect-error - This is an internal API
        __internal_clerk.__internal_isWebAuthnAutofillSupported = () => {
          return options?.__experimental_passkeys?.isAutoFillSupported
            ? options?.__experimental_passkeys?.isAutoFillSupported()
            : errorThrower.throw('isSupported() for passkeys is missing');
        };

        // @ts-expect-error - This is an internal API
        __internal_clerk.__internal_isWebAuthnPlatformAuthenticatorSupported = () => {
          return Promise.resolve(true);
        };

        if (createResourceCache) {
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
        }
      }

      // @ts-expect-error - This is an internal API
      __internal_clerk.__unstable__onBeforeRequest(async (requestInit: FapiRequestInit) => {
        // https://reactnative.dev/docs/0.61/network#known-issues-with-fetch-and-cookie-based-authentication
        requestInit.credentials = 'omit';

        // Instructs the backend to parse the api token from the Authorization header.
        requestInit.url?.searchParams.append('_is_native', '1');

        const jwt = await getToken(KEY);
        (requestInit.headers as Headers).set('authorization', jwt || '');

        // Instructs the backend that the request is from a mobile device.
        // Some iOS devices have an empty user-agent, so we can't rely on that.
        if (isNative()) {
          (requestInit.headers as Headers).set('x-mobile', '1');
          (requestInit.headers as Headers).set('x-expo-sdk-version', packageJson.version);
        }
      });

      let nativeApiErrorShown = false;
      // @ts-expect-error - This is an internal API
      __internal_clerk.__unstable__onAfterResponse(async (_: FapiRequestInit, response: FapiResponse<unknown>) => {
        const authHeader = response.headers.get('authorization');
        if (authHeader) {
          await saveToken(KEY, authHeader);
        }

        if (!nativeApiErrorShown && response.payload?.errors?.[0]?.code === 'native_api_disabled') {
          console.error(
            'The Native API is disabled for this instance.\nGo to Clerk Dashboard > Configure > Native applications to enable it.\nOr, navigate here: https://dashboard.clerk.com/last-active?path=native-applications',
          );
          nativeApiErrorShown = true;
        }
      });
    }
    return __internal_clerk;
  };
}
