import type { GoogleOauthProvider, MicrosoftOauthProvider } from 'oauth';
import type { SamlIdpSlug } from 'saml';
import type { CustomOAuthStrategy } from 'strategies';
import type { VerificationResource } from 'verification';

import type { ClerkResource } from './resource';

export type EnterpriseProtocol = 'saml' | 'oauth';

export type EnterpriseProvider = SamlIdpSlug | GoogleOauthProvider | MicrosoftOauthProvider | CustomOAuthStrategy;

export interface EnterpriseAccountResource extends ClerkResource {
  protocol: EnterpriseProtocol;
  provider: EnterpriseProvider;
  active: boolean;
  emailAddress: string;
  firstName: string;
  lastName: string;
  providerUserId: string | null;
  publicMetadata: Record<string, unknown> | null;
  verification: VerificationResource | null;
  enterpriseConnection: EnterpriseAccountConnectionResource | null;
}

export interface EnterpriseAccountConnectionResource extends ClerkResource {
  protocol: EnterpriseProtocol;
  provider: EnterpriseProvider;
  name: string;
  logoPublicUrl: string;
  domain: string;
  active: boolean;
  syncUserAttributes: boolean;
  disableAdditionalIdentifications: boolean;
  allowSubdomains: boolean;
  allowIdpInitiated: boolean;
}
