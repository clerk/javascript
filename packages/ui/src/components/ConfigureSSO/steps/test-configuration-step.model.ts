import { useConfigureSSO } from '../ConfigureSSOContext';

export const useTestConfigurationStepModel = () => {
  const { organizationEnterpriseConnection, testRuns } = useConfigureSSO();

  return {
    hasSuccessfulTestRun: organizationEnterpriseConnection.hasSuccessfulTestRun,
    ...testRuns,
  };
};
