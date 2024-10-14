import type { ClerkResource } from './resource';
import type { SamlIdpSlug } from './saml';
import type { SamlAccountConnectionResource } from './samlConnection';
import type { VerificationResource } from './verification';

export interface SamlAccountResource extends ClerkResource {
  provider: SamlIdpSlug;
  providerUserId: string | null;
  active: boolean;
  emailAddress: string;
  firstName: string;
  lastName: string;
  verification: VerificationResource | null;
  samlConnection: SamlAccountConnectionResource | null;
}
