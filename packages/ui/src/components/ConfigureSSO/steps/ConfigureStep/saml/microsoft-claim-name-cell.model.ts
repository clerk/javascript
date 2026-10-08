import { type LocalizationKey, localizationKeys, useLocalizations } from '@/customizables';

export const useMicrosoftClaimNameCellModel = (claimNameKey: LocalizationKey) => {
  const { t } = useLocalizations();
  return {
    claimNameKey,
    claimName: t(claimNameKey),
    copyLabel: t(
      localizationKeys(
        'configureSSO.configureStep.samlMicrosoft.attributeMappingStep.attributeMappingTable.copyClaimName',
      ),
    ),
    copiedLabel: t(
      localizationKeys(
        'configureSSO.configureStep.samlMicrosoft.attributeMappingStep.attributeMappingTable.copyClaimNameCopied',
      ),
    ),
  };
};
