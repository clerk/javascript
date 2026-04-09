import type {
  EnterpriseConnectionJSON,
  EnterpriseConnectionJSONSnapshot,
  EnterpriseConnectionResource,
  EnterpriseOAuthConfigJSON,
  EnterpriseOAuthConfigResource,
  EnterpriseSamlConnectionNestedJSON,
  EnterpriseSamlConnectionNestedResource,
} from '@clerk/shared/types';

import { unixEpochToDate } from '../../utils/date';
import { BaseResource } from './Base';

function samlNestedFromJSON(data: EnterpriseSamlConnectionNestedJSON): EnterpriseSamlConnectionNestedResource {
  return {
    id: data.id,
    name: data.name,
    active: data.active,
    idpEntityId: data.idp_entity_id,
    idpSsoUrl: data.idp_sso_url,
    idpCertificate: data.idp_certificate,
    idpMetadataUrl: data.idp_metadata_url,
    idpMetadata: data.idp_metadata,
    acsUrl: data.acs_url,
    spEntityId: data.sp_entity_id,
    spMetadataUrl: data.sp_metadata_url,
    allowSubdomains: data.allow_subdomains,
    allowIdpInitiated: data.allow_idp_initiated,
    forceAuthn: data.force_authn,
  };
}

function samlNestedToJSON(data: EnterpriseSamlConnectionNestedResource): EnterpriseSamlConnectionNestedJSON {
  return {
    id: data.id,
    name: data.name,
    active: data.active,
    idp_entity_id: data.idpEntityId,
    idp_sso_url: data.idpSsoUrl,
    idp_certificate: data.idpCertificate,
    idp_metadata_url: data.idpMetadataUrl,
    idp_metadata: data.idpMetadata,
    acs_url: data.acsUrl,
    sp_entity_id: data.spEntityId,
    sp_metadata_url: data.spMetadataUrl,
    allow_subdomains: data.allowSubdomains,
    allow_idp_initiated: data.allowIdpInitiated,
    force_authn: data.forceAuthn,
  };
}

function oauthConfigFromJSON(data: EnterpriseOAuthConfigJSON): EnterpriseOAuthConfigResource {
  return {
    id: data.id,
    name: data.name,
    clientId: data.client_id,
    providerKey: data.provider_key,
    discoveryUrl: data.discovery_url,
    logoPublicUrl: data.logo_public_url,
    requiresPkce: data.requires_pkce,
    createdAt: unixEpochToDate(data.created_at),
    updatedAt: unixEpochToDate(data.updated_at),
  };
}

function oauthConfigToJSON(data: EnterpriseOAuthConfigResource): EnterpriseOAuthConfigJSON {
  return {
    id: data.id,
    name: data.name,
    client_id: data.clientId,
    provider_key: data.providerKey,
    discovery_url: data.discoveryUrl,
    logo_public_url: data.logoPublicUrl,
    requires_pkce: data.requiresPkce,
    created_at: data.createdAt?.getTime() ?? 0,
    updated_at: data.updatedAt?.getTime() ?? 0,
  };
}

export class EnterpriseConnection extends BaseResource implements EnterpriseConnectionResource {
  id!: string;
  name!: string;
  active!: boolean;
  provider!: string;
  logoPublicUrl: string | null = null;
  domains: string[] = [];
  organizationId: string | null = null;
  syncUserAttributes!: boolean;
  disableAdditionalIdentifications!: boolean;
  allowOrganizationAccountLinking!: boolean;
  customAttributes: unknown[] = [];
  oauthConfig: EnterpriseOAuthConfigResource | null = null;
  samlConnection: EnterpriseSamlConnectionNestedResource | null = null;
  createdAt: Date | null = null;
  updatedAt: Date | null = null;

  constructor(data: EnterpriseConnectionJSON | EnterpriseConnectionJSONSnapshot | null) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: EnterpriseConnectionJSON | EnterpriseConnectionJSONSnapshot | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.name = data.name;
    this.active = data.active;
    this.provider = data.provider;
    this.logoPublicUrl = data.logo_public_url ?? null;
    this.domains = data.domains ?? [];
    this.organizationId = data.organization_id ?? null;
    this.syncUserAttributes = data.sync_user_attributes;
    this.disableAdditionalIdentifications = data.disable_additional_identifications;
    this.allowOrganizationAccountLinking = data.allow_organization_account_linking ?? false;
    this.customAttributes = data.custom_attributes ?? [];
    this.createdAt = unixEpochToDate(data.created_at);
    this.updatedAt = unixEpochToDate(data.updated_at);

    this.samlConnection = data.saml_connection ? samlNestedFromJSON(data.saml_connection) : null;
    this.oauthConfig = data.oauth_config ? oauthConfigFromJSON(data.oauth_config) : null;

    return this;
  }

  public __internal_toSnapshot(): EnterpriseConnectionJSONSnapshot {
    return {
      object: 'enterprise_connection',
      id: this.id,
      name: this.name,
      active: this.active,
      provider: this.provider,
      logo_public_url: this.logoPublicUrl,
      domains: this.domains,
      organization_id: this.organizationId,
      sync_user_attributes: this.syncUserAttributes,
      disable_additional_identifications: this.disableAdditionalIdentifications,
      allow_organization_account_linking: this.allowOrganizationAccountLinking,
      custom_attributes: this.customAttributes,
      saml_connection: this.samlConnection ? samlNestedToJSON(this.samlConnection) : undefined,
      oauth_config: this.oauthConfig ? oauthConfigToJSON(this.oauthConfig) : undefined,
      created_at: this.createdAt?.getTime() ?? 0,
      updated_at: this.updatedAt?.getTime() ?? 0,
    };
  }
}
