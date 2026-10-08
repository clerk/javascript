import { useConfigureSSO } from '../../../../ConfigureSSOContext';

export const useSamlServiceProviderModel = () => {
  const { enterpriseConnection } = useConfigureSSO();
  return {
    acsUrl: enterpriseConnection?.samlConnection?.acsUrl ?? '',
    spEntityId: enterpriseConnection?.samlConnection?.spEntityId ?? '',
  };
};
