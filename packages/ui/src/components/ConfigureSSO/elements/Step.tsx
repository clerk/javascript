import { type PropsWithChildren } from 'react';

import { Button, Col, descriptors, Heading, Icon, type LocalizationKey, Text, useLocalizations } from '@/customizables';
import { CaretLeft, CaretRight } from '@/icons';
import type { PropsOfComponent } from '@/styledSystem';

import { ProfileCardFooter } from './ProfileCard';
import { useWizard } from './Wizard';

type StepLayoutProps = PropsOfComponent<typeof Col>;

const Layout = ({ sx, ...props }: StepLayoutProps): JSX.Element => (
  <Col
    {...props}
    sx={[{ flex: 1, minHeight: 0 }, sx]}
  />
);

type StepSectionProps = PropsOfComponent<typeof Col>;

const Section = ({ sx, ...props }: StepSectionProps): JSX.Element => (
  <Col
    {...props}
    sx={[theme => ({ padding: theme.space.$5 }), sx]}
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
      sx={theme => ({
        borderBottomWidth: theme.borderWidths.$normal,
        borderBottomStyle: theme.borderStyles.$solid,
        borderBottomColor: theme.colors.$borderAlpha100,
      })}
    >
      <Col sx={theme => ({ gap: theme.space.$1x5 })}>
        <Heading
          textVariant='h3'
          sx={theme => ({ color: theme.colors.$colorForeground, fontSize: theme.fontSizes.$lg })}
        >
          {titleText}
        </Heading>

        {descriptionText && (
          <Text
            as='p'
            variant='body'
            sx={theme => ({ color: theme.colors.$colorMutedForeground })}
          >
            {descriptionText}
          </Text>
        )}
      </Col>

      {children}
    </Section>
  );
};

type StepBodyProps = PropsOfComponent<typeof Col>;

const Body = ({ sx, ...props }: StepBodyProps): JSX.Element => (
  <Section
    as='main'
    {...props}
    sx={[{ flex: 1, minHeight: 0, overflowY: 'auto' }, sx]}
  />
);

type StepFooterProps = {
  /** Override label for Previous. Defaults to 'Previous'. */
  previousLabel?: LocalizationKey | string;
  /** Override label for Continue. Defaults to 'Continue'. */
  continueLabel?: LocalizationKey | string;
  /** Hide the Previous button entirely. */
  hidePrevious?: boolean;
  /** Hide the Continue button entirely. */
  hideContinue?: boolean;
  /** Force-disable Previous regardless of wizard state. Defaults to `useWizard().isFirstStep`. */
  previousDisabled?: boolean;
  /** Force-disable Continue. Defaults to `useWizard().isLastStep`. */
  continueDisabled?: boolean;
  /** Continue button loading state. */
  continueLoading?: boolean;
  /** Click handler for Previous. Defaults to `useWizard().goPrev`. */
  onPrevious?: () => void | Promise<unknown>;
  /** Click handler for Continue. Defaults to `useWizard().goNext`. */
  onContinue?: () => void | Promise<unknown>;
};

const Footer = ({
  previousLabel = 'Previous',
  continueLabel = 'Continue',
  hidePrevious = false,
  hideContinue = false,
  previousDisabled,
  continueDisabled,
  continueLoading,
  onPrevious,
  onContinue,
}: StepFooterProps): JSX.Element => {
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();
  const { t } = useLocalizations();

  const previousText = typeof previousLabel === 'string' ? previousLabel : t(previousLabel);
  const continueText = typeof continueLabel === 'string' ? continueLabel : t(continueLabel);

  const handlePrevious = (): void => {
    void (onPrevious ? onPrevious() : goPrev());
  };
  const handleContinue = (): void => {
    void (onContinue ? onContinue() : goNext());
  };
  const isPreviousDisabled = previousDisabled ?? isFirstStep;
  const isContinueDisabled = continueDisabled ?? isLastStep;

  return (
    <ProfileCardFooter>
      {!hidePrevious && (
        <Button
          elementDescriptor={descriptors.configureSSOWizardFooterPreviousButton}
          variant='outline'
          size='sm'
          isDisabled={isPreviousDisabled}
          onClick={handlePrevious}
        >
          <Icon
            icon={CaretLeft}
            size='sm'
            sx={t => ({ marginInlineEnd: t.space.$1 })}
          />
          {previousText}
        </Button>
      )}
      {!hideContinue && (
        <Button
          elementDescriptor={descriptors.configureSSOWizardFooterContinueButton}
          variant='solid'
          size='sm'
          isDisabled={isContinueDisabled}
          isLoading={continueLoading}
          onClick={handleContinue}
        >
          {continueText}
          <Icon
            icon={CaretRight}
            size='sm'
            sx={t => ({ marginInlineStart: t.space.$1 })}
          />
        </Button>
      )}
    </ProfileCardFooter>
  );
};

export const Step = Object.assign(Layout, {
  Section,
  Header,
  Body,
  Footer,
});
