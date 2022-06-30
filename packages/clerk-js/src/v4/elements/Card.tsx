import React from 'react';

import { useEnvironment } from '../../ui/contexts';
import { descriptors, Flex, useAppearance } from '../customizables';
import { generateFlowPartClassname } from '../customizables/classGeneration';
import { PropsOfComponent } from '../styledSystem';
import { ApplicationLogo } from './ApplicationLogo';
import { useFlowMetadata } from './contexts';
import { PoweredByClerkTag } from './PoweredByClerk';

type CardProps = PropsOfComponent<typeof BaseCard> & React.PropsWithChildren<{}>;

export const Card = React.forwardRef<HTMLDivElement, CardProps>((props, ref) => {
  const appearance = useAppearance();
  const flowMetadata = useFlowMetadata();
  const logoMarkTag = true;

  return (
    <>
      {appearance.parsedOptions.logoPlacement === 'outside' && (
        <ApplicationLogo sx={theme => ({ marginBottom: theme.space.$8 })} />
      )}
      <BaseCard
        elementDescriptor={descriptors.card}
        className={generateFlowPartClassname(flowMetadata)}
        {...props}
        gap={8}
        ref={ref}
      >
        {appearance.parsedOptions.logoPlacement === 'inside' && <ApplicationLogo />}
        {props.children}
        {logoMarkTag && <PoweredByClerkTag />}
      </BaseCard>
    </>
  );
});

export const EmptyCard = React.forwardRef<HTMLDivElement, CardProps>((props, ref) => {
  const flowMetadata = useFlowMetadata();
  return (
    <BaseCard
      elementDescriptor={descriptors.card}
      className={generateFlowPartClassname(flowMetadata)}
      {...props}
      ref={ref}
    />
  );
});

type BaseCardProps = PropsOfComponent<typeof Flex>;

const BaseCard = React.forwardRef<HTMLDivElement, BaseCardProps>((props, ref) => {
  return (
    <Flex
      direction='col'
      {...props}
      sx={[
        theme => ({
          willChange: 'transform, opacity, height',
          minWidth: theme.sizes.$100,
          maxWidth: theme.sizes.$100,
          padding: `${theme.space.$9x5} ${theme.space.$8} ${theme.space.$12} ${theme.space.$8}`,
          borderRadius: theme.radii.$xl,
          backgroundColor: theme.colors.$colorBackground,
          transitionProperty: theme.transitionProperty.$common,
          transitionDuration: '200ms',
          boxShadow: theme.shadows.$cardDropShadow,
        }),
        props.sx,
      ]}
      ref={ref}
    />
  );
});
