import React from 'react';

import { Col, descriptors, Heading, Text, useAppearance } from '../customizables';
import type { PropsOfComponent } from '../styledSystem';
import { ApplicationLogo } from './ApplicationLogo';

export type HeaderProps = PropsOfComponent<typeof Col> & {
  showLogo?: boolean;
};

const Root = React.memo(
  React.forwardRef<HTMLDivElement, HeaderProps>((props, ref) => {
    const { sx, children, showLogo = false, ...rest } = props;
    const appearance = useAppearance();

    const logoIsVisible = appearance.parsedLayout.logoPlacement === 'inside' && showLogo;

    return (
      <Col
        ref={ref}
        elementDescriptor={descriptors.header}
        gap={6}
        sx={sx}
        {...rest}
      >
        {logoIsVisible && <ApplicationLogo />}
        <Col gap={1}>{children}</Col>
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
      colorScheme='neutral'
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

export const Header = {
  Root,
  Title,
  Subtitle,
};
