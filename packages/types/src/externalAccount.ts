import { OAuthProvider } from '.';

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

  providerSlug: () => OAuthProvider;
  providerTitle: () => string;
}
