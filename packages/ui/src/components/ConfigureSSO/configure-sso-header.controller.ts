import type { useConfigureSSOHeaderModel } from './configure-sso-header.model';

export const useConfigureSSOHeaderController = (model: ReturnType<typeof useConfigureSSOHeaderModel>) => {
  const { activeSteps, currentIndex, goToStep, isModal } = model;
  // Breadcrumb membership = labelled steps. `select-provider` has no label, so
  // it is absent from the visual stepper while remaining a real navigable step.
  const visibleSteps = activeSteps.filter(step => step.label);
  const currentVisibleIndex = visibleSteps.findIndex(step => activeSteps[currentIndex]?.id === step.id);
  return { visibleSteps, currentVisibleIndex, goToStep, isModal };
};
