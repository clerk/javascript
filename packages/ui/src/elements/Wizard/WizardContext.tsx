import React from 'react';

import type { ContinueAction, WizardContextValue, WizardInnerStep, WizardStep } from './types';

const WizardContext = React.createContext<WizardContextValue<any> | null>(null);
WizardContext.displayName = 'WizardContext';

export function useWizard<TData = unknown>(): WizardContextValue<TData> {
  const ctx = React.useContext(WizardContext);
  if (!ctx) {
    throw new Error('useWizard called outside of <Wizard.Root>.');
  }
  return ctx as WizardContextValue<TData>;
}

interface WizardProviderProps<TData> {
  activeSteps: WizardStep<TData>[];
  currentStep: WizardStep<TData> | undefined;
  innerSteps: WizardInnerStep<TData>[];
  currentInnerStep: WizardInnerStep<TData> | undefined;
  goNext: WizardContextValue<TData>['goNext'];
  goPrev: WizardContextValue<TData>['goPrev'];
  goToStep: WizardContextValue<TData>['goToStep'];
  children: React.ReactNode;
}

export function WizardProvider<TData>(props: WizardProviderProps<TData>): JSX.Element {
  const { activeSteps, currentStep, innerSteps, currentInnerStep, goNext, goPrev, goToStep, children } = props;

  const [continueAction, setContinueAction] = React.useState<ContinueAction | undefined>(undefined);

  // Clear stale continue actions when the active (inner) step changes
  React.useEffect(() => {
    setContinueAction(undefined);
  }, [currentStep?.id, currentInnerStep?.id]);

  const value = React.useMemo<WizardContextValue<TData>>(() => {
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
      goNext,
      goPrev,
      goToStep,
      continueAction,
      setContinueAction,
    };
  }, [activeSteps, currentStep, innerSteps, currentInnerStep, goNext, goPrev, goToStep, continueAction]);

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
}

/**
 * Helper for step components that need to register a Continue action
 */
export function useRegisterContinueAction(action: ContinueAction | undefined): void {
  const { setContinueAction } = useWizard();

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
