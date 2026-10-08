import { localizationKeys } from '@/customizables';
import { useFormControl } from '@/ui/utils/useFormControl';

import { useWizard } from '../../../elements/Wizard';

export const useSamlCustomCreateAppStepController = (acsUrl: string, spEntityId: string) => {
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();
  const acsUrlField = useFormControl('acsUrl', acsUrl, {
    type: 'text',
    label: localizationKeys('configureSSO.configureStep.samlCustom.createAppStep.serviceProviderFields.acsUrl.label'),
    isRequired: false,
  });
  const spEntityIdField = useFormControl('spEntityId', spEntityId, {
    type: 'text',
    label: localizationKeys(
      'configureSSO.configureStep.samlCustom.createAppStep.serviceProviderFields.spEntityId.label',
    ),
    isRequired: false,
  });
  return { goNext, goPrev, isFirstStep, isLastStep, acsUrlField, spEntityIdField };
};
