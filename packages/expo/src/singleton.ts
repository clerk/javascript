import type { FapiRequestInit, FapiResponse } from '@clerk/clerk-js/dist/types/core/fapiClient';
import { Clerk } from '@clerk/clerk-js/headless';
import type { HeadlessBrowserClerk } from '@clerk/clerk-react';
import * as Application from 'expo-application';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Device from 'expo-device';

import type { TokenCache } from './cache';

// `true` when running in Expo Go.
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

Clerk.sdkMetadata = {
  name: PACKAGE_NAME,
  version: PACKAGE_VERSION,
};

const KEY = '__clerk_client_jwt';

const NULL_VALUE = 'NULL';

export let clerk: HeadlessBrowserClerk;

type BuildClerkOptions = {
  key: string;
  tokenCache: TokenCache;
};

export function buildClerk({ key, tokenCache }: BuildClerkOptions): HeadlessBrowserClerk {
  // Support "hot-swapping" the Clerk instance at runtime. See JS-598 for additional details.
  const hasKeyChanged = clerk && key !== clerk.publishableKey;

  if (!clerk || hasKeyChanged) {
    if (hasKeyChanged) {
      tokenCache.clearToken?.(KEY);
    }

    const getToken = tokenCache.getToken;
    const saveToken = tokenCache.saveToken;
    // TODO: DO NOT ACCEPT THIS
    clerk = new Clerk(key);

    // @ts-expect-error
    clerk.__unstable__onBeforeRequest(async (requestInit: FapiRequestInit) => {
      // https://reactnative.dev/docs/0.61/network#known-issues-with-fetch-and-cookie-based-authentication
      requestInit.credentials = 'omit';

      requestInit.url?.searchParams.append('_is_native', '1');

      const jwt = await getToken(KEY);
      (requestInit.headers as Headers).set('authorization', jwt || '');

      // indicate the device; non-identifying information
      (requestInit.headers as Headers).set('x-expo-device-brand', Device.brand ?? NULL_VALUE);

      // [isDevice]: true if the app is running on a real device and false if running in a simulator or emulator. On web, this is always set to true.
      (requestInit.headers as Headers).set('x-expo-device-is-device', Device.isDevice ? 'true' : 'false');
      (requestInit.headers as Headers).set('x-expo-device-brand', Device.brand ?? NULL_VALUE);
      (requestInit.headers as Headers).set('x-expo-device-model-id', Device.modelId ?? NULL_VALUE);
      (requestInit.headers as Headers).set('x-expo-application-id', Application.applicationId ?? NULL_VALUE);
      (requestInit.headers as Headers).set('x-expo-application-name', Application.applicationName ?? NULL_VALUE);
      (requestInit.headers as Headers).set(
        'x-expo-native-application-version',
        Application.nativeApplicationVersion ?? NULL_VALUE,
      );
      (requestInit.headers as Headers).set('x-expo-native-build-version', Application.nativeBuildVersion ?? NULL_VALUE);

      // indicate "environment"; non-identifying information
      (requestInit.headers as Headers).set('x-expo-is-expo-go', isExpoGo ? 'true' : 'false');
    });

    // @ts-expect-error
    clerk.__unstable__onAfterResponse(async (_: FapiRequestInit, response: FapiResponse<unknown>) => {
      const authHeader = response.headers.get('authorization');
      if (authHeader) {
        await saveToken(KEY, authHeader);
      }
    });
  }

  return clerk;
}
