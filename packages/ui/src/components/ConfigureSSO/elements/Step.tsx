import { type PropsWithChildren } from 'react';

import {
  Badge,
  Button,
  Col,
  descriptors,
  Flex,
  Heading,
  Icon,
  type LocalizationKey,
  Text,
  useLocalizations,
} from '@/customizables';
import { useCardState } from '@/elements/contexts';
import { ChevronLeft, ChevronRight } from '@/icons';
import { common, type PropsOfComponent } from '@/styledSystem';

import type { SubmitCtx, SubmitResult } from '../machine/submit';
import { ProfileCardFooter } from './ProfileCard';
import { useSubmitRunner } from './useSubmitRunner';

type StepLayoutProps = PropsOfComponent<typeof Col>;

const Layout = ({ sx, ...props }: StepLayoutProps): JSX.Element => (
  <Col
    {...props}
    sx={[{ flex: 1, minHeight: 0 }, sx]}
  />
);

type StepSectionProps = PropsOfComponent<typeof Col> & {
  /**
   * When true, the section grows to fill its parent's remaining vertical
   * space (flex: 1). Defaults to false so the section sizes to its content
   * — required for Step.Header, multi-section sub-steps, and other places
   * where a section should stay natural-height.
   */
  fill?: boolean;
};

const Section = ({ fill, sx, ...props }: StepSectionProps): JSX.Element => (
  <Col
    elementDescriptor={descriptors.configureSSOStepSection}
    {...props}
    sx={[theme => ({ padding: theme.space.$5 }), fill && { flex: 1 }, sx]}
  />
);

type StepHeaderProps = PropsWithChildren<{
  title: LocalizationKey | string;
  description?: LocalizationKey | string;
}>;

const Header = ({ title, description, children }: StepHeaderProps): JSX.Element => {
  const { t } = useLocalizations();
  const titleText = typeof title === 'string' ? title : t(title);
  const descriptionText = description ? (typeof description === 'string' ? description : t(description)) : null;

  return (
    <Section
      elementDescriptor={descriptors.configureSSOStepHeader}
      sx={theme => ({
        borderBottomWidth: theme.borderWidths.$normal,
        borderBottomStyle: theme.borderStyles.$solid,
        borderBottomColor: theme.colors.$borderAlpha100,
      })}
    >
      <Flex
        align='start'
        justify='between'
        sx={theme => ({ gap: theme.space.$4 })}
      >
        <Col sx={theme => ({ gap: theme.space.$2, minWidth: 0 })}>
          <Heading
            elementDescriptor={descriptors.configureSSOStepHeaderTitle}
            textVariant='h2'
          >
            {titleText}
          </Heading>

          {descriptionText && (
            <Text
              elementDescriptor={descriptors.configureSSOStepHeaderDescription}
              as='p'
              colorScheme='secondary'
            >
              {descriptionText}
            </Text>
          )}
        </Col>

        {children}
      </Flex>
    </Section>
  );
};

type StepBodyProps = PropsOfComponent<typeof Col>;

const Body = ({ sx, ...props }: StepBodyProps): JSX.Element => (
  <Col
    elementDescriptor={descriptors.configureSSOStepBody}
    as='main'
    {...props}
    sx={[
      t => ({
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        ...common.unstyledScrollbar(t),
      }),
      sx,
    ]}
  />
);

type FooterButtonProps = {
  /** Click handler. Required — the buttons have no default behavior. */
  onClick?: () => void | Promise<unknown>;
  /** Disabled state. */
  isDisabled?: boolean;
  /** Loading state. */
  isLoading?: boolean;
  /** Override label. Defaults to 'Previous' / 'Continue'. */
  label?: LocalizationKey | string;
};

const FooterPrevious = ({ onClick, isDisabled, isLoading, label = 'Previous' }: FooterButtonProps): JSX.Element => {
  const { t } = useLocalizations();
  const labelText = typeof label === 'string' ? label : t(label);
  const handleClick = onClick
    ? (): void => {
        void onClick();
      }
    : undefined;

  return (
    <Button
      elementDescriptor={descriptors.configureSSOFooterPreviousButton}
      variant='outline'
      size='sm'
      isDisabled={isDisabled}
      isLoading={isLoading}
      onClick={handleClick}
    >
      <Icon
        icon={ChevronLeft}
        size='sm'
        sx={t => ({ marginInlineEnd: t.space.$1 })}
      />
      {labelText}
    </Button>
  );
};
FooterPrevious.displayName = 'Step.Footer.Previous';

const FooterContinue = ({ onClick, isDisabled, isLoading, label = 'Continue' }: FooterButtonProps): JSX.Element => {
  const { t } = useLocalizations();
  const labelText = typeof label === 'string' ? label : t(label);
  const handleClick = onClick
    ? (): void => {
        void onClick();
      }
    : undefined;

  return (
    <Button
      elementDescriptor={descriptors.configureSSOFooterContinueButton}
      variant='solid'
      size='sm'
      isDisabled={isDisabled}
      isLoading={isLoading}
      onClick={handleClick}
    >
      {labelText}
      <Icon
        icon={ChevronRight}
        size='sm'
        sx={t => ({ marginInlineStart: t.space.$1 })}
      />
    </Button>
  );
};
FooterContinue.displayName = 'Step.Footer.Continue';

type FooterSubmitProps = {
  /**
   * The step's submit logic, sourced from its transition's `onSubmit`. Receives
   * a {@link SubmitCtx} (facts, mutations, provider, nav) and returns a
   * `SubmitResult`. The runner owns the lifecycle (clear error -> loading ->
   * advance/jump or surface error -> idle); this handler only does the
   * step-specific work (validate, call a mutation, decide where to go next).
   *
   * Omit it to advance linearly with a plain `NEXT` (e.g. the test step's
   * Continue once its gate passes).
   *
   * It is NOT published anywhere — `Step.Footer.Submit` is rendered inside the
   * step body and reads only what the step passes it. There is no action
   * registry / sibling-footer handoff.
   */
  onSubmit?: (ctx: SubmitCtx) => Promise<SubmitResult> | SubmitResult;
  /**
   * Whether the primary action is currently allowed. Derived from the step's
   * local state (e.g. `Boolean(selected)` or `facts.hasSuccessfulTestRun`). The
   * button is additionally disabled while a submit is in flight.
   */
  canContinue: boolean;
  /** Override label. Defaults to 'Continue'. */
  label?: LocalizationKey | string;
};

/**
 * The step's primary action. Renders the same Continue button as
 * `Step.Footer.Continue`, but wires it to `useSubmitRunner` so the submit
 * boilerplate (and navigation via the state machine) lives in exactly one
 * place. The button owns its own in-flight state by reading `card.isLoading` —
 * the step never threads loading flags through.
 *
 * Composes with the dumb `Step.Footer.Previous` (and `Step.Footer.Reset` paths
 * elsewhere) as siblings inside `<Step.Footer>`:
 *
 * ```tsx
 * <Step.Footer>
 *   <Step.Footer.Previous onClick={() => dispatch({ type: 'BACK' })} />
 *   <Step.Footer.Submit canContinue={Boolean(selected)} onSubmit={transition.onSubmit} />
 * </Step.Footer>
 * ```
 *
 * Previous stays presentational and independent; only Submit is coupled to the
 * runner.
 */
const FooterSubmit = ({ onSubmit, canContinue, label = 'Continue' }: FooterSubmitProps): JSX.Element => {
  const card = useCardState();
  const run = useSubmitRunner();

  return (
    <FooterContinue
      onClick={() => run(onSubmit)}
      isLoading={card.isLoading}
      isDisabled={!canContinue || card.isLoading}
      label={label}
    />
  );
};
FooterSubmit.displayName = 'Step.Footer.Submit';

const Footer = ({ children }: PropsWithChildren): JSX.Element => <ProfileCardFooter>{children}</ProfileCardFooter>;

const FooterCompound = Object.assign(Footer, {
  Previous: FooterPrevious,
  Continue: FooterContinue,
  Submit: FooterSubmit,
});

type StepCounterProps = {
  total: number;
  /** 1-indexed (i.e., first step = 1, not 0). */
  current: number;
};

const Counter = ({ total, current }: StepCounterProps): JSX.Element | null => {
  if (total <= 1) {
    return null;
  }

  return (
    <Badge
      elementDescriptor={descriptors.configureSSOStepCounter}
      colorScheme='primary'
      sx={{ whiteSpace: 'nowrap' }}
    >
      <Text
        as='span'
        sx={t => ({ fontSize: t.fontSizes.$xs })}
      >
        Step {current}/{total}
      </Text>
    </Badge>
  );
};
Counter.displayName = 'Step.Counter';

export const Step = Object.assign(Layout, {
  Section,
  Header,
  Body,
  Footer: FooterCompound,
  Counter,
});
