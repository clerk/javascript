import { useWizard } from '../../elements/Wizard';

export const useConfigureStepController = () => {
  const { direction } = useWizard();
  return { initialStepId: direction === 1 ? 'select-provider' : undefined };
};
