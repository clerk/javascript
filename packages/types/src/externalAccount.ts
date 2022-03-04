import { OAuthProvider } from './oauth';

export interface ExternalAccountResource {
  id: string;
  provider: OAuthProvider;
  externalId: string;
  emailAddress: string;
  approvedScopes: string;
  firstName: string;
  lastName: string;
  picture: string;
  username?: string;
  publicMetadata: Record<string, unknown>;
  label?: string;

  providerTitle: () => string;
}
