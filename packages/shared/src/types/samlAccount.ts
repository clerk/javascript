import type { ClerkResource } from './resource';
import type { SamlIdpSlug } from './saml';
import type { SamlAccountConnectionResource } from './samlConnection';
import type { SamlAccountJSONSnapshot } from './snapshots';
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
  lastAuthenticatedAt: Date | null;
  enterpriseConnectionId: string | null;
  __internal_toSnapshot: () => SamlAccountJSONSnapshot;
}
