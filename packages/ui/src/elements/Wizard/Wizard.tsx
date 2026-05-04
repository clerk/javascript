import React from 'react';

import { Badge, Button, descriptors, Flex, Icon, Text, useLocalizations } from '@/customizables';
import { CaretLeft, CaretRight } from '@/icons';
import { Route, Switch, useRouter } from '@/router';

import type { WizardInnerStep, WizardStep } from './types';
import { useWizard, WizardProvider } from './WizardContext';

interface WizardRootProps<TData = unknown> {
  steps: ReadonlyArray<WizardStep<TData>>;
  /**
   * Optional data passed to each step's `shouldSkip` predicate. When the
   * referenced shape changes, the active step list is recomputed.
   */
  data?: TData;
  children: React.ReactNode;
}

const Root = <TData,>(props: WizardRootProps<TData>): JSX.Element => {
  const { steps, data, children } = props;
  const router = useRouter();

  const activeSteps = React.useMemo(() => steps.filter(step => !step.shouldSkip?.(data as TData)), [steps, data]);

  // Detect the current main step based on the URL. We iterate from the
  // last (most specific) step back to the second one — the first step
  // is the index route and always wins as a fallback.
  const currentStep = React.useMemo<WizardStep<TData> | undefined>(() => {
    if (activeSteps.length === 0) {
      return undefined;
    }
    for (let i = activeSteps.length - 1; i >= 1; i--) {
      if (router.matches(activeSteps[i].path)) {
        return activeSteps[i];
      }
    }
    return activeSteps[0];
  }, [activeSteps, router]);

  // Active inner steps of the current main step, after `shouldSkip`.
  const innerSteps = React.useMemo<WizardInnerStep<TData>[]>(() => {
    if (!currentStep?.steps) {
      return [];
    }
    return currentStep.steps.filter(step => !step.shouldSkip?.(data as TData));
  }, [currentStep, data]);

  // Detect the current inner step within the current main step using
  // the same most-specific-first scan. The first inner step is the
  // index route — it matches when no deeper path is found. The first
  // main step is the wizard's catch-all route (it has no URL prefix
  // of its own), so its inner steps live directly under the wizard
  // base; for any other main step they live under `<main.path>/`.
  const currentInnerStep = React.useMemo<WizardInnerStep<TData> | undefined>(() => {
    if (!currentStep || innerSteps.length === 0) {
      return undefined;
    }
    const isFirstMain = activeSteps[0]?.id === currentStep.id;
    for (let i = innerSteps.length - 1; i >= 1; i--) {
      const innerPath = isFirstMain ? innerSteps[i].path : `${currentStep.path}/${innerSteps[i].path}`;
      if (router.matches(innerPath)) {
        return innerSteps[i];
      }
    }
    return innerSteps[0];
  }, [activeSteps, currentStep, innerSteps, router]);

  // Resolves a navigation target to the relative path the SDK router
  // expects. The first non-skipped main step is the wizard's catch-all
  // route, so it contributes no URL segment; its inner steps live
  // directly under the wizard base. Other main steps live at their
  // own `path`, with inner steps nested under it. The first inner
  // step of any main step is its parent's index route and so lives
  // at the parent's URL.
  const resolveNavigation = React.useCallback(
    (mainStep: WizardStep<TData> | undefined, innerStep?: WizardInnerStep<TData>): string | undefined => {
      if (!mainStep) {
        return undefined;
      }
      const isFirstMain = activeSteps[0]?.id === mainStep.id;
      const innerList = mainStep.steps?.filter(s => !s.shouldSkip?.(data as TData)) ?? [];
      const targetInner = innerStep ?? innerList[0];
      const isFirstInner = !targetInner || innerList[0]?.id === targetInner.id;

      const mainSegment = isFirstMain ? '' : mainStep.path;
      const innerSegment = isFirstInner ? '' : targetInner.path;
      const segments = [mainSegment, innerSegment].filter(Boolean);
      return segments.length === 0 ? './' : segments.join('/');
    },
    [activeSteps, data],
  );

  const navigateTo = React.useCallback(
    (mainStep: WizardStep<TData> | undefined, innerStep?: WizardInnerStep<TData>) => {
      const to = resolveNavigation(mainStep, innerStep);
      if (to === undefined) {
        return;
      }
      return router.navigate(to);
    },
    [resolveNavigation, router],
  );

  const goNext = React.useCallback(() => {
    if (!currentStep) {
      return;
    }
    // Within a container step, advance through the inner steps first.
    if (innerSteps.length > 0) {
      const idx = innerSteps.findIndex(s => s.id === currentInnerStep?.id);
      if (idx >= 0 && idx < innerSteps.length - 1) {
        return navigateTo(currentStep, innerSteps[idx + 1]);
      }
    }
    // Otherwise (or after the last inner step), jump to the next main
    // step. Lands on its first inner step, if any.
    const mainIdx = activeSteps.findIndex(s => s.id === currentStep.id);
    return navigateTo(activeSteps[mainIdx + 1]);
  }, [activeSteps, currentStep, currentInnerStep, innerSteps, navigateTo]);

  const goPrev = React.useCallback(() => {
    if (!currentStep) {
      return;
    }
    if (innerSteps.length > 0) {
      const idx = innerSteps.findIndex(s => s.id === currentInnerStep?.id);
      if (idx > 0) {
        return navigateTo(currentStep, innerSteps[idx - 1]);
      }
    }
    const mainIdx = activeSteps.findIndex(s => s.id === currentStep.id);
    const prevMain = activeSteps[mainIdx - 1];
    if (!prevMain) {
      return;
    }
    // When stepping back into a container step, land on its *last*
    // inner step — that's the position the user would naturally
    // expect to revisit.
    const prevInnerList = prevMain.steps?.filter(s => !s.shouldSkip?.(data as TData)) ?? [];
    const targetInner = prevInnerList[prevInnerList.length - 1];
    return navigateTo(prevMain, targetInner);
  }, [activeSteps, currentStep, currentInnerStep, data, innerSteps, navigateTo]);

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
      goNext={goNext}
      goPrev={goPrev}
      goToStep={goToStep}
    >
      {children}
    </WizardProvider>
  );
};

/**
 * Renders the inner steps of a container step as nested routes. Falls
 * back to the step's own `Component` for leaf steps.
 */
const StepRoutes = <TData,>({ step }: { step: WizardStep<TData> }): JSX.Element | null => {
  if (!step.steps?.length) {
    if (!step.Component) {
      return null;
    }
    const StepComponent = step.Component;
    return <StepComponent />;
  }

  return (
    <Switch>
      {step.steps.map((inner, i) => {
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
 * Renders the active step component via the SDK router. Non-first
 * steps get `path` routes matching their `WizardStep.path`. The
 * first step is mounted last as a path-less, index-less catch-all
 * so that it owns the wizard's base URL *and* any deeper URL that
 * doesn't belong to another main step — that's how its inner steps
 * (which would otherwise live under a non-existent first-step path
 * segment) end up routable. Container steps render their inner
 * steps under nested routes.
 */
const Content = (): JSX.Element => {
  const { activeSteps } = useWizard();
  if (activeSteps.length === 0) {
    return <></>;
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
 * are clickable for backwards navigation; future steps are disabled.
 */
const Header = (): JSX.Element => {
  const { activeSteps, currentIndex, goToStep } = useWizard();
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
      {activeSteps.map((step, idx) => {
        const isCurrent = idx === currentIndex;
        const isCompleted = idx < currentIndex;
        const isReachable = idx <= currentIndex;
        const label = typeof step.label === 'string' ? step.label : t(step.label);

        return (
          <React.Fragment key={step.id}>
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
                fontWeight: isCurrent ? theme.fontWeights.$semibold : theme.fontWeights.$normal,
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
                {idx + 1}
              </Flex>
              <Text
                as='span'
                variant='body'
                sx={{ fontWeight: 'inherit', color: 'inherit' }}
              >
                {label}
              </Text>
            </Button>
            {idx < activeSteps.length - 1 && (
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

/**
 * Compact "Step X / Y" badge that tracks the current main step's
 * inner-step progress. Renders nothing when the current step has no
 * inner steps — that's the signal that the parent layout doesn't
 * need to reserve room for it.
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
   * Override label for the Previous button.
   */
  previousLabel?: string;
  /**
   * Override label for the Continue button (also overridable per step
   * via `setContinueAction({ label })`).
   */
  continueLabel?: string;
  /**
   * Hides the Previous button entirely (e.g. on the first step you may
   * still want to keep it disabled rather than hidden — that is the
   * default).
   */
  hidePrevious?: boolean;
}

/**
 * Shared Previous / Continue footer. Continue dispatches to the
 * currently registered step `ContinueAction` if any; otherwise it
 * simply advances to the next step.
 */
const Footer = (props: FooterProps): JSX.Element => {
  const { previousLabel = 'Previous', continueLabel = 'Continue', hidePrevious = false } = props;
  const { isFirstStep, isLastStep, goPrev, goNext, continueAction } = useWizard();
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
          isDisabled={isFirstStep}
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
        isDisabled={continueAction?.isDisabled || isLastStep}
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
