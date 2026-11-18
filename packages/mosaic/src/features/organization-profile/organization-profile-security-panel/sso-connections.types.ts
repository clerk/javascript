import type { EnterpriseConnectionResource, EnterpriseSamlIdpCertificateResource } from '@clerk/shared/types';

export type SSOProviderFamily = 'saml' | 'oidc';

export type SSOProviderKey = 'okta' | 'microsoft' | 'google' | 'customSaml' | 'oidc';

export type SSOConnectionStatus = 'inProgress' | 'inactive' | 'active';

export type SSOCertificate = Pick<EnterpriseSamlIdpCertificateResource, 'certificate' | 'expiresAt'>;

export type SSOCertificateStatus = 'expired' | 'expiring' | 'valid' | 'unknown';

export type SSOConnectionSetting =
  | 'syncUserAttributes'
  | 'allowAdditionalIdentifiers'
  | 'allowSubdomains'
  | 'allowIdpInitiated'
  | 'forceAuthn';

export interface SSOSamlDetails {
  acsUrl: string;
  spEntityId: string;
  spMetadataUrl: string;
  idpMetadataUrl: string;
  idpSsoUrl: string;
  idpEntityId: string;
  certificates: SSOCertificate[];
}

export interface SSOOidcDetails {
  redirectUri: string;
  clientId: string;
  discoveryUrl: string;
  authUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
}

interface SSOConnectionBase extends Pick<EnterpriseConnectionResource, 'id' | 'name' | 'domains'> {
  providerKey: SSOProviderKey;
  iconUrl: string | undefined;
  status: SSOConnectionStatus;
  settings: Partial<Record<SSOConnectionSetting, boolean>>;
}

export type SSOConnection =
  | (SSOConnectionBase & { family: 'saml'; saml: SSOSamlDetails })
  | (SSOConnectionBase & { family: 'oidc'; oidc: SSOOidcDetails });

export type SSOSamlMode = 'metadataUrl' | 'manual';

export interface SSOSamlValues {
  mode: SSOSamlMode;
  idpMetadataUrl: string;
  idpSsoUrl: string;
  idpEntityId: string;
  certificates: SSOCertificate[];
}

export type SSOOidcMode = 'discoveryUrl' | 'manual';

export interface SSOOidcValues {
  mode: SSOOidcMode;
  clientId: string;
  clientSecret: string;
  discoveryUrl: string;
  authUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
}
