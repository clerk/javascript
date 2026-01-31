import React from 'react';

import { Col, descriptors, Heading, Icon, Link, Text, useAppearance } from '../customizables';
import { ArrowLeftIcon } from '../icons';
import type { PropsOfComponent, ThemableCssProp } from '../styledSystem';
import { ApplicationLogo } from './ApplicationLogo';
import { VerticalDivider } from './Divider';

export type HeaderProps = PropsOfComponent<typeof Col> & {
  showLogo?: boolean;
  showDivider?: boolean;
  contentSx?: ThemableCssProp;
};

const Root = React.memo(
  React.forwardRef<HTMLDivElement, HeaderProps>((props, ref) => {
    const { sx, children, contentSx, gap = 6, showLogo = false, showDivider = false, ...rest } = props;
    const appearance = useAppearance();

    const logoIsVisible = appearance.parsedOptions.logoPlacement === 'inside' && showLogo;
    const verticalDividerIsVisible = showDivider && logoIsVisible;

    return (
      <Col
        ref={ref}
        elementDescriptor={descriptors.header}
        gap={gap}
        sx={sx}
        {...rest}
      >
        {logoIsVisible && <ApplicationLogo />}
        {verticalDividerIsVisible && <VerticalDivider />}
        <Col
          gap={1}
          sx={contentSx}
          {...rest}
        >
          {children}
        </Col>
      </Col>
    );
  }),
);

const Title = React.memo((props: PropsOfComponent<typeof Heading>): JSX.Element => {
  const { sx, textVariant = 'h2', ...rest } = props;
  return (
    <Heading
      elementDescriptor={descriptors.headerTitle}
      textVariant={textVariant}
      sx={sx}
      {...rest}
    />
  );
});

const Subtitle = React.memo((props: PropsOfComponent<typeof Text>): JSX.Element => {
  const { sx, ...rest } = props;
  return (
    <Text
      elementDescriptor={descriptors.headerSubtitle}
      variant='body'
      colorScheme='secondary'
      sx={[
        {
          wordWrap: 'break-word',
        },
        sx,
      ]}
      {...rest}
    />
  );
});

const BackLink = React.memo((props: PropsOfComponent<typeof Link>): JSX.Element => {
  const { sx, children, ...rest } = props;
  return (
    <Link
      elementDescriptor={descriptors.headerBackLink}
      sx={t => [
        {
          display: 'inline-flex',
          alignItems: 'center',
          gap: t.space.$2,
          width: 'fit-content',
          '&:hover': {
            textDecoration: 'none',
          },
        },
        sx,
      ]}
      {...rest}
    >
      <Icon
        icon={ArrowLeftIcon}
        sx={t => ({
          color: t.colors.$colorForeground,
          '[dir="rtl"] &': {
            transform: 'scaleX(-1)',
          },
        })}
      />
      {children}
    </Link>
  );
});

export const Header = {
  Root,
  Title,
  Subtitle,
  BackLink,
};
