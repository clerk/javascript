import { OAuthProvider } from './providers';

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
  providerSlug: () => OAuthProvider;
  providerTitle: () => string;
}
