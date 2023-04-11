import type { ClerkResource } from './resource';
import type { VerificationResource } from './verification';

export interface SamlAccountResource extends ClerkResource {
  provider: string;
  emailAddress: string;
  firstName: string;
  lastName: string;
  verification: VerificationResource | null;
}
