import type {
  CreateOrganizationEnterpriseConnectionParams,
  UpdateOrganizationEnterpriseConnectionParams,
} from '@clerk/shared/types';

type EnterpriseConnectionParams =
  | CreateOrganizationEnterpriseConnectionParams
  | UpdateOrganizationEnterpriseConnectionParams;

export type ToEnterpriseConnectionBodyOptions = {
  /**
   * When `true`, omit `organization_id` from the body even if it was provided
   * in `params`. Use this for org-scoped endpoints
   * (`/v1/organizations/{org_id}/enterprise_connections/*`) where the URL
   * path is authoritative.
   */
  omitOrganizationId?: boolean;
};

/**
 * Serializes `CreateOrganizationEnterpriseConnectionParams` /
 * `UpdateOrganizationEnterpriseConnectionParams` for the enterprise
 * connection FAPI endpoints.
 *
 * The handlers expect a flat form body where SAML and OIDC fields are
 * prefixed (e.g. `saml_idp_metadata_url`, `oidc_client_id`) rather than
 * nested under `saml`/`oidc` objects. `attribute_mapping` and
 * `custom_attributes` stay as object values and are JSON-stringified by
 * the form serializer downstream — their inner keys are user-supplied
 * data and must not be camel→snake transformed.
 */
export function toEnterpriseConnectionBody(
  params: EnterpriseConnectionParams,
  options: ToEnterpriseConnectionBodyOptions = {},
): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  // Top-level fields. `provider` and `domains` are only on Create, the rest are shared.
  setIfDefined(body, 'provider', (params as CreateOrganizationEnterpriseConnectionParams).provider);
  setIfDefined(body, 'name', params.name);
  // `domains` is an array of FQDN strings. The form serializer downstream emits
  // each element as a repeated `domains` form field (e.g. `domains=a.com&domains=b.com`),
  // matching how the backend parses repeated form params. An omitted or empty
  // array is not sent, keeping older callers backwards-compatible.
  const domains = (params as CreateOrganizationEnterpriseConnectionParams).domains;
  if (domains && domains.length > 0) {
    body.domains = domains;
  }
  if (!options.omitOrganizationId) {
    setIfDefined(body, 'organization_id', params.organizationId);
  }
  setIfDefined(body, 'active', (params as UpdateOrganizationEnterpriseConnectionParams).active);
  setIfDefined(
    body,
    'sync_user_attributes',
    (params as UpdateOrganizationEnterpriseConnectionParams).syncUserAttributes,
  );
  setIfDefined(
    body,
    'disable_additional_identifications',
    (params as UpdateOrganizationEnterpriseConnectionParams).disableAdditionalIdentifications,
  );
  setIfDefined(body, 'custom_attributes', (params as UpdateOrganizationEnterpriseConnectionParams).customAttributes);

  if (params.saml) {
    setIfDefined(body, 'saml_idp_entity_id', params.saml.idpEntityId);
    setIfDefined(body, 'saml_idp_sso_url', params.saml.idpSsoUrl);
    setIfDefined(body, 'saml_idp_certificate', params.saml.idpCertificate);
    setIfDefined(body, 'saml_idp_metadata_url', params.saml.idpMetadataUrl);
    setIfDefined(body, 'saml_idp_metadata', params.saml.idpMetadata);
    setIfDefined(body, 'saml_attribute_mapping', params.saml.attributeMapping);
    setIfDefined(body, 'saml_allow_subdomains', params.saml.allowSubdomains);
    setIfDefined(body, 'saml_allow_idp_initiated', params.saml.allowIdpInitiated);
    setIfDefined(body, 'saml_force_authn', params.saml.forceAuthn);
  }

  if (params.oidc) {
    setIfDefined(body, 'oidc_client_id', params.oidc.clientId);
    setIfDefined(body, 'oidc_client_secret', params.oidc.clientSecret);
    setIfDefined(body, 'oidc_discovery_url', params.oidc.discoveryUrl);
    setIfDefined(body, 'oidc_auth_url', params.oidc.authUrl);
    setIfDefined(body, 'oidc_token_url', params.oidc.tokenUrl);
    setIfDefined(body, 'oidc_user_info_url', params.oidc.userInfoUrl);
    setIfDefined(body, 'oidc_requires_pkce', params.oidc.requiresPkce);
  }

  return body;
}

/**
 * Adds `value` under `key` only when the caller actually provided it.
 * Mirrors the SDK's existing semantics: `undefined` means "don't send
 * this field"; `null` is forwarded so users can explicitly clear a
 * value via the form-encoded body.
 */
function setIfDefined(target: Record<string, unknown>, key: string, value: unknown): void {
  if (value !== undefined) {
    target[key] = value;
  }
}
