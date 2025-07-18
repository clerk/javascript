import type { OAuthProvider, OAuthScope } from './oauth';
import type { ClerkResource } from './resource';
import type { ExternalAccountJSONSnapshot } from './snapshots';
import type { VerificationResource } from './verification';

export type ReauthorizeExternalAccountParams = {
  additionalScopes?: OAuthScope[];
  redirectUrl?: string;
  oidcPrompt?: string;
  oidcLoginHint?: string;
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
  imageUrl: string;
  username?: string;
  phoneNumber?: string;
  publicMetadata: Record<string, unknown>;
  label?: string;
  verification: VerificationResource | null;
  reauthorize: (params: ReauthorizeExternalAccountParams) => Promise<ExternalAccountResource>;
  destroy: () => Promise<void>;
  providerSlug: () => OAuthProvider;
  providerTitle: () => string;
  accountIdentifier: () => string;
  __internal_toSnapshot: () => ExternalAccountJSONSnapshot;
}
