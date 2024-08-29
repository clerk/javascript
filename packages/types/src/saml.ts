export type SamlIdpSlug = 'saml_okta' | 'saml_google' | 'saml_microsoft' | 'saml_custom';

export type SamlIdp = {
  name: string;
  logo: string;
};

export type SamlIdpMap = Record<SamlIdpSlug, SamlIdp>;

export const SAML_IDPS: SamlIdpMap = {
  saml_okta: {
    name: 'Okta Workforce',
    logo: 'okta',
  },
  saml_google: {
    name: 'Google Workspace',
    logo: 'google',
  },
  saml_microsoft: {
    name: 'Microsoft Entra ID (Formerly AD)',
    logo: 'azure',
  },
  saml_custom: {
    name: 'SAML',
    logo: 'saml',
  },
};
