import { OAuthProvider } from './oauth';
import { VerificationResource } from './verification';

export interface ExternalAccountResource {
  id: string;
  identificationId: string;
  provider: OAuthProvider;
  providerUserId: string;
  emailAddress: string;
  approvedScopes: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  username?: string;
  publicMetadata: Record<string, unknown>;
  label?: string;
  verification: VerificationResource | null;
  destroy: () => Promise<void>;
  providerSlug: () => OAuthProvider;
  providerTitle: () => string;
}
