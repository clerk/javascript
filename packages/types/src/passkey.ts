import type { ClerkResource } from './resource';
import type { PasskeyVerificationResource } from './verification';

export interface PublicKeyOptions extends PublicKeyCredentialCreationOptions {}

export interface PasskeyResource extends ClerkResource {
  id: string;
  credentialId: string | null;
  name: string | null;
  verification: PasskeyVerificationResource | null;
  lastUsedAt: Date | null;
  updatedAt: Date;
  createdAt: Date;
}
