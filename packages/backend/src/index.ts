import type { TelemetryCollectorOptions } from '@clerk/shared/telemetry';
import { TelemetryCollector } from '@clerk/shared/telemetry';
import type { SDKMetadata } from '@clerk/types';

import type { CreateBackendApiOptions } from './api';
import { createBackendApiClient } from './api';
import type { CreateAuthenticateRequestOptions } from './tokens';
import { createAuthenticateRequest } from './tokens';
import type { AuthenticateRequestOptions } from './tokens/request';

export { createIsomorphicRequest } from './util/IsomorphicRequest';

export * from './api/resources';
export * from './tokens';
export * from './tokens/jwt';
export * from './tokens/verify';
export { constants } from './constants';
export { redirect } from './redirections';
export { buildRequestUrl } from './utils';

export type ClerkOptions = CreateBackendApiOptions &
  Partial<
    Pick<
      CreateAuthenticateRequestOptions['options'],
      'audience' | 'jwtKey' | 'proxyUrl' | 'secretKey' | 'publishableKey' | 'domain' | 'isSatellite'
    >
  > & { sdkMetadata?: SDKMetadata; telemetry?: Pick<TelemetryCollectorOptions, 'disabled' | 'debug'> };

export function createClerkClient(options: ClerkOptions) {
  const opts = { ...options };
  const apiClient = createBackendApiClient(opts);
  const requestState = createAuthenticateRequest({ options: opts, apiClient });
  const telemetry = new TelemetryCollector({
    ...options.telemetry,
    publishableKey: opts.publishableKey,
    secretKey: opts.secretKey,
    ...(opts.sdkMetadata ? { sdk: opts.sdkMetadata.name, sdkVersion: opts.sdkMetadata.version } : {}),
  });

  return {
    ...apiClient,
    ...requestState,
    telemetry,
  };
}
