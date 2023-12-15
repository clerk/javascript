import type { TelemetryCollectorOptions } from '@clerk/shared/telemetry';
import { TelemetryCollector } from '@clerk/shared/telemetry';
import type { SDKMetadata } from '@clerk/types';

import type { ApiClient, CreateBackendApiOptions } from './api';
import { createBackendApiClient } from './api';
import type { CreateAuthenticateRequestOptions } from './tokens/factory';
import { createAuthenticateRequest } from './tokens/factory';

export * from './api/resources';
export * from './tokens/jwt';
export * from './tokens/verify';

export type ClerkOptions = CreateBackendApiOptions &
  Partial<
    Pick<
      CreateAuthenticateRequestOptions['options'],
      'audience' | 'jwtKey' | 'proxyUrl' | 'secretKey' | 'publishableKey' | 'domain' | 'isSatellite'
    >
  > & { sdkMetadata?: SDKMetadata; telemetry?: Pick<TelemetryCollectorOptions, 'disabled' | 'debug'> };

// The current exported type resolves the following issue in packages importing createClerkClient
// TS4023: Exported variable 'clerkClient' has or is using name 'AuthErrorReason' from external module "/packages/backend/dist/index" but cannot be named.
export type ClerkClient = {
  telemetry: TelemetryCollector;
} & ApiClient &
  ReturnType<typeof createAuthenticateRequest>;

export function createClerkClient(options: ClerkOptions): ClerkClient {
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
