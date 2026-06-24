import { __internal_useOrganizationBase } from '@clerk/shared/react';
import { type PropsWithChildren, type ReactNode, useState } from 'react';

import {
  Badge,
  Button,
  Col,
  descriptors,
  Flex,
  Heading,
  Icon,
  type LocalizationKey,
  localizationKeys,
  Text,
  useLocalizations,
} from '@/customizables';
import { ChevronLeft, ChevronRight } from '@/icons';
import { common, type PropsOfComponent } from '@/styledSystem';

import { useConfigureSSO } from '../ConfigureSSOContext';
import { ResetConnectionDialog } from '../ResetConnectionDialog';
import { ProfileCardFooter } from './ProfileCard';

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
  badge?: ReactNode;
}>;

const Header = ({ title, description, badge, children }: StepHeaderProps): JSX.Element => {
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
          <Flex
            align='center'
            sx={t => ({ gap: t.space.$2, flexWrap: 'wrap' })}
          >
            <Heading
              elementDescriptor={descriptors.configureSSOStepHeaderTitle}
              textVariant='h2'
            >
              {titleText}
            </Heading>
            {badge}
          </Flex>

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
  /** The buttons have no default behavior — wire navigation here. */
  onClick?: () => void | Promise<unknown>;
  isDisabled?: boolean;
  isLoading?: boolean;
  /** Defaults to 'Previous' / 'Continue'. */
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

/**
 * The destructive reset affordance, rendered in a step footer. Self-hides while
 * there is no connection (so it only shows on configure / test / confirmation,
 * never on verify-domain / select-provider).
 *
 * It deliberately does NOT call `useWizard()`. The confirm path deletes the
 * connection directly via the context mutation (a pure delete; the wizard then
 * self-corrects to the furthest-reachable step when the active step's guard
 * breaks), so this works from ANY footer — including the nested SAML configure
 * footers, which have their own (linear) wizard. That is what kills the old
 * per-step nested-binding trap.
 *
 * `marginInlineEnd: 'auto'` pushes it to the far-left of the `justify='end'`
 * footer row, matching the prior destructive affordance.
 */
const FooterReset = (): JSX.Element | null => {
  const { enterpriseConnection, enterpriseConnectionMutations, contentRef } = useConfigureSSO();
  const organization = __internal_useOrganizationBase();
  const [isOpen, setIsOpen] = useState(false);

  if (!enterpriseConnection) {
    return null;
  }

  return (
    <>
      <Button
        elementDescriptor={descriptors.configureSSOFooterResetButton}
        variant='ghost'
        size='sm'
        colorScheme='danger'
        onClick={() => setIsOpen(true)}
        localizationKey={localizationKeys('configureSSO.resetConnectionDialog.resetButton')}
        sx={{ marginInlineEnd: 'auto' }}
      />
      <ResetConnectionDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        confirmationValue={organization?.name ?? ''}
        onDelete={() => enterpriseConnectionMutations.deleteConnection(enterpriseConnection.id)}
        contentRef={contentRef}
      />
    </>
  );
};
FooterReset.displayName = 'Step.Footer.Reset';

const Footer = ({ children }: PropsWithChildren): JSX.Element => <ProfileCardFooter>{children}</ProfileCardFooter>;

const FooterCompound = Object.assign(Footer, {
  Previous: FooterPrevious,
  Continue: FooterContinue,
  Reset: FooterReset,
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
