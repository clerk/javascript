import type { ClerkResource } from './resource';
import type { SamlIdpSlug } from './saml';
import type { VerificationResource } from './verification';

/**
 * @experimental
 */
export interface SamlAccountResource extends ClerkResource {
  provider: SamlIdpSlug;
  emailAddress: string;
  firstName: string;
  lastName: string;
  verification: VerificationResource | null;
}
