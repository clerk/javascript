import type { OAuthProvider } from './oauth';
import type { ClerkResource } from './resource';
import type { SamlIdpSlug } from './saml';
import type { EnterpriseAccountConnectionJSONSnapshot, EnterpriseAccountJSONSnapshot } from './snapshots';
import type { VerificationResource } from './verification';

export type EnterpriseProtocol = 'saml' | 'oauth';

export type EnterpriseProvider = SamlIdpSlug | `oauth_${OAuthProvider}`;

export interface EnterpriseAccountResource extends ClerkResource {
  active: boolean;
  emailAddress: string;
  enterpriseConnection: EnterpriseAccountConnectionResource | null;
  enterpriseConnectionId: string | null;
  firstName: string | null;
  lastName: string | null;
  protocol: EnterpriseProtocol;
  provider: EnterpriseProvider;
  providerUserId: string | null;
  publicMetadata: Record<string, unknown> | null;
  verification: VerificationResource | null;
  lastAuthenticatedAt: Date | null;
  __internal_toSnapshot: () => EnterpriseAccountJSONSnapshot;
}

export interface EnterpriseAccountConnectionResource extends ClerkResource {
  active: boolean;
  allowIdpInitiated: boolean;
  allowSubdomains: boolean;
  disableAdditionalIdentifications: boolean;
  domain: string;
  logoPublicUrl: string | null;
  name: string;
  protocol: EnterpriseProtocol;
  provider: EnterpriseProvider;
  syncUserAttributes: boolean;
  enterpriseConnectionId: string | null;
  __internal_toSnapshot: () => EnterpriseAccountConnectionJSONSnapshot;
}
