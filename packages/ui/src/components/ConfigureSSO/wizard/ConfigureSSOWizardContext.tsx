import React from 'react';

import type {
  ConfigureSSOWizardContextValue,
  ConfigureSSOWizardInnerStep,
  ConfigureSSOWizardStep,
  ContinueAction,
} from './types';

const ConfigureSSOWizardContext = React.createContext<ConfigureSSOWizardContextValue | null>(null);
ConfigureSSOWizardContext.displayName = 'ConfigureSSOWizardContext';

export function useConfigureSSOWizard(): ConfigureSSOWizardContextValue {
  const ctx = React.useContext(ConfigureSSOWizardContext);

  if (!ctx) {
    throw new Error('useConfigureSSOWizard called outside of <ConfigureSSOWizard.Root>');
  }

  return ctx;
}

interface ConfigureSSOWizardProviderProps {
  activeSteps: ConfigureSSOWizardStep[];
  currentStep: ConfigureSSOWizardStep | undefined;
  innerSteps: ConfigureSSOWizardInnerStep[];
  currentInnerStep: ConfigureSSOWizardInnerStep | undefined;
  isLoading: boolean;
  goNext: ConfigureSSOWizardContextValue['goNext'];
  goPrev: ConfigureSSOWizardContextValue['goPrev'];
  goToStep: ConfigureSSOWizardContextValue['goToStep'];
  children: React.ReactNode;
}

export function ConfigureSSOWizardProvider(props: ConfigureSSOWizardProviderProps): JSX.Element {
  const { activeSteps, currentStep, innerSteps, currentInnerStep, isLoading, goNext, goPrev, goToStep, children } =
    props;

  const [continueAction, setContinueAction] = React.useState<ContinueAction | undefined>(undefined);

  // Clear stale continue actions when the active (inner) step changes
  React.useEffect(() => {
    setContinueAction(undefined);
  }, [currentStep?.id, currentInnerStep?.id]);

  const value = React.useMemo<ConfigureSSOWizardContextValue>(() => {
    const currentIndex = currentStep ? activeSteps.findIndex(s => s.id === currentStep.id) : -1;
    const currentInnerIndex = currentInnerStep ? innerSteps.findIndex(s => s.id === currentInnerStep.id) : -1;
    const totalInnerSteps = innerSteps.length;
    const hasInnerSteps = totalInnerSteps > 0;

    const isFirstStep = currentIndex === 0 && (!hasInnerSteps || currentInnerIndex <= 0);
    const isLastStep =
      currentIndex === activeSteps.length - 1 && (!hasInnerSteps || currentInnerIndex === totalInnerSteps - 1);

    return {
      activeSteps,
      currentStep,
      currentIndex,
      totalSteps: activeSteps.length,
      innerSteps,
      currentInnerStep,
      currentInnerIndex,
      totalInnerSteps,
      isFirstStep,
      isLastStep,
      isLoading,
      goNext,
      goPrev,
      goToStep,
      continueAction,
      setContinueAction,
    };
  }, [activeSteps, currentStep, innerSteps, currentInnerStep, isLoading, goNext, goPrev, goToStep, continueAction]);

  return <ConfigureSSOWizardContext.Provider value={value}>{children}</ConfigureSSOWizardContext.Provider>;
}

/**
 * Helper for step components that need to register a Continue action
 */
export function useRegisterContinueAction(action: ContinueAction | undefined): void {
  const { setContinueAction } = useConfigureSSOWizard();

  const handlerRef = React.useRef<ContinueAction['handler'] | undefined>(action?.handler);
  handlerRef.current = action?.handler;

  const hasAction = action !== undefined;
  const isDisabled = action?.isDisabled;
  const isLoading = action?.isLoading;
  const label = action?.label;

  React.useEffect(() => {
    if (!hasAction) {
      setContinueAction(undefined);
      return;
    }

    setContinueAction({
      handler: () => handlerRef.current?.(),
      isDisabled,
      isLoading,
      label,
    });
  }, [hasAction, isDisabled, isLoading, label, setContinueAction]);

  // Separate unmount-only cleanup, so dep changes above don't transiently
  // clear the registered action
  React.useEffect(() => {
    return () => setContinueAction(undefined);
  }, [setContinueAction]);
}
