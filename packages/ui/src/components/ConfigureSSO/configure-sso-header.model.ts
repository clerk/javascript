import { useUnsafeModalContext } from '@/elements/Modal';

import { useWizard } from './elements/Wizard';

export const useConfigureSSOHeaderModel = () => {
  const { activeSteps, currentIndex, goToStep } = useWizard();
  const { toggle } = useUnsafeModalContext();
  return { activeSteps, currentIndex, goToStep, isModal: Boolean(toggle) };
};
