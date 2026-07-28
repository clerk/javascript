export type SamlProviderType = 'saml_okta' | 'saml_custom' | 'saml_google' | 'saml_microsoft';

export type OidcProviderType = `oidc_${string}`;

export type ProviderType = SamlProviderType | 'oidc_custom';

export type EnterpriseConnectionProviderType = SamlProviderType | OidcProviderType;

export type WizardStepId =
  | 'verify-domain'
  | 'configure'
  | 'select-provider'
  | 'configure-provider'
  | 'test'
  | 'activate';
