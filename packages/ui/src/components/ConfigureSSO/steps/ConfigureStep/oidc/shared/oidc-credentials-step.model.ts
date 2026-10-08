import { useConfigureSSO } from '../../../../ConfigureSSOContext';
import type { OidcIdpConfigurationMode } from '../../shared/IdentityProviderConfigurationModes';

export const useOidcCredentialsStepModel = () => {
  const {
    enterpriseConnection,
    enterpriseConnectionMutations: { updateConnection },
  } = useConfigureSSO();
  const oauthConfig = enterpriseConnection?.oauthConfig;

  const submitCredentials = async (clientId: string, clientSecret: string, mode: OidcIdpConfigurationMode) => {
    if (!enterpriseConnection) {
      return;
    }
    await updateConnection(enterpriseConnection.id, {
      oidc: {
        clientId,
        clientSecret,
        ...(mode === 'discoveryUrl' && oauthConfig?.discoveryUrl !== undefined
          ? { discoveryUrl: oauthConfig.discoveryUrl }
          : {}),
        ...(mode === 'manual' && oauthConfig?.authUrl !== undefined ? { authUrl: oauthConfig.authUrl } : {}),
        ...(mode === 'manual' && oauthConfig?.tokenUrl !== undefined ? { tokenUrl: oauthConfig.tokenUrl } : {}),
        ...(mode === 'manual' && oauthConfig?.userInfoUrl !== undefined
          ? { userInfoUrl: oauthConfig.userInfoUrl }
          : {}),
      },
    });
  };

  return {
    hasConnection: Boolean(enterpriseConnection),
    initialClientId: oauthConfig?.clientId ?? '',
    submitCredentials,
  };
};
