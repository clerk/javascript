import { useConfigureSSO } from '../../../ConfigureSSOContext';
import type { OidcIdpConfigurationMode } from '../shared/IdentityProviderConfigurationModes';

export const useOidcCustomConfigureStepsModel = (): OidcIdpConfigurationMode => {
  const { enterpriseConnection } = useConfigureSSO();
  const oauthConfig = enterpriseConnection?.oauthConfig;
  return oauthConfig?.authUrl && !oauthConfig.discoveryUrl ? 'manual' : 'discoveryUrl';
};
