import { localizationKeys, useLocalizations } from '@/customizables';

export const useFullMessageBlockModel = () => {
  const { t } = useLocalizations();
  return {
    copyLabel: t(localizationKeys('configureSSO.testConfigurationStep.testRunDetails.runDetails.actionLabel__copy')),
    copiedLabel: t(
      localizationKeys('configureSSO.testConfigurationStep.testRunDetails.runDetails.actionLabel__copied'),
    ),
  };
};
