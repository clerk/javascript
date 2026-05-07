import { type PropsWithChildren } from 'react';

import { Button, Col, descriptors, Heading, Icon, type LocalizationKey, Text, useLocalizations } from '@/customizables';
import { CaretLeft, CaretRight } from '@/icons';
import type { PropsOfComponent } from '@/styledSystem';

import { ProfileCardFooter } from './ProfileCard';

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
      elementDescriptor={descriptors.configureSSOWizardFooterPreviousButton}
      variant='outline'
      size='sm'
      isDisabled={isDisabled}
      isLoading={isLoading}
      onClick={handleClick}
    >
      <Icon
        icon={CaretLeft}
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
      elementDescriptor={descriptors.configureSSOWizardFooterContinueButton}
      variant='solid'
      size='sm'
      isDisabled={isDisabled}
      isLoading={isLoading}
      onClick={handleClick}
    >
      {labelText}
      <Icon
        icon={CaretRight}
        size='sm'
        sx={t => ({ marginInlineStart: t.space.$1 })}
      />
    </Button>
  );
};
FooterContinue.displayName = 'Step.Footer.Continue';

const Footer = ({ children }: PropsWithChildren): JSX.Element => <ProfileCardFooter>{children}</ProfileCardFooter>;

const FooterCompound = Object.assign(Footer, {
  Previous: FooterPrevious,
  Continue: FooterContinue,
});

export const Step = Object.assign(Layout, {
  Section,
  Header,
  Body,
  Footer: FooterCompound,
});
