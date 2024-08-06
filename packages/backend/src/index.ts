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

/**
 * General Types
 */
export type { OrganizationMembershipRole } from './api/resources';
export type { VerifyTokenOptions } from './tokens/verify';
/**
 * JSON types
 */
export type {
  ClerkResourceJSON,
  TokenJSON,
  AllowlistIdentifierJSON,
  ClientJSON,
  EmailJSON,
  EmailAddressJSON,
  ExternalAccountJSON,
  IdentificationLinkJSON,
  InvitationJSON,
  OauthAccessTokenJSON,
  OrganizationJSON,
  OrganizationInvitationJSON,
  PublicOrganizationDataJSON,
  OrganizationMembershipJSON,
  OrganizationMembershipPublicUserDataJSON,
  PhoneNumberJSON,
  RedirectUrlJSON,
  SessionJSON,
  SignInJSON,
  SignInTokenJSON,
  SignUpJSON,
  SMSMessageJSON,
  UserJSON,
  VerificationJSON,
  Web3WalletJSON,
  DeletedObjectJSON,
  PaginatedResponseJSON,
  TestingTokenJSON,
} from './api/resources/JSON';

/**
 * Resources
 */
export type {
  AllowlistIdentifier,
  Client,
  EmailAddress,
  ExternalAccount,
  Invitation,
  OauthAccessToken,
  Organization,
  OrganizationInvitation,
  OrganizationMembership,
  OrganizationMembershipPublicUserData,
  PhoneNumber,
  Session,
  SignInToken,
  SMSMessage,
  Token,
  User,
  TestingToken,
} from './api/resources';

/**
 * Webhooks event types
 */
export type {
  UserWebhookEvent,
  EmailWebhookEvent,
  SMSWebhookEvent,
  SessionWebhookEvent,
  OrganizationWebhookEvent,
  OrganizationMembershipWebhookEvent,
  OrganizationInvitationWebhookEvent,
  WebhookEvent,
  WebhookEventType,
} from './api/resources/Webhooks';

/**
 * Auth objects
 */
export type { AuthObject } from './tokens/authObjects';
