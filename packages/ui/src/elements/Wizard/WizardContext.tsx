import React from 'react';

import type { ContinueAction, WizardContextValue, WizardStep } from './types';

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
  goNext: WizardContextValue<TData>['goNext'];
  goPrev: WizardContextValue<TData>['goPrev'];
  goToStep: WizardContextValue<TData>['goToStep'];
  children: React.ReactNode;
}

export function WizardProvider<TData>(props: WizardProviderProps<TData>): JSX.Element {
  const { activeSteps, currentStep, goNext, goPrev, goToStep, children } = props;

  const [continueAction, setContinueAction] = React.useState<ContinueAction | undefined>(undefined);

  // Reset the registered continue action whenever the active step changes,
  // so that a stale handler from a previous step never lingers.
  React.useEffect(() => {
    setContinueAction(undefined);
  }, [currentStep?.id]);

  const value = React.useMemo<WizardContextValue<TData>>(() => {
    const currentIndex = currentStep ? activeSteps.findIndex(s => s.id === currentStep.id) : -1;
    return {
      activeSteps,
      currentStep,
      currentIndex,
      totalSteps: activeSteps.length,
      isFirstStep: currentIndex === 0,
      isLastStep: currentIndex === activeSteps.length - 1,
      goNext,
      goPrev,
      goToStep,
      continueAction,
      setContinueAction,
    };
  }, [activeSteps, currentStep, goNext, goPrev, goToStep, continueAction]);

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
}

/**
 * Helper for step components that need to register a Continue action.
 *
 * The `handler` is forwarded through a ref so a fresh closure on each
 * render does not retrigger the effect (which would cause an infinite
 * loop, since updating the registered action re-renders consumers and
 * therefore the step itself). State-shaped fields like `isDisabled` /
 * `isLoading` / `label` are watched as primitives and re-publish the
 * action when they change.
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
  // clear the registered action.
  React.useEffect(() => {
    return () => setContinueAction(undefined);
  }, [setContinueAction]);
}
