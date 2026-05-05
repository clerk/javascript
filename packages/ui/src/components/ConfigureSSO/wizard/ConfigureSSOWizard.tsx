import React from 'react';

import { Badge, Box, Button, descriptors, Flex, Icon, Spinner, Text, useLocalizations } from '@/customizables';
import { CaretLeft, CaretRight } from '@/icons';
import { Route, Switch, useRouter } from '@/router';

import { useConfigureSSOFlow } from '../ConfigureSSOContext';
import {
  ConfigureSSOWizardContext,
  useConfigureSSOWizard,
  useRegisterWizard,
  useWizardChromeRegistry,
  WizardChromeProvider,
} from './ConfigureSSOWizardContext';
import type {
  ConfigureSSOWizardActiveStep,
  ConfigureSSOWizardContextValue,
  ConfigureSSOWizardStepProps,
} from './types';

/**
 * Marker component for a single step in `<ConfigureSSOWizard>`. The
 * parent wizard reads its props directly off the JSX element; the
 * component itself never renders independently
 */
const Step = (_: ConfigureSSOWizardStepProps): JSX.Element | null => null;
Step.displayName = 'ConfigureSSOWizard.Step';

interface RootProps {
  children: React.ReactNode;
}

/**
 * Walks the wizard's children and returns the descriptors for every
 * `<ConfigureSSOWizard.Step>` element. Anything else (`false` from
 * `&&`, plain text, fragments, etc.) is silently ignored, so
 * conditional rendering in JSX naturally drives "skipping"
 */
function extractSteps(children: React.ReactNode): ConfigureSSOWizardActiveStep[] {
  const steps: ConfigureSSOWizardActiveStep[] = [];

  React.Children.forEach(children, child => {
    if (!React.isValidElement(child)) return;
    // Tolerate fragments at the top level (e.g. when users factor a
    // group of steps into a helper component that returns one)
    if (child.type === React.Fragment) {
      const fragmentChildren = (child.props as { children?: React.ReactNode }).children;
      steps.push(...extractSteps(fragmentChildren));
      return;
    }
    if (child.type !== Step) return;
    const props = child.props as ConfigureSSOWizardStepProps;
    steps.push({
      id: props.id,
      path: props.path,
      label: props.label,
      children: props.children,
    });
  });

  return steps;
}

const Root = ({ children }: RootProps): JSX.Element => {
  const parentWizard = React.useContext(ConfigureSSOWizardContext);
  const isNested = parentWizard !== null;

  // Outermost wizard owns the shared chrome registry. Nested wizards
  // reuse whatever the outer one provided, so registrations bubble up
  if (!isNested) {
    return (
      <WizardChromeProvider>
        <RootInner
          parentWizard={null}
          isNested={false}
        >
          {children}
        </RootInner>
      </WizardChromeProvider>
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
  parentWizard: ConfigureSSOWizardContextValue | null;
  isNested: boolean;
  children: React.ReactNode;
}

const RootInner = ({ parentWizard, isNested, children }: RootInnerProps): JSX.Element => {
  const router = useRouter();
  const flow = useConfigureSSOFlow();
  const { isLoading } = flow;

  const activeSteps = React.useMemo(() => extractSteps(children), [children]);

  // Match the URL against non-first steps (most-specific first); the
  // first step is mounted as the index route and is always the
  // fallback when nothing else matches
  const currentStep = React.useMemo<ConfigureSSOWizardActiveStep | undefined>(() => {
    if (activeSteps.length === 0) return undefined;
    return (
      activeSteps
        .slice(1)
        .reverse()
        .find(s => router.matches(s.path)) ?? activeSteps[0]
    );
  }, [activeSteps, router]);

  const buildPath = React.useCallback(
    (step: ConfigureSSOWizardActiveStep): string => {
      const isFirst = activeSteps[0]?.id === step.id;
      return isFirst ? './' : step.path;
    },
    [activeSteps],
  );

  const navigateTo = React.useCallback(
    (step: ConfigureSSOWizardActiveStep | undefined) => (step ? router.navigate(buildPath(step)) : undefined),
    [router, buildPath],
  );

  const goNext = React.useCallback(() => {
    if (!currentStep) return;
    const idx = activeSteps.findIndex(s => s.id === currentStep.id);
    const next = activeSteps[idx + 1];
    if (next) return navigateTo(next);
    // End of *this* wizard's siblings → cascade to the parent so
    // the outer wizard advances past us to the next outer step
    return parentWizard?.goNext();
  }, [activeSteps, currentStep, navigateTo, parentWizard]);

  const goPrev = React.useCallback(() => {
    if (!currentStep) return;
    const idx = activeSteps.findIndex(s => s.id === currentStep.id);
    const prev = activeSteps[idx - 1];
    if (prev) return navigateTo(prev);
    // At the first sibling — defer to the parent so the user can
    // step back into the previous outer step's last position
    return parentWizard?.goPrev();
  }, [activeSteps, currentStep, navigateTo, parentWizard]);

  const goToStep = React.useCallback(
    (id: string) => navigateTo(activeSteps.find(s => s.id === id)),
    [activeSteps, navigateTo],
  );

  const value = React.useMemo<ConfigureSSOWizardContextValue>(() => {
    const idx = currentStep ? activeSteps.findIndex(s => s.id === currentStep.id) : -1;
    return {
      activeSteps,
      currentStep,
      currentIndex: idx,
      totalSteps: activeSteps.length,
      // First/last only count as edges when there's nothing past us
      // to fall back on (otherwise the parent wizard absorbs the move)
      isFirstStep: idx <= 0 && !parentWizard,
      isLastStep: idx === activeSteps.length - 1 && !parentWizard,
      isLoading,
      goNext,
      goPrev,
      goToStep,
      isNested,
    };
  }, [activeSteps, currentStep, isLoading, goNext, goPrev, goToStep, isNested, parentWizard]);

  // Push this wizard onto the chrome stack so the shared footer can
  // dispatch Continue / Previous to the *deepest* mounted wizard,
  // not just the outermost one
  useRegisterWizard(value);

  const body = <Body activeSteps={activeSteps} />;

  if (isNested) {
    // Nested wizards plug into the parent's chrome; they only own
    // the inner routing for their step's body
    return <ConfigureSSOWizardContext.Provider value={value}>{body}</ConfigureSSOWizardContext.Provider>;
  }

  // Outermost wizard owns the full layout: breadcrumb on top, the
  // step body in the middle, the shared footer at the bottom
  return (
    <ConfigureSSOWizardContext.Provider value={value}>
      <Header />
      {body}
      <Footer />
    </ConfigureSSOWizardContext.Provider>
  );
};

/**
 * Renders the active step's body (or a spinner while async deps are
 * loading). Each step is mounted at its `path`; the first step is the
 * index/catch-all so the wizard's base URL renders something
 */
const Body = ({ activeSteps }: { activeSteps: ConfigureSSOWizardActiveStep[] }): JSX.Element | null => {
  const { isLoading, isNested } = useConfigureSSOWizard();

  if (isLoading) {
    if (isNested) return null;
    return (
      <Flex
        align='center'
        justify='center'
        sx={{ flex: 1 }}
      >
        <Spinner
          size='xs'
          colorScheme='neutral'
          elementDescriptor={descriptors.spinner}
        />
      </Flex>
    );
  }

  if (activeSteps.length === 0) {
    return null;
  }

  const [firstStep, ...restSteps] = activeSteps;

  return (
    <Switch>
      {restSteps.map(step => (
        <Route
          key={step.id}
          path={step.path}
        >
          {step.children}
        </Route>
      ))}
      <Route key={firstStep.id}>{firstStep.children}</Route>
    </Switch>
  );
};

/**
 * Numbered breadcrumb of the outermost wizard's active steps.
 * Completed and current steps are clickable for backwards navigation,
 * future steps are disabled
 */
const Header = (): JSX.Element => {
  const { activeSteps, currentIndex, isLoading, goToStep } = useConfigureSSOWizard();
  const { t } = useLocalizations();

  return (
    <Flex
      align='center'
      sx={theme => ({
        gap: theme.space.$2,
        padding: `${theme.space.$4} ${theme.space.$6}`,
        borderBottomWidth: theme.borderWidths.$normal,
        borderBottomStyle: theme.borderStyles.$solid,
        borderBottomColor: theme.colors.$borderAlpha100,
        flexWrap: 'wrap',
      })}
    >
      {activeSteps.map((step, index) => {
        const isCurrent = index === currentIndex;
        const isCompleted = index < currentIndex;
        const isReachable = index <= currentIndex;
        const labelText = step.label ? (typeof step.label === 'string' ? step.label : t(step.label)) : '';

        return (
          <React.Fragment key={step.id}>
            {isLoading ? (
              <SkeletonBreadcrumbStep />
            ) : (
              <Button
                variant='unstyled'
                isDisabled={!isReachable}
                onClick={() => {
                  if (isReachable) {
                    void goToStep(step.id);
                  }
                }}
                sx={theme => ({
                  gap: theme.space.$1x5,
                  padding: 0,
                  color: isCurrent ? theme.colors.$colorForeground : theme.colors.$colorMutedForeground,
                })}
              >
                <Flex
                  align='center'
                  justify='center'
                  sx={theme => ({
                    width: theme.sizes.$5,
                    height: theme.sizes.$5,
                    borderRadius: theme.radii.$circle,
                    fontSize: theme.fontSizes.$xs,
                    fontWeight: theme.fontWeights.$semibold,
                    backgroundColor: isCurrent
                      ? theme.colors.$colorForeground
                      : isCompleted
                        ? theme.colors.$neutralAlpha200
                        : theme.colors.$neutralAlpha100,
                    color: isCurrent ? theme.colors.$colorBackground : theme.colors.$colorMutedForeground,
                  })}
                >
                  {index + 1}
                </Flex>
                <Text
                  as='span'
                  variant='body'
                  sx={{ fontWeight: 'inherit', color: 'inherit' }}
                >
                  {labelText}
                </Text>
              </Button>
            )}
            {index < activeSteps.length - 1 && (
              <Icon
                icon={CaretRight}
                size='sm'
                sx={theme => ({ color: theme.colors.$colorMutedForeground })}
              />
            )}
          </React.Fragment>
        );
      })}
    </Flex>
  );
};

const SkeletonBreadcrumbStep = (): JSX.Element => (
  <Flex
    align='center'
    sx={t => ({ gap: t.space.$1x5 })}
  >
    <Box
      sx={t => ({
        width: t.sizes.$5,
        height: t.sizes.$5,
        borderRadius: t.radii.$circle,
        backgroundColor: t.colors.$neutralAlpha100,
      })}
    />
    <Box
      sx={t => ({
        width: t.sizes.$16,
        height: t.space.$3,
        borderRadius: t.radii.$md,
        backgroundColor: t.colors.$neutralAlpha100,
      })}
    />
  </Flex>
);

/**
 * Compact "Step X / Y" badge that mirrors the *nearest* wizard's
 * progress. Renders nothing when the nearest wizard has only one
 * step (i.e. there's nothing meaningful to count). Drop this inside
 * an inner wizard's step layout to surface inner-step progress
 */
const StepIndicator = (): JSX.Element | null => {
  const { totalSteps, currentIndex } = useConfigureSSOWizard();

  if (totalSteps <= 1 || currentIndex < 0) {
    return null;
  }

  return (
    <Flex sx={{ marginBottom: 'auto' }}>
      <Badge
        colorScheme='primary'
        sx={{
          whiteSpace: 'nowrap',
        }}
      >
        <Text
          as='span'
          sx={t => ({ fontSize: t.fontSizes.$xs })}
        >
          Step {currentIndex + 1}/{totalSteps}
        </Text>
      </Badge>
    </Flex>
  );
};

interface FooterProps {
  /**
   * Override label for the Previous button
   */
  previousLabel?: string;
  /**
   * Override label for the Continue button (also overridable per
   * step via `useRegisterContinueAction({ label })`)
   */
  continueLabel?: string;
  /**
   * Hides the Previous button entirely
   */
  hidePrevious?: boolean;
  /**
   * Force-disables both Previous and Continue regardless of the
   * wizard's own state
   */
  isDisabled?: boolean;
}

/**
 * Shared Previous / Continue footer. Owned by the outermost wizard.
 * Continue dispatches to the currently registered step `ContinueAction`
 * if any; otherwise it advances the outermost wizard
 */
const Footer = (props: FooterProps): JSX.Element => {
  const { previousLabel = 'Previous', continueLabel = 'Continue', hidePrevious = false, isDisabled = false } = props;
  const { isLoading } = useConfigureSSOWizard();
  const { continueAction, deepestWizardRef } = useWizardChromeRegistry();
  const isForceDisabled = isDisabled || isLoading;
  const { t } = useLocalizations();

  // Footer-level controls always dispatch to the deepest mounted
  // wizard. That way Previous from the second inner sub-step lands
  // on the first inner sub-step instead of jumping out to the
  // previous outer step
  const deepest = deepestWizardRef.current?.current;
  const isFirstStep = deepest?.isFirstStep ?? true;
  const isLastStep = deepest?.isLastStep ?? true;

  const continueLabelToShow =
    typeof continueAction?.label === 'string'
      ? continueAction.label
      : continueAction?.label
        ? t(continueAction.label)
        : continueLabel;

  const handleContinue = () => {
    if (continueAction?.handler) {
      void continueAction.handler();
      return;
    }

    void deepestWizardRef.current?.current.goNext();
  };

  const handlePrevious = () => {
    void deepestWizardRef.current?.current.goPrev();
  };

  return (
    <Flex
      elementDescriptor={descriptors.footer}
      align='center'
      justify='end'
      sx={theme => ({
        gap: theme.space.$2,
        padding: `${theme.space.$3} ${theme.space.$6}`,
        borderTopWidth: theme.borderWidths.$normal,
        borderTopStyle: theme.borderStyles.$solid,
        borderTopColor: theme.colors.$borderAlpha100,
      })}
    >
      {!hidePrevious && (
        <Button
          variant='outline'
          size='sm'
          isDisabled={isForceDisabled || isFirstStep}
          onClick={handlePrevious}
        >
          <Icon
            icon={CaretLeft}
            size='sm'
            sx={theme => ({ marginInlineEnd: theme.space.$1 })}
          />
          {previousLabel}
        </Button>
      )}
      <Button
        variant='solid'
        size='sm'
        isDisabled={isForceDisabled || continueAction?.isDisabled || isLastStep}
        isLoading={continueAction?.isLoading}
        onClick={handleContinue}
      >
        {continueLabelToShow}
        <Icon
          icon={CaretRight}
          size='sm'
          sx={theme => ({ marginInlineStart: theme.space.$1 })}
        />
      </Button>
    </Flex>
  );
};

/**
 * Declarative wizard for the ConfigureSSO flow.
 *
 * Steps are written as JSX children: render a `<ConfigureSSOWizard.Step>`
 * for each step and toggle visibility with regular conditional
 * expressions (`{cond && <Step>...</Step>}`). Inner sub-steps are
 * declared by nesting another `<ConfigureSSOWizard>` inside a step's
 * body — the inner wizard's `goNext` cascades to the outer one when
 * it runs out of inner steps
 */
export const ConfigureSSOWizard = Object.assign(Root, {
  Step,
  StepIndicator,
});
