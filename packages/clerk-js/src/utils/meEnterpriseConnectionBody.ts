import type {
  CreateMeEnterpriseConnectionParams,
  MeEnterpriseConnectionOidcInput,
  MeEnterpriseConnectionSamlInput,
  UpdateMeEnterpriseConnectionParams,
} from '@clerk/shared/types';

function samlToJson(saml: MeEnterpriseConnectionSamlInput): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (saml.idpEntityId !== undefined) body.idp_entity_id = saml.idpEntityId;
  if (saml.idpSsoUrl !== undefined) body.idp_sso_url = saml.idpSsoUrl;
  if (saml.idpCertificate !== undefined) body.idp_certificate = saml.idpCertificate;
  if (saml.idpMetadataUrl !== undefined) body.idp_metadata_url = saml.idpMetadataUrl;
  if (saml.idpMetadata !== undefined) body.idp_metadata = saml.idpMetadata;
  if (saml.attributeMapping !== undefined) body.attribute_mapping = saml.attributeMapping;
  if (saml.allowSubdomains !== undefined) body.allow_subdomains = saml.allowSubdomains;
  if (saml.allowIdpInitiated !== undefined) body.allow_idp_initiated = saml.allowIdpInitiated;
  if (saml.forceAuthn !== undefined) body.force_authn = saml.forceAuthn;
  return body;
}

function oidcToJson(oidc: MeEnterpriseConnectionOidcInput): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (oidc.clientId !== undefined) body.client_id = oidc.clientId;
  if (oidc.clientSecret !== undefined) body.client_secret = oidc.clientSecret;
  if (oidc.discoveryUrl !== undefined) body.discovery_url = oidc.discoveryUrl;
  if (oidc.authUrl !== undefined) body.auth_url = oidc.authUrl;
  if (oidc.tokenUrl !== undefined) body.token_url = oidc.tokenUrl;
  if (oidc.userInfoUrl !== undefined) body.user_info_url = oidc.userInfoUrl;
  if (oidc.requiresPkce !== undefined) body.requires_pkce = oidc.requiresPkce;
  return body;
}

export function buildCreateMeEnterpriseConnectionBody(
  params: CreateMeEnterpriseConnectionParams,
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    provider: params.provider,
    name: params.name,
  };
  if (params.organizationId !== undefined) {
    body.organization_id = params.organizationId;
  }
  if (params.saml !== undefined) {
    body.saml = params.saml === null ? null : samlToJson(params.saml);
  }
  if (params.oidc !== undefined) {
    body.oidc = params.oidc === null ? null : oidcToJson(params.oidc);
  }
  return body;
}

export function buildUpdateMeEnterpriseConnectionBody(
  params: UpdateMeEnterpriseConnectionParams,
): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (params.name !== undefined) body.name = params.name;
  if (params.active !== undefined) body.active = params.active;
  if (params.syncUserAttributes !== undefined) body.sync_user_attributes = params.syncUserAttributes;
  if (params.disableAdditionalIdentifications !== undefined) {
    body.disable_additional_identifications = params.disableAdditionalIdentifications;
  }
  if (params.organizationId !== undefined) body.organization_id = params.organizationId;
  if (params.customAttributes !== undefined) body.custom_attributes = params.customAttributes;
  if (params.saml !== undefined) {
    body.saml = params.saml === null ? null : samlToJson(params.saml);
  }
  if (params.oidc !== undefined) {
    body.oidc = params.oidc === null ? null : oidcToJson(params.oidc);
  }
  return body;
}
