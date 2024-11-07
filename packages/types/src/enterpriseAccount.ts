import type { GoogleOauthProvider, MicrosoftOauthProvider } from 'oauth';
import type { SamlIdpSlug } from 'saml';
import type { CustomOAuthStrategy } from 'strategies';
import type { VerificationResource } from 'verification';

import type { ClerkResource } from './resource';

type EnterpriseProtocol = 'saml' | 'oauth';

type EnterpriseProvider = SamlIdpSlug | GoogleOauthProvider | MicrosoftOauthProvider | CustomOAuthStrategy;

export interface EnterpriseAccountResource extends ClerkResource {
  active: boolean;
  emailAddress: string;
  firstName: string;
  lastName: string;
  providerUserId: string | null;
  publicMetadata: Record<string, unknown>;
  verification: VerificationResource | null;
  enterpriseConnection: EnterpriseAccountConnectionResource | null;
  protocol: EnterpriseProtocol;
  provider: EnterpriseProvider;
}

export interface EnterpriseAccountConnectionResource extends ClerkResource {
  name: string;
  logoPublicUrl: string;
  domain: string;
  active: boolean;
  syncUserAttributes: boolean;
  disableAdditionalIdentifications: boolean;
  allowSubdomains: boolean;
  allowIdpInitiated: boolean;
  protocol: EnterpriseProtocol;
  provider: EnterpriseProvider;
}
