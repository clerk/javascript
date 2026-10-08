import { useConfigureSSO } from '../../../../ConfigureSSOContext';

export const useOidcRedirectUriStepModel = () => {
  const { enterpriseConnection } = useConfigureSSO();
  return { redirectUri: enterpriseConnection?.oauthConfig?.redirectUri ?? '' };
};
