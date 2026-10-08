import { useConfigureSSO } from '../../../../ConfigureSSOContext';
import type { OidcIdpConfigurationMode } from '../../shared/IdentityProviderConfigurationModes';

export const useOidcEndpointsStepModel = () => {
  const {
    enterpriseConnection,
    enterpriseConnectionMutations: { updateConnection },
  } = useConfigureSSO();
  const oauthConfig = enterpriseConnection?.oauthConfig;

  const submitEndpoints = async (
    mode: OidcIdpConfigurationMode,
    values: { discoveryUrl: string; authUrl: string; tokenUrl: string; userInfoUrl: string },
  ) => {
    if (!enterpriseConnection) {
      return;
    }
    await updateConnection(
      enterpriseConnection.id,
      mode === 'discoveryUrl'
        ? { oidc: { discoveryUrl: values.discoveryUrl } }
        : {
            oidc: {
              authUrl: values.authUrl,
              tokenUrl: values.tokenUrl,
              userInfoUrl: values.userInfoUrl,
            },
          },
    );
  };

  return {
    hasConnection: Boolean(enterpriseConnection),
    initialValues: {
      discoveryUrl: oauthConfig?.discoveryUrl ?? '',
      authUrl: oauthConfig?.authUrl ?? '',
      tokenUrl: oauthConfig?.tokenUrl ?? '',
      userInfoUrl: oauthConfig?.userInfoUrl ?? '',
    },
    submitEndpoints,
  };
};
