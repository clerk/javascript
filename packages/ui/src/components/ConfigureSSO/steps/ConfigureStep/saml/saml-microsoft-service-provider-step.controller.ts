import { localizationKeys } from '@/customizables';
import { useFormControl } from '@/ui/utils/useFormControl';

import { useWizard } from '../../../elements/Wizard';

export const useSamlMicrosoftServiceProviderStepController = (acsUrl: string, spEntityId: string) => {
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();
  const spEntityIdField = useFormControl('spEntityId', spEntityId, {
    type: 'text',
    label: localizationKeys(
      'configureSSO.configureStep.samlMicrosoft.serviceProviderStep.serviceProviderFields.spEntityId.label',
    ),
    isRequired: false,
  });
  const acsUrlField = useFormControl('acsUrl', acsUrl, {
    type: 'text',
    label: localizationKeys(
      'configureSSO.configureStep.samlMicrosoft.serviceProviderStep.serviceProviderFields.acsUrl.label',
    ),
    isRequired: false,
  });
  return { goNext, goPrev, isFirstStep, isLastStep, spEntityIdField, acsUrlField };
};
