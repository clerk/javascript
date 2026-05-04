import React from 'react';

import { Badge, Button, descriptors, Flex, Icon, Text, useLocalizations } from '@/customizables';
import { CaretLeft, CaretRight } from '@/icons';
import { Route, Switch, useRouter } from '@/router';

import type { WizardStep } from './types';
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

  // Detect the current step based on the URL. We iterate from the last
  // (most specific) step back to the second one — the first step is the
  // index route and always wins as a fallback.
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

  const navigateToStep = React.useCallback(
    (step: WizardStep<TData> | undefined) => {
      if (!step) {
        return;
      }
      const isFirst = activeSteps[0]?.id === step.id;
      // First step is the index route, so navigate to the wizard base.
      // Subsequent steps live at `<base>/<step.path>`.
      return router.navigate(isFirst ? './' : step.path);
    },
    [activeSteps, router],
  );

  const goNext = React.useCallback(() => {
    if (!currentStep) {
      return;
    }
    const idx = activeSteps.findIndex(s => s.id === currentStep.id);
    return navigateToStep(activeSteps[idx + 1]);
  }, [activeSteps, currentStep, navigateToStep]);

  const goPrev = React.useCallback(() => {
    if (!currentStep) {
      return;
    }
    const idx = activeSteps.findIndex(s => s.id === currentStep.id);
    return navigateToStep(activeSteps[idx - 1]);
  }, [activeSteps, currentStep, navigateToStep]);

  const goToStep = React.useCallback(
    (id: string) => navigateToStep(activeSteps.find(s => s.id === id)),
    [activeSteps, navigateToStep],
  );

  return (
    <WizardProvider
      activeSteps={activeSteps}
      currentStep={currentStep}
      goNext={goNext}
      goPrev={goPrev}
      goToStep={goToStep}
    >
      {children}
    </WizardProvider>
  );
};

/**
 * Renders the active step component via the SDK router. The first
 * active step is mounted as the index route; the rest get `path` routes
 * matching their `WizardStep.path`.
 */
const Content = (): JSX.Element => {
  const { activeSteps } = useWizard();
  return (
    <Switch>
      {activeSteps.map((step, i) => {
        const StepComponent = step.Component;
        return (
          <Route
            key={step.id}
            {...(i === 0 ? { index: true } : { path: step.path })}
          >
            <StepComponent />
          </Route>
        );
      })}
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
 * Compact "Step X / Y" badge for a step to show next to its own title.
 * Reads the count from context so it stays in sync with skipped steps.
 */
const StepIndicator = (): JSX.Element | null => {
  const { currentIndex, totalSteps } = useWizard();

  if (currentIndex < 0) {
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
