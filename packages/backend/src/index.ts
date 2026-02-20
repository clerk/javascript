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

export type ClerkOptions = Omit<CreateBackendApiOptions, 'skipApiVersionInUrl' | 'useMachineSecretKey'> &
  Partial<
    Pick<
      CreateAuthenticateRequestOptions['options'],
      'audience' | 'jwtKey' | 'proxyUrl' | 'secretKey' | 'publishableKey' | 'domain' | 'isSatellite'
    >
  > & { sdkMetadata?: SDKMetadata; telemetry?: Pick<TelemetryCollectorOptions, 'disabled' | 'debug' | 'samplingRate'> };

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
    publishableKey: opts.publishableKey,
    secretKey: opts.secretKey,
    samplingRate: 0.1,
    ...(opts.sdkMetadata ? { sdk: opts.sdkMetadata.name, sdkVersion: opts.sdkMetadata.version } : {}),
    ...(opts.telemetry || {}),
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
  ActorTokenJSON,
  AgentTaskJSON,
  AccountlessApplicationJSON,
  ClerkResourceJSON,
  TokenJSON,
  AllowlistIdentifierJSON,
  BlocklistIdentifierJSON,
  ClientJSON,
  CnameTargetJSON,
  DomainJSON,
  EmailJSON,
  EmailAddressJSON,
  ExternalAccountJSON,
  IdentificationLinkJSON,
  InstanceJSON,
  InstanceRestrictionsJSON,
  InstanceSettingsJSON,
  InvitationJSON,
  JwtTemplateJSON,
  OauthAccessTokenJSON,
  OAuthApplicationJSON,
  OrganizationJSON,
  OrganizationDomainJSON,
  OrganizationDomainVerificationJSON,
  OrganizationInvitationJSON,
  OrganizationSettingsJSON,
  PublicOrganizationDataJSON,
  OrganizationMembershipJSON,
  OrganizationMembershipPublicUserDataJSON,
  PhoneNumberJSON,
  ProxyCheckJSON,
  RedirectUrlJSON,
  SessionJSON,
  SignInJSON,
  SignInTokenJSON,
  SignUpJSON,
  SignUpVerificationJSON,
  SignUpVerificationsJSON,
  SMSMessageJSON,
  UserJSON,
  UserDeletedJSON,
  VerificationJSON,
  WaitlistEntryJSON,
  Web3WalletJSON,
  DeletedObjectJSON,
  PaginatedResponseJSON,
  TestingTokenJSON,
  WebhooksSvixJSON,
  BillingPlanJSON,
  BillingSubscriptionJSON,
  BillingSubscriptionItemJSON,
} from './api/resources/JSON';

/**
 * Resources
 */
export type {
  AgentTask,
  APIKey,
  ActorToken,
  AccountlessApplication,
  AllowlistIdentifier,
  BlocklistIdentifier,
  Client,
  CnameTarget,
  Domain,
  EmailAddress,
  ExternalAccount,
  Feature,
  Instance,
  InstanceRestrictions,
  InstanceSettings,
  Invitation,
  JwtTemplate,
  Machine,
  M2MToken,
  OauthAccessToken,
  OAuthApplication,
  Organization,
  OrganizationDomain,
  OrganizationDomainVerification,
  OrganizationInvitation,
  OrganizationMembership,
  OrganizationMembershipPublicUserData,
  OrganizationSettings,
  PhoneNumber,
  SamlConnection,
  Session,
  SignInToken,
  SignUpAttempt,
  SMSMessage,
  Token,
  User,
  TestingToken,
  WaitlistEntry,
  BillingPlan,
  BillingSubscription,
  BillingSubscriptionItem,
} from './api/resources';

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
  BillingPaymentAttemptWebhookEvent,
  BillingSubscriptionWebhookEvent,
  BillingSubscriptionItemWebhookEvent,
} from './api/resources/Webhooks';

/**
 * Auth objects
 */
export type { AuthObject, InvalidTokenAuthObject } from './tokens/authObjects';
export type { SessionAuthObject, MachineAuthObject } from './tokens/types';
