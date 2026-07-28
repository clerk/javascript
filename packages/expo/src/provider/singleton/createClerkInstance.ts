import { type Clerk } from '@clerk/clerk-js';
import type { BrowserClerk, HeadlessBrowserClerk } from '@clerk/react';
import { is4xxError, isClerkRuntimeError } from '@clerk/shared/error';
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
import type { TokenCache } from '../../cache/types';
import { CLERK_CLIENT_JWT_KEY } from '../../constants';
import { errorThrower } from '../../errorThrower';
import { assertValidProxyUrl } from '../../utils/errors';
import { isNative } from '../../utils/runtime';
import type { BuildClerkOptions } from './types';

/**
 * Internal types for FAPI client callbacks.
 * These are simplified versions of the internal clerk-js types,
 * used only for the __internal_onBeforeRequest and __internal_onAfterResponse hooks.
 */
type FapiRequestInit = RequestInit & {
  url?: URL;
  headers?: Headers;
};

type FapiResponse = Response & {
  payload: { errors?: Array<{ code: string }> } | null;
};

type ClerkRuntimeOptions = Pick<BuildClerkOptions, 'publishableKey' | 'proxyUrl' | 'domain'>;
type ResolvedClerkRuntimeOptions = Omit<ClerkRuntimeOptions, 'publishableKey'> & {
  publishableKey: string;
};

const RESOURCE_RETRY_MAX_DELAY_MS = 30_000;
const RESOURCE_RETRY_MAX_EXPONENT = 4;

function hasOwnOption<Key extends keyof BuildClerkOptions>(
  options: BuildClerkOptions | undefined,
  key: Key,
): options is BuildClerkOptions & Required<Pick<BuildClerkOptions, Key>> {
  return !!options && Object.prototype.hasOwnProperty.call(options, key);
}

let __internal_clerk: HeadlessBrowserClerk | BrowserClerk | undefined;
let __internal_clerkOptions: ClerkRuntimeOptions | undefined;
let __internal_cancelResourceRetries: (() => void) | undefined;
// Token IO can change without recreating the native singleton.
let __internal_tokenCache: TokenCache = MemoryTokenCache;

/**
 * Resolves the next native singleton config while preserving existing values for omitted options.
 * A publishable key change starts from a clean proxy/domain config unless those values are
 * explicitly provided alongside the new key.
 */
function getUpdatedClerkOptions(
  currentOptions: ClerkRuntimeOptions | undefined,
  nextOptions: ClerkRuntimeOptions | undefined,
): {
  hasConfigChanged: boolean;
  options: ResolvedClerkRuntimeOptions;
} {
  const hasNextProxyUrl = hasOwnOption(nextOptions, 'proxyUrl');
  const hasNextDomain = hasOwnOption(nextOptions, 'domain');
  const hasKeyChanged =
    !!currentOptions &&
    typeof nextOptions?.publishableKey !== 'undefined' &&
    nextOptions.publishableKey !== currentOptions.publishableKey;
  const hasProxyChanged = !!currentOptions && hasNextProxyUrl && nextOptions.proxyUrl !== currentOptions.proxyUrl;
  const hasDomainChanged = !!currentOptions && hasNextDomain && nextOptions.domain !== currentOptions.domain;

  return {
    hasConfigChanged: hasKeyChanged || hasProxyChanged || hasDomainChanged,
    options: {
      publishableKey: nextOptions?.publishableKey ?? currentOptions?.publishableKey ?? '',
      proxyUrl: hasKeyChanged
        ? nextOptions?.proxyUrl
        : hasNextProxyUrl
          ? nextOptions.proxyUrl
          : currentOptions?.proxyUrl,
      domain: hasKeyChanged ? nextOptions?.domain : hasNextDomain ? nextOptions.domain : currentOptions?.domain,
    },
  };
}

export function createClerkInstance(ClerkClass: typeof Clerk) {
  return (options?: BuildClerkOptions): HeadlessBrowserClerk | BrowserClerk => {
    const { __experimental_resourceCache: createResourceCache } = options || {};
    const {
      hasConfigChanged,
      options: { publishableKey, proxyUrl, domain },
    } = getUpdatedClerkOptions(__internal_clerkOptions, options);

    if (!__internal_clerk && !publishableKey) {
      errorThrower.throwMissingPublishableKeyError();
    }

    if (hasOwnOption(options, 'tokenCache')) {
      __internal_tokenCache = options.tokenCache ?? MemoryTokenCache;
    }

    if (!__internal_clerk || hasConfigChanged) {
      assertValidProxyUrl(proxyUrl);

      __internal_cancelResourceRetries?.();
      __internal_cancelResourceRetries = undefined;

      if (hasConfigChanged) {
        void __internal_tokenCache.clearToken?.(CLERK_CLIENT_JWT_KEY);
      }

      const getToken = (key: string) => __internal_tokenCache.getToken(key);
      const saveToken = (key: string, token: string) => __internal_tokenCache.saveToken(key, token);

      __internal_clerkOptions = { publishableKey, proxyUrl, domain };
      const clerk = new ClerkClass(publishableKey, { proxyUrl, domain }) as unknown as BrowserClerk;
      __internal_clerk = clerk;

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

        const isClerkNetworkError = (err: unknown): boolean => isClerkRuntimeError(err) && err.code === 'network_error';

        if (createResourceCache) {
          let resourceRetryTimer: ReturnType<typeof setTimeout> | undefined;
          let resourceRetryCancelled = false;
          let resourceRetryInFlight = false;
          let resourceRetryFailureCount = 0;
          let initialResourcesLoaded = false;

          __internal_cancelResourceRetries = () => {
            resourceRetryCancelled = true;
            if (resourceRetryTimer !== undefined) {
              clearTimeout(resourceRetryTimer);
              resourceRetryTimer = undefined;
            }
          };

          const scheduleResourceRetry = (timeout: number) => {
            if (
              resourceRetryCancelled ||
              initialResourcesLoaded ||
              resourceRetryTimer !== undefined ||
              resourceRetryInFlight
            ) {
              return;
            }

            resourceRetryTimer = setTimeout(() => {
              resourceRetryTimer = undefined;
              if (resourceRetryCancelled || initialResourcesLoaded) {
                return;
              }
              void retryInitializeResourcesFromFAPI();
            }, timeout);
          };

          const retryInitializeResourcesFromFAPI = async () => {
            if (resourceRetryCancelled || initialResourcesLoaded || resourceRetryInFlight) {
              return;
            }

            resourceRetryInFlight = true;
            let nextRetryTimeout: number | undefined;
            try {
              await clerk.__internal_reloadInitialResources();
              initialResourcesLoaded = true;
            } catch (err: unknown) {
              if (isClerkNetworkError(err) || !is4xxError(err)) {
                const initialRetryTimeout = isClerkNetworkError(err) ? 2000 : 10000;
                nextRetryTimeout = Math.min(
                  initialRetryTimeout * 2 ** resourceRetryFailureCount,
                  RESOURCE_RETRY_MAX_DELAY_MS,
                );
                resourceRetryFailureCount = Math.min(resourceRetryFailureCount + 1, RESOURCE_RETRY_MAX_EXPONENT);
              }
            } finally {
              resourceRetryInFlight = false;
            }

            if (nextRetryTimeout !== undefined) {
              scheduleResourceRetry(nextRetryTimeout);
            }
          };

          EnvironmentResourceCache.init({ publishableKey, storage: createResourceCache });
          ClientResourceCache.init({ publishableKey, storage: createResourceCache });
          SessionJWTCache.init({ publishableKey, storage: createResourceCache });

          __internal_clerk.addListener(({ client }) => {
            // @ts-expect-error - This is an internal API
            const environment = __internal_clerk?.__internal_environment as EnvironmentResource;
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
              scheduleResourceRetry(3000);
            }
            return { client, environment };
          };
        }
      }

      // @ts-expect-error - This is an internal API
      __internal_clerk.__internal_onBeforeRequest(async (requestInit: FapiRequestInit) => {
        // https://reactnative.dev/docs/0.61/network#known-issues-with-fetch-and-cookie-based-authentication
        requestInit.credentials = 'omit';

        // Instructs the backend to parse the api token from the Authorization header.
        requestInit.url?.searchParams.append('_is_native', '1');

        const jwt = await getToken(CLERK_CLIENT_JWT_KEY);
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
      __internal_clerk.__internal_onAfterResponse(async (_: FapiRequestInit, response: FapiResponse) => {
        const authHeader = response.headers.get('authorization');
        if (authHeader) {
          await saveToken(CLERK_CLIENT_JWT_KEY, authHeader);
        }

        if (__DEV__ && !nativeApiErrorShown && response.payload?.errors?.[0]?.code === 'native_api_disabled') {
          console.error(
            'The Native API is disabled for this instance.\nGo to Clerk Dashboard > Configure > Native applications to enable it.\nOr, navigate here: https://dashboard.clerk.com/last-active?path=native-applications',
          );
          nativeApiErrorShown = true;
        }
      });
    }

    // At this point __internal_clerk is guaranteed to be defined
    return __internal_clerk;
  };
}
