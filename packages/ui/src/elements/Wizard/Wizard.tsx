import React from 'react';

import { Badge, Box, Button, descriptors, Flex, Icon, Spinner, Text, useLocalizations } from '@/customizables';
import { CaretLeft, CaretRight } from '@/icons';
import { Route, Switch, useRouter } from '@/router';

import type { WizardInnerStep, WizardStep } from './types';
import { useWizard, WizardProvider } from './WizardContext';

interface WizardRootProps<TData = unknown> {
  steps: ReadonlyArray<WizardStep<TData>>;
  /**
   * Optional data passed to each step's `shouldSkip` predicate. When the
   * referenced shape changes, the active step list is recomputed
   */
  data?: TData;
  /**
   * `true` while the parent flow is still loading async dependencies.
   * The header renders a skeleton breadcrumb, the content renders a
   * centered spinner, and the footer's buttons are disabled
   */
  isLoading?: boolean;
  children: React.ReactNode;
}

const Root = <TData,>(props: WizardRootProps<TData>): JSX.Element => {
  const { steps, data, isLoading = false, children } = props;
  const router = useRouter();

  const activeSteps = React.useMemo(() => steps.filter(s => !s.shouldSkip?.(data as TData)), [steps, data]);

  const getActiveInnerSteps = React.useCallback(
    (step: WizardStep<TData> | undefined): WizardInnerStep<TData>[] =>
      step?.innerSteps?.filter(s => !s.shouldSkip?.(data as TData)) ?? [],
    [data],
  );

  const currentStep = React.useMemo<WizardStep<TData> | undefined>(() => {
    if (activeSteps.length === 0) {
      return undefined;
    }

    // Match the URL against non-first main steps (most-specific first),
    // the first main step is mounted as the wizard's catch-all and is
    // always the fallback
    return (
      activeSteps
        .slice(1)
        .reverse()
        .find(s => router.matches(s.path)) ?? activeSteps[0]
    );
  }, [activeSteps, router]);

  const innerSteps = React.useMemo(() => getActiveInnerSteps(currentStep), [currentStep, getActiveInnerSteps]);

  // Builds a path relative to the wizard base. The first main step
  // is the catch-all, the first inner step of any main
  // step is its parent's index route (no segment)
  const buildPath = React.useCallback(
    (mainStep: WizardStep<TData>, innerStep?: WizardInnerStep<TData>): string => {
      const inners = getActiveInnerSteps(mainStep);
      const target = innerStep ?? inners[0];
      const isFirstMain = activeSteps[0]?.id === mainStep.id;
      const isFirstInner = !target || inners[0]?.id === target.id;
      const segments = [isFirstMain ? '' : mainStep.path, isFirstInner ? '' : target.path].filter(Boolean);
      return segments.join('/') || './';
    },
    [activeSteps, getActiveInnerSteps],
  );

  const currentInnerStep = React.useMemo<WizardInnerStep<TData> | undefined>(() => {
    if (!currentStep || innerSteps.length === 0) {
      return undefined;
    }

    return (
      innerSteps
        .slice(1)
        .reverse()
        .find(s => router.matches(buildPath(currentStep, s))) ?? innerSteps[0]
    );
  }, [currentStep, innerSteps, router, buildPath]);

  const navigateTo = React.useCallback(
    (mainStep: WizardStep<TData> | undefined, innerStep?: WizardInnerStep<TData>) =>
      mainStep ? router.navigate(buildPath(mainStep, innerStep)) : undefined,
    [router, buildPath],
  );

  const goNext = React.useCallback(() => {
    if (!currentStep) {
      return;
    }

    const innerIndex = innerSteps.findIndex(s => s.id === currentInnerStep?.id);
    if (innerIndex >= 0 && innerIndex < innerSteps.length - 1) {
      return navigateTo(currentStep, innerSteps[innerIndex + 1]);
    }

    const mainIndex = activeSteps.findIndex(s => s.id === currentStep.id);
    return navigateTo(activeSteps[mainIndex + 1]);
  }, [activeSteps, currentStep, currentInnerStep, innerSteps, navigateTo]);

  const goPrev = React.useCallback(() => {
    if (!currentStep) {
      return;
    }

    const innerIndex = innerSteps.findIndex(s => s.id === currentInnerStep?.id);
    if (innerIndex > 0) {
      return navigateTo(currentStep, innerSteps[innerIndex - 1]);
    }

    const mainIndex = activeSteps.findIndex(s => s.id === currentStep.id);
    const prevMain = activeSteps[mainIndex - 1];
    if (!prevMain) {
      return;
    }

    // Land on the previous main step's last inner step
    const prevInners = getActiveInnerSteps(prevMain);
    return navigateTo(prevMain, prevInners[prevInners.length - 1]);
  }, [activeSteps, currentStep, currentInnerStep, innerSteps, navigateTo, getActiveInnerSteps]);

  const goToStep = React.useCallback(
    (id: string) => navigateTo(activeSteps.find(s => s.id === id)),
    [activeSteps, navigateTo],
  );

  return (
    <WizardProvider
      activeSteps={activeSteps}
      currentStep={currentStep}
      innerSteps={innerSteps}
      currentInnerStep={currentInnerStep}
      isLoading={isLoading}
      goNext={goNext}
      goPrev={goPrev}
      goToStep={goToStep}
    >
      {children}
    </WizardProvider>
  );
};

/**
 * Renders a container step's inner sub-routes, or falls back to the
 * step's own `Component` for leaf steps
 */
const StepRoutes = <TData,>({ step }: { step: WizardStep<TData> }): JSX.Element | null => {
  const Component = step.Component;
  if (!step.innerSteps?.length) {
    return Component ? <Component /> : null;
  }
  return (
    <Switch>
      {step.innerSteps.map((inner, i) => {
        const InnerComponent = inner.Component;
        return (
          <Route
            key={inner.id}
            {...(i === 0 ? { index: true } : { path: inner.path })}
          >
            <InnerComponent />
          </Route>
        );
      })}
    </Switch>
  );
};

/**
 * Renders the active step. Non-first main steps are routed by their
 * `path`, the first main step is mounted last as a path-less, index-
 * less catch-all so it owns the wizard's base URL *and* any URL that
 * doesn't match another main step (e.g. its own inner-step paths)
 */
const Content = (): JSX.Element | null => {
  const { activeSteps, isLoading } = useWizard();

  if (isLoading) {
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
          <StepRoutes step={step} />
        </Route>
      ))}
      <Route key={firstStep.id}>
        <StepRoutes step={firstStep} />
      </Route>
    </Switch>
  );
};

/**
 * Numbered breadcrumb of all active steps. Completed and current steps
 * are clickable for backwards navigation, future steps are disabled
 */
const Header = (): JSX.Element => {
  const { activeSteps, currentIndex, isLoading, goToStep } = useWizard();
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
        const label = typeof step.label === 'string' ? step.label : t(step.label);

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
                  {label}
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
 * Compact "Step X / Y" badge that tracks the current main step's
 * inner-step progress. Renders nothing when the current step has no
 * inner steps — that's the signal that the parent layout doesn't
 * need to reserve room for it
 */
const StepIndicator = (): JSX.Element | null => {
  const { totalInnerSteps, currentInnerIndex } = useWizard();

  if (totalInnerSteps <= 0 || currentInnerIndex < 0) {
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
          Step {currentInnerIndex + 1}/{totalInnerSteps}
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
   * Override label for the Continue button (also overridable per step
   * via `setContinueAction({ label })`)
   */
  continueLabel?: string;
  /**
   * Hides the Previous button entirely (e.g. on the first step you may
   * still want to keep it disabled rather than hidden — that is the
   * default)
   */
  hidePrevious?: boolean;
  /**
   * Force-disables both Previous and Continue regardless of the
   * wizard's own state. Useful while async dependencies of the flow
   * are still loading
   */
  isDisabled?: boolean;
}

/**
 * Shared Previous / Continue footer. Continue dispatches to the
 * currently registered step `ContinueAction` if any, otherwise it
 * simply advances to the next step
 */
const Footer = (props: FooterProps): JSX.Element => {
  const { previousLabel = 'Previous', continueLabel = 'Continue', hidePrevious = false, isDisabled = false } = props;
  const { isFirstStep, isLastStep, isLoading, goPrev, goNext, continueAction } = useWizard();
  const isForceDisabled = isDisabled || isLoading;
  const { t } = useLocalizations();

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

    void goNext();
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
          onClick={() => void goPrev()}
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

export const Wizard = {
  Root,
  Header,
  Content,
  Footer,
  StepIndicator,
};
