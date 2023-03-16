import type { OAuthProvider, OAuthScope } from './oauth';
import type { ClerkResource } from './resource';
import type { VerificationResource } from './verification';

export type ReauthorizeExternalAccountParams = {
  additionalScopes: OAuthScope[];
  redirectUrl?: string;
};

export interface ExternalAccountResource extends ClerkResource {
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
  reauthorize: (params: ReauthorizeExternalAccountParams) => Promise<ExternalAccountResource>;
  destroy: () => Promise<void>;
  providerSlug: () => OAuthProvider;
  providerTitle: () => string;
  accountIdentifier: () => string;
}
