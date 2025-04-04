import type { TelemetryCollectorOptions } from '@clerk/shared/telemetry';
import { TelemetryCollector } from '@clerk/shared/telemetry';
import type { SDKMetadata } from '@clerk/types';

import type { ApiClient, CreateBackendApiOptions } from './api';
import { createBackendApiClient } from './api';
import { withLegacyReturn } from './jwt/legacyReturn';
import type { CreateAuthenticateRequestOptions } from './tokens/factory';
import { createAuthenticateRequest } from './tokens/factory';
import { verifyToken as _verifyToken } from './tokens/verify';

export const verifyToken = withLegacyReturn(_verifyToken);

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
  const apiClient = createBackendApiClient(options);
  const requestState = createAuthenticateRequest({ options, apiClient });
  const telemetry = new TelemetryCollector({
    ...options.telemetry,
    publishableKey: options.publishableKey,
    secretKey: options.secretKey,
    samplingRate: 0.1,
    ...(options.sdkMetadata ? { sdk: options.sdkMetadata.name, sdkVersion: options.sdkMetadata.version } : {}),
  });

  return {
    ...apiClient,
    ...requestState,
    telemetry,
  };
}

/**
 * General Types
 */
export type { VerifyTokenOptions } from './tokens/verify';

/**
 * Webhooks event types
 */
export type {
  EmailWebhookEvent,
  OrganizationWebhookEvent,
  OrganizationDomainWebhookEvent,
  OrganizationInvitationWebhookEvent,
  OrganizationMembershipWebhookEvent,
  RoleWebhookEvent,
  PermissionWebhookEvent,
  SessionWebhookEvent,
  SMSWebhookEvent,
  UserWebhookEvent,
  WaitlistEntryWebhookEvent,
  WebhookEvent,
  WebhookEventType,
} from './api/resources/Webhooks';

/**
 * Auth objects
 */
export type { AuthObject } from './tokens/authObjects';

/**
 * Resources
 */
export type {
  AccountlessApplication,
  AllowlistIdentifier,
  Client,
  EmailAddress,
  ExternalAccount,
  Invitation,
  OAuthAccessToken,
  Organization,
  OrganizationDomain,
  OrganizationInvitation,
  OrganizationMembership,
  OrganizationMembershipPublicUserData,
  PhoneNumber,
  Session,
  SignInToken,
  Token,
  User,
} from '@clerk/backend-sdk/models/components';

/**
 * Enums
 */
export type { OrganizationMembershipRole } from './api/resources/Enums';
