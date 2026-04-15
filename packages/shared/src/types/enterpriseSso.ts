export type SamlIdpSlug = 'saml_okta' | 'saml_google' | 'saml_microsoft' | 'saml_custom';

export type SamlIdp = {
  name: string;
  logo: string;
};

export type SamlIdpMap = Record<SamlIdpSlug, SamlIdp>;

export type OidcIdpSlug = 'oidc_custom';
