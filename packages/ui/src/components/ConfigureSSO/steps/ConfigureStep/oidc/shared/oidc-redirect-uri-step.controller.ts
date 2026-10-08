import { localizationKeys } from '@/customizables';
import { useFormControl } from '@/ui/utils/useFormControl';

import { useWizard } from '../../../../elements/Wizard';

export const useOidcRedirectUriStepController = (redirectUri: string) => {
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();
  const redirectUriField = useFormControl('redirectUri', redirectUri, {
    type: 'text',
    label: localizationKeys('configureSSO.configureStep.oidcCustom.redirectUriStep.redirectUri.label'),
    isRequired: false,
  });
  return { goNext, goPrev, isFirstStep, isLastStep, redirectUriField };
};
