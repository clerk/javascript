/** SAML providers are exact backend literals — the read-back key matches the input alias. */
export type SamlProviderType = 'saml_okta' | 'saml_custom' | 'saml_google' | 'saml_microsoft';

/**
 * The OIDC provider family a created connection reports back. Custom OIDC uses
 * an `oauth_custom_<slug>` key, while GitHub Enterprise and GitLab retain their
 * `oidc_*` keys for provider-specific user resolution.
 */
export type OidcProviderType = `oidc_${string}` | `oauth_custom_${string}`;

/**
 * The provider the SELECT step SENDS on create. OIDC always creates through the
 * single `oidc_custom` input alias; the backend then derives the real key.
 */
export type ProviderType = SamlProviderType | 'oidc_custom';

/**
 * The provider a created connection READS BACK. SAML narrows to the exact literals;
 * OIDC is an open, backend-derived family — dispatch on this by protocol, not literal.
 */
export type EnterpriseConnectionProviderType = SamlProviderType | OidcProviderType;

export type WizardStepId =
  | 'verify-domain'
  | 'configure'
  | 'select-provider'
  | 'configure-provider'
  | 'test'
  | 'activate';
