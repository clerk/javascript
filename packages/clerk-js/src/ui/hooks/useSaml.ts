import { iconImageUrl } from '@clerk/shared/constants';
import type { SamlIdpSlug } from '@clerk/types';
import { SAML_IDPS } from '@clerk/types';

function getSamlProviderLogoUrl(provider: SamlIdpSlug = 'saml_custom'): string {
  return iconImageUrl(SAML_IDPS[provider]?.logo);
}

function getSamlProviderName(provider: SamlIdpSlug = 'saml_custom'): string {
  return SAML_IDPS[provider]?.name;
}

export const useSaml = () => {
  return {
    getSamlProviderLogoUrl,
    getSamlProviderName,
  };
};
