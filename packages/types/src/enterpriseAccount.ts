import type { EnterpriseAccountConnectionJSON, EnterpriseAccountJSON } from 'json';
import type { OAuthProvider } from 'oauth';
import type { SamlIdpSlug } from 'saml';
import type { VerificationResource } from 'verification';

import type { ClerkResource } from './resource';

export type EnterpriseProtocol = 'saml' | 'oauth';

export type EnterpriseProvider = SamlIdpSlug | `oauth_${OAuthProvider}`;

export interface EnterpriseAccountResource extends ClerkResource {
  active: boolean;
  emailAddress: string;
  enterpriseConnection: EnterpriseAccountConnectionResource | null;
  firstName: string | null;
  lastName: string | null;
  protocol: EnterpriseProtocol;
  provider: EnterpriseProvider;
  providerUserId: string | null;
  publicMetadata: Record<string, unknown> | null;
  verification: VerificationResource | null;
  toJSON: () => EnterpriseAccountJSON;
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
  toJSON: () => EnterpriseAccountConnectionJSON;
}
