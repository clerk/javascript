import React from 'react';

import { FooterActionsProvider, useRegisterWizard } from './FooterActionsContext';
import type { WizardActiveStep, WizardContextValue, WizardStepProps } from './types';
import { useWizard, WizardContext } from './WizardContext';

interface RootProps {
  children: React.ReactNode;
}

const Root = ({ children }: RootProps): JSX.Element => {
  const parentWizard = React.useContext(WizardContext);
  const isNested = parentWizard !== null;

  // Outermost wizard owns the shared footer-actions registry. Nested
  // wizards reuse whatever the outer one provided, so registrations
  // bubble up
  if (!isNested) {
    return (
      <FooterActionsProvider>
        <RootInner
          parentWizard={null}
          isNested={false}
        >
          {children}
        </RootInner>
      </FooterActionsProvider>
    );
  }

  return (
    <RootInner
      parentWizard={parentWizard}
      isNested
    >
      {children}
    </RootInner>
  );
};

interface RootInnerProps {
  parentWizard: WizardContextValue | null;
  isNested: boolean;
  children: React.ReactNode;
}

const RootInner = ({ parentWizard, isNested, children }: RootInnerProps): JSX.Element => {
  // Stable registry of mounted Steps. Insertion order = JSX order =
  // display order
  const [activeSteps, setActiveSteps] = React.useState<WizardActiveStep[]>([]);
  // Active step id. Defaults to the first registered step's id
  const [currentStepId, setCurrentStepId] = React.useState<string | undefined>(undefined);

  const registerStep = React.useCallback((step: WizardActiveStep) => {
    setActiveSteps(prev => {
      const existingIndex = prev.findIndex(s => s.id === step.id);
      if (existingIndex >= 0) {
        const existing = prev[existingIndex];
        if (existing.label === step.label && existing.isCompleted === step.isCompleted) {
          return prev;
        }
        // Update descriptor in place to preserve declaration order
        const next = prev.slice();
        next[existingIndex] = step;
        return next;
      }
      return [...prev, step];
    });
    // First registered step becomes the default active step
    setCurrentStepId(prev => prev ?? step.id);
  }, []);

  const unregisterStep = React.useCallback((id: string) => {
    setActiveSteps(prev => (prev.some(s => s.id === id) ? prev.filter(s => s.id !== id) : prev));
    setCurrentStepId(prev => (prev === id ? undefined : prev));
  }, []);

  const currentStep = React.useMemo(() => activeSteps.find(s => s.id === currentStepId), [activeSteps, currentStepId]);

  const currentIndex = React.useMemo(
    () => (currentStep ? activeSteps.findIndex(s => s.id === currentStep.id) : -1),
    [activeSteps, currentStep],
  );

  const goNext = React.useCallback(() => {
    if (currentIndex < 0) {
      return;
    }
    const next = activeSteps[currentIndex + 1];
    if (next) {
      setCurrentStepId(next.id);
      return;
    }
    // Inner-last-step: bubble to parent wizard
    return parentWizard?.goNext();
  }, [activeSteps, currentIndex, parentWizard]);

  const goPrev = React.useCallback(() => {
    if (currentIndex < 0) {
      return;
    }
    const prev = activeSteps[currentIndex - 1];
    if (prev) {
      setCurrentStepId(prev.id);
      return;
    }
    return parentWizard?.goPrev();
  }, [activeSteps, currentIndex, parentWizard]);

  const goToStep = React.useCallback(
    (id: string) => {
      if (activeSteps.some(s => s.id === id)) {
        setCurrentStepId(id);
      }
    },
    [activeSteps],
  );

  const value = React.useMemo<WizardContextValue>(
    () => ({
      activeSteps,
      currentStep,
      currentIndex,
      totalSteps: activeSteps.length,
      isNested,
      isFirstStep: currentIndex <= 0 && (!parentWizard || parentWizard.isFirstStep),
      isLastStep: currentIndex === activeSteps.length - 1 && (!parentWizard || parentWizard.isLastStep),
      goNext,
      goPrev,
      goToStep,
      registerStep,
      unregisterStep,
    }),
    [
      activeSteps,
      currentStep,
      currentIndex,
      isNested,
      parentWizard,
      goNext,
      goPrev,
      goToStep,
      registerStep,
      unregisterStep,
    ],
  );

  // Push this wizard onto the chrome stack so the shared footer can
  // dispatch Continue / Previous to the *deepest* mounted wizard,
  // not just the outermost one
  useRegisterWizard(value);

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
};

const Step = ({ id, label, isCompleted, children }: WizardStepProps): JSX.Element | null => {
  const { registerStep, unregisterStep, currentStep } = useWizard();

  // Update the descriptor on every prop change. Uses `useLayoutEffect`
  // so registration commits before paint — keeps the first-frame
  // flicker imperceptible
  React.useLayoutEffect(() => {
    registerStep({ id, label, isCompleted });
  }, [id, label, isCompleted, registerStep]);

  // Separate unmount-only cleanup so descriptor updates above don't
  // transiently remove the step from the registry
  React.useLayoutEffect(() => {
    return () => unregisterStep(id);
  }, [id, unregisterStep]);

  if (currentStep?.id !== id) {
    return null;
  }
  return <>{children}</>;
};
Step.displayName = 'Wizard.Step';

/**
 * Declarative wizard primitive — UI-less, state-driven.
 *
 * Steps are written as JSX children: render a `<Wizard.Step>` for
 * each step and toggle visibility with regular conditional
 * expressions (`{cond && <Step>...</Step>}`).
 *
 * Steps register themselves with the parent wizard on mount via
 * effect, so the wizard's `activeSteps` list always reflects exactly
 * what's currently rendered. Inner sub-steps are declared by nesting
 * another `<Wizard>` inside a step's body.
 *
 * The Wizard root renders `{children}` directly — no chrome, no
 * routing, no layout wrapper. Header, Footer, and any step indicator
 * are provided by the host layout via `useWizard()` and
 * `useFooterActions()`.
 */
export const Wizard = Object.assign(Root, {
  Step,
});
