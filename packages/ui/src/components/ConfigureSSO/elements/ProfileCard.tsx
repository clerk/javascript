import type { PropsWithChildren } from 'react';

import type { LocalizationKey } from '@/customizables';
import { Col, descriptors, Flex, Heading, Text, useLocalizations } from '@/customizables';

type ProfileCardHeaderProps = React.PropsWithChildren;

export const ProfileCardHeader = (props: ProfileCardHeaderProps): JSX.Element => (
  <Flex
    as='header'
    {...props}
    sx={theme => ({
      gap: theme.space.$2,
      padding: `${theme.space.$5}`,
      borderBottomWidth: theme.borderWidths.$normal,
      borderBottomStyle: theme.borderStyles.$solid,
      borderBottomColor: theme.colors.$borderAlpha100,
    })}
  />
);

type ProfileCardBodyProps = PropsWithChildren;

export const ProfileCardBody = (props: ProfileCardBodyProps): JSX.Element => (
  <Col
    as='main'
    {...props}
    sx={{
      flex: 1,
      minHeight: 0,
      overflowY: 'auto',
    }}
  />
);

type ProfileCardSectionProps = PropsWithChildren<{
  title?: LocalizationKey | string;
  subtitle?: LocalizationKey | string;
}>;

export const ProfileCardSection = ({ title, subtitle, children }: ProfileCardSectionProps): JSX.Element => {
  const { t } = useLocalizations();
  const titleText = title ? (typeof title === 'string' ? title : t(title)) : null;
  const subtitleText = subtitle ? (typeof subtitle === 'string' ? subtitle : t(subtitle)) : null;
  const hasHeading = titleText || subtitleText;

  return (
    <Col sx={theme => ({ gap: theme.space.$3, padding: theme.space.$5 })}>
      {hasHeading && (
        <Col sx={theme => ({ gap: theme.space.$1 })}>
          {titleText && (
            <Heading
              textVariant='h3'
              sx={theme => ({ color: theme.colors.$colorForeground, fontSize: theme.fontSizes.$lg })}
            >
              {titleText}
            </Heading>
          )}
          {subtitleText && (
            <Text
              as='p'
              variant='body'
              sx={theme => ({ color: theme.colors.$colorMutedForeground })}
            >
              {subtitleText}
            </Text>
          )}
        </Col>
      )}
      {children}
    </Col>
  );
};

type ProfileCardFooterProps = React.PropsWithChildren;

export const ProfileCardFooter = (props: ProfileCardFooterProps): JSX.Element => (
  <Flex
    as='footer'
    elementDescriptor={descriptors.footer}
    align='center'
    justify='end'
    {...props}
    sx={theme => ({
      gap: theme.space.$2,
      padding: `${theme.space.$3}`,
      borderTopWidth: theme.borderWidths.$normal,
      borderTopStyle: theme.borderStyles.$solid,
      borderTopColor: theme.colors.$borderAlpha100,
    })}
  />
);
