import { localizationKeys, useLocalizations } from '@/customizables';

import { useConfigureSSO } from '../ConfigureSSOContext';

export const useContinueTestSsoStepButtonModel = () => {
  const { t } = useLocalizations();
  const { ownerKey, canRun, enterpriseConnection } = useConfigureSSO();
  return {
    scopeKey: JSON.stringify([ownerKey, enterpriseConnection?.id]),
    canRun,
    noSuccessfulTestRunMessage: t(localizationKeys('configureSSO.testConfigurationStep.error__noSuccessfulTestRun')),
  };
};
