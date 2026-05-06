import React from 'react';

import { Col, descriptors } from '@/customizables';
import { Route, Switch, useRouter } from '@/router';

import { useConfigureSSOFlow } from '../../ConfigureSSOContext';
import { FooterActionsProvider, useRegisterWizard } from './FooterActionsContext';
import type { WizardActiveStep, WizardContextValue, WizardStepProps } from './types';
import { WizardContext } from './WizardContext';

const Step = (_: WizardStepProps): JSX.Element | null => null;
Step.displayName = 'Wizard.Step';

interface RootProps {
  children: React.ReactNode;
}

/**
 * Walks the wizard's children and returns the descriptors for every
 * `<Wizard.Step>` element
 */
function extractSteps(children: React.ReactNode): WizardActiveStep[] {
  const steps: WizardActiveStep[] = [];

  React.Children.forEach(children, child => {
    if (!React.isValidElement(child)) {
      return;
    }

    // Tolerate fragments at the top level (e.g. when users factor a
    // group of steps into a helper component that returns one)
    if (child.type === React.Fragment) {
      const fragmentChildren = (child.props as { children?: React.ReactNode }).children;
      steps.push(...extractSteps(fragmentChildren));
      return;
    }

    if (child.type !== Step) {
      return;
    }

    const props = child.props as WizardStepProps;
    steps.push({
      id: props.id,
      path: props.path,
      label: props.label,
      isCompleted: props.isCompleted,
      children: props.children,
    });
  });

  return steps;
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
  const router = useRouter();
  const flow = useConfigureSSOFlow();
  const { isLoading } = flow;

  const activeSteps = React.useMemo(() => extractSteps(children), [children]);

  // Match the URL against non-first steps (most-specific first), the
  // first step is mounted as the index route and is always the
  // fallback when nothing else matches
  const currentStep = React.useMemo<WizardActiveStep | undefined>(() => {
    if (activeSteps.length === 0) {
      return undefined;
    }

    return (
      activeSteps
        .slice(1)
        .reverse()
        .find(s => router.matches(s.path)) ?? activeSteps[0]
    );
  }, [activeSteps, router]);

  const buildPath = React.useCallback(
    (step: WizardActiveStep): string => {
      const isFirst = activeSteps[0]?.id === step.id;
      return isFirst ? './' : step.path;
    },
    [activeSteps],
  );

  const navigateTo = React.useCallback(
    (step: WizardActiveStep | undefined) => (step ? router.navigate(buildPath(step)) : undefined),
    [router, buildPath],
  );

  const goNext = React.useCallback(() => {
    if (!currentStep) {
      return;
    }

    const index = activeSteps.findIndex(s => s.id === currentStep.id);
    const next = activeSteps[index + 1];
    if (next) {
      return navigateTo(next);
    }

    return parentWizard?.goNext();
  }, [activeSteps, currentStep, navigateTo, parentWizard]);

  const goPrev = React.useCallback(() => {
    if (!currentStep) {
      return;
    }

    const index = activeSteps.findIndex(s => s.id === currentStep.id);
    const prev = activeSteps[index - 1];
    if (prev) {
      return navigateTo(prev);
    }

    return parentWizard?.goPrev();
  }, [activeSteps, currentStep, navigateTo, parentWizard]);

  const goToStep = React.useCallback(
    (id: string) => navigateTo(activeSteps.find(s => s.id === id)),
    [activeSteps, navigateTo],
  );

  const value = React.useMemo<WizardContextValue>(() => {
    const index = currentStep ? activeSteps.findIndex(s => s.id === currentStep.id) : -1;
    return {
      activeSteps,
      currentStep,
      currentIndex: index,
      totalSteps: activeSteps.length,
      isLoading,
      goNext,
      goPrev,
      goToStep,
      isNested,
      isFirstStep: index <= 0 && (!parentWizard || parentWizard.isFirstStep),
      isLastStep: index === activeSteps.length - 1 && (!parentWizard || parentWizard.isLastStep),
    };
  }, [activeSteps, currentStep, isLoading, goNext, goPrev, goToStep, isNested, parentWizard]);

  // Push this wizard onto the chrome stack so the shared footer can
  // dispatch Continue / Previous to the *deepest* mounted wizard,
  // not just the outermost one
  useRegisterWizard(value);

  if (activeSteps.length === 0) {
    return <WizardContext.Provider value={value}>{null}</WizardContext.Provider>;
  }

  const [firstStep, ...restSteps] = activeSteps;

  // The Wizard root is UI-less: no header, no footer, no step
  // indicator. It only provides navigation context and renders the
  // active step's children inside a Switch/Route so nested wizards
  // get a scoped RouteContext
  return (
    <WizardContext.Provider value={value}>
      <Switch>
        {restSteps.map(step => (
          <Route
            key={step.id}
            path={step.path}
          >
            <Col
              elementDescriptor={descriptors.configureSSOWizardBody}
              elementId={descriptors.configureSSOWizardBody.setId(step.id)}
              sx={{ flex: 1, minHeight: 0 }}
            >
              {step.children}
            </Col>
          </Route>
        ))}
        <Route key={firstStep.id}>
          <Col
            elementDescriptor={descriptors.configureSSOWizardBody}
            elementId={descriptors.configureSSOWizardBody.setId(firstStep.id)}
            sx={{ flex: 1, minHeight: 0 }}
          >
            {firstStep.children}
          </Col>
        </Route>
      </Switch>
    </WizardContext.Provider>
  );
};

/**
 * Declarative wizard primitive — UI-less.
 *
 * Steps are written as JSX children: render a `<Wizard.Step>` for
 * each step and toggle visibility with regular conditional
 * expressions (`{cond && <Step>...</Step>}`)
 *
 * Inner sub-steps are declared by nesting another `<Wizard>` inside
 * a step's body
 *
 * The Wizard root renders no chrome — Header, Footer, and any step
 * indicator are provided by the host layout via `useWizard()` and
 * `useFooterActions()`
 */
export const Wizard = Object.assign(Root, {
  Step,
});
