import { useSafeLayoutEffect } from '@clerk/shared/react';
import React from 'react';

import {
  Badge,
  Col,
  descriptors,
  Flex,
  Heading,
  Icon,
  Link,
  type LocalizationKey,
  Text,
  useAppearance,
} from '../customizables';
import { ArrowLeft } from '../icons';
import type { PropsOfComponent, ThemableCssProp } from '../styledSystem';
import { ApplicationLogo } from './ApplicationLogo';
import { VerticalDivider } from './Divider';
import { useUnsafeModalContext } from './Modal';

export type HeaderProps = PropsOfComponent<typeof Col> & {
  showLogo?: boolean;
  showDivider?: boolean;
  contentSx?: ThemableCssProp;
  badgeText?: LocalizationKey;
};

const Root = React.memo(
  React.forwardRef<HTMLDivElement, HeaderProps>((props, ref) => {
    const { sx, children, contentSx, gap = 4, showLogo = false, showDivider = false, badgeText, ...rest } = props;
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
        {badgeText && (
          <Flex justify='center'>
            <Badge localizationKey={badgeText} />
          </Flex>
        )}
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
  const { sx, textVariant = 'h2', id, ...rest } = props;
  const generatedId = React.useId();
  const titleId = id ?? generatedId;
  const { registerTitle } = useUnsafeModalContext();

  // Inside a modal, the title provides the dialog's accessible name via aria-labelledby.
  useSafeLayoutEffect(() => registerTitle?.(titleId), [registerTitle, titleId]);

  return (
    <Heading
      elementDescriptor={descriptors.headerTitle}
      textVariant={textVariant}
      sx={sx}
      id={registerTitle ? titleId : id}
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
        icon={ArrowLeft}
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
