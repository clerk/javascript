import { type PropsWithChildren } from 'react';

import { Col, Heading, type LocalizationKey, Text, useLocalizations } from '@/customizables';
import type { PropsOfComponent } from '@/styledSystem';

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

export const Step = Object.assign(Layout, {
  Section,
  Header,
  Body,
});
