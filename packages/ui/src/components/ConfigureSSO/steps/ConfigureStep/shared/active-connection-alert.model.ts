import { useConfigureSSO } from '../../../ConfigureSSOContext';

export const useActiveConnectionAlertModel = () => {
  const { enterpriseConnection } = useConfigureSSO();
  return { isActive: Boolean(enterpriseConnection?.active) };
};
