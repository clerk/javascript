export type ProviderType = 'saml_okta' | 'saml_custom' | 'saml_google' | 'saml_microsoft';

export type WizardStepId =
  | 'verify-domain'
  | 'configure'
  | 'select-provider'
  | 'configure-provider'
  | 'test'
  | 'activate';
