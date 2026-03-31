import type { ClerkResourceJSON } from './json';
import type { ClerkResource } from './resource';

export interface EnterpriseConnectionJSON extends ClerkResourceJSON {
  object: 'enterprise_connection';
  name: string;
  active: boolean;
  domains?: string[];
  organization_id?: string | null;
  sync_user_attributes: boolean;
  disable_additional_identifications: boolean;
  allow_organization_account_linking?: boolean;
  custom_attributes?: unknown[];
  oauth_config?: EnterpriseOAuthConfigJSON | null;
  saml_connection?: EnterpriseSamlConnectionNestedJSON | null;
  created_at: number;
  updated_at: number;
}

export type EnterpriseConnectionJSONSnapshot = EnterpriseConnectionJSON;

export interface EnterpriseConnectionResource extends ClerkResource {
  id: string;
  name: string;
  active: boolean;
  domains: string[];
  organizationId: string | null;
  syncUserAttributes: boolean;
  disableAdditionalIdentifications: boolean;
  allowOrganizationAccountLinking: boolean;
  customAttributes: unknown[];
  oauthConfig: EnterpriseOAuthConfigResource | null;
  samlConnection: EnterpriseSamlConnectionNestedResource | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  __internal_toSnapshot: () => EnterpriseConnectionJSONSnapshot;
}

export interface EnterpriseSamlConnectionNestedJSON {
  id: string;
  name: string;
  active: boolean;
  idp_entity_id: string;
  idp_sso_url: string;
  idp_certificate: string;
  idp_metadata_url: string;
  idp_metadata: string;
  acs_url: string;
  sp_entity_id: string;
  sp_metadata_url: string;
  allow_subdomains: boolean;
  allow_idp_initiated: boolean;
  force_authn: boolean;
}

export interface EnterpriseSamlConnectionNestedResource {
  id: string;
  name: string;
  active: boolean;
  idpEntityId: string;
  idpSsoUrl: string;
  idpCertificate: string;
  idpMetadataUrl: string;
  idpMetadata: string;
  acsUrl: string;
  spEntityId: string;
  spMetadataUrl: string;
  allowSubdomains: boolean;
  allowIdpInitiated: boolean;
  forceAuthn: boolean;
}

export interface EnterpriseOAuthConfigJSON {
  id: string;
  name: string;
  provider_key?: string;
  client_id: string;
  discovery_url?: string;
  logo_public_url?: string | null;
  requires_pkce?: boolean;
  created_at: number;
  updated_at: number;
}

export interface EnterpriseOAuthConfigResource {
  id: string;
  name: string;
  clientId: string;
  providerKey?: string;
  discoveryUrl?: string;
  logoPublicUrl?: string | null;
  requiresPkce?: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}
