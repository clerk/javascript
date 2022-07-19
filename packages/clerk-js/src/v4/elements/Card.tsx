import React from 'react';

import { useEnvironment } from '../../ui/contexts';
import { descriptors, Flex, generateFlowPartClassname, useAppearance } from '../customizables';
import { mqu, PropsOfComponent } from '../styledSystem';
import { ApplicationLogo } from './ApplicationLogo';
import { useFlowMetadata } from './contexts';
import { PoweredByClerkTag } from './PoweredByClerk';

type CardProps = PropsOfComponent<typeof BaseCard> & React.PropsWithChildren<{}>;

export const Card = React.forwardRef<HTMLDivElement, CardProps>((props, ref) => {
  const appearance = useAppearance();
  const flowMetadata = useFlowMetadata();
  const { branded } = useEnvironment().displayConfig;

  return (
    <>
      {appearance.parsedLayout.logoPlacement === 'outside' && (
        <ApplicationLogo sx={theme => ({ marginBottom: theme.space.$8 })} />
      )}
      <BaseCard
        elementDescriptor={descriptors.card}
        className={generateFlowPartClassname(flowMetadata)}
        gap={8}
        {...props}
        sx={[
          t => ({
            width: t.sizes.$100,
            maxWidth: `calc(100vw - ${t.sizes.$20})`,
            [mqu.sm]: {
              maxWidth: `calc(100vw - ${t.sizes.$3})`,
            },
            padding: `${t.space.$9x5} ${t.space.$8} ${t.space.$12} ${t.space.$8}`,
            [mqu.xs]: {
              padding: `${t.space.$8} ${t.space.$5} ${t.space.$10} ${t.space.$5}`,
            },
          }),
          props.sx,
        ]}
        ref={ref}
      >
        {appearance.parsedLayout.logoPlacement === 'inside' && <ApplicationLogo />}
        {props.children}
        {branded && <PoweredByClerkTag />}
      </BaseCard>
    </>
  );
});

export const UserProfileCard = React.forwardRef<HTMLDivElement, CardProps>((props, ref) => {
  const { branded } = useEnvironment().displayConfig;

  return (
    <BaseCard
      direction='row'
      {...props}
      sx={[
        t => ({
          padding: 0,
          width: t.sizes.$220,
          maxWidth: `calc(100vw - ${t.sizes.$20})`,
          [mqu.sm]: {
            maxWidth: `calc(100vw - ${t.sizes.$3})`,
          },
        }),
        props.sx,
      ]}
      ref={ref}
    >
      {props.children}
      {branded && <PoweredByClerkTag />}
    </BaseCard>
  );
});

type BaseCardProps = PropsOfComponent<typeof Flex>;

export const BaseCard = React.forwardRef<HTMLDivElement, BaseCardProps>((props, ref) => {
  const flowMetadata = useFlowMetadata();
  return (
    <Flex
      direction='col'
      elementDescriptor={descriptors.card}
      className={generateFlowPartClassname(flowMetadata)}
      {...props}
      sx={[
        t => ({
          willChange: 'transform, opacity, height',
          borderRadius: t.radii.$xl,
          backgroundColor: t.colors.$colorBackground,
          transitionProperty: t.transitionProperty.$common,
          transitionDuration: '200ms',
          boxShadow: t.shadows.$cardDropShadow,
          border: '1px solid transparent',
        }),
        props.sx,
      ]}
      ref={ref}
    />
  );
});
