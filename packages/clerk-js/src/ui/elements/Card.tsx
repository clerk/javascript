import React from 'react';

import { useEnvironment } from '../contexts';
import { descriptors, Flex, generateFlowPartClassname, Icon, useAppearance } from '../customizables';
import type { ElementDescriptor } from '../customizables/elementDescriptors';
import { Close } from '../icons';
import type { PropsOfComponent, ThemableCssProp } from '../styledSystem';
import { mqu } from '../styledSystem';
import { ApplicationLogo } from './ApplicationLogo';
import { useFlowMetadata } from './contexts';
import { IconButton } from './IconButton';
import { useUnsafeModalContext } from './Modal';
import { PoweredByClerkTag } from './PoweredByClerk';

type CardProps = PropsOfComponent<typeof BaseCard> &
  React.PropsWithChildren<Record<never, never>> & {
    insideAppLogoSx?: ThemableCssProp;
  };

export const Card = React.forwardRef<HTMLDivElement, CardProps>((props, ref) => {
  const { sx, children, insideAppLogoSx, ...rest } = props;
  const appearance = useAppearance();
  const flowMetadata = useFlowMetadata();
  const { branded } = useEnvironment().displayConfig;

  return (
    <>
      {appearance.parsedLayout.logoPlacement === 'outside' && (
        <ApplicationLogo
          sx={t => ({
            margin: branded ? `0 ${t.space.$7} ${t.space.$8} ${t.space.$7}` : undefined,
            [mqu.sm]: {
              margin: `0 0 ${t.space.$7} 0`,
            },
          })}
        />
      )}
      <BaseCard
        elementDescriptor={descriptors.card}
        className={generateFlowPartClassname(flowMetadata)}
        gap={8}
        {...rest}
        sx={[
          t => ({
            width: t.sizes.$100,
            maxWidth: `calc(100vw - ${t.sizes.$20})`,
            margin: branded ? `0 ${t.space.$7}` : undefined,
            [mqu.sm]: {
              maxWidth: `calc(100vw - ${t.sizes.$3})`,
              margin: branded ? `0 0 ${t.space.$7} 0` : '0',
            },
            padding: `${t.space.$9x5} ${t.space.$8} ${t.space.$12} ${t.space.$8}`,
            [mqu.xs]: {
              padding: `${t.space.$8} ${t.space.$5} ${t.space.$10} ${t.space.$5}`,
            },
          }),
          sx,
        ]}
        ref={ref}
      >
        {appearance.parsedLayout.logoPlacement === 'inside' && <ApplicationLogo sx={insideAppLogoSx} />}
        {children}
        {branded && <PoweredByClerkTag />}
      </BaseCard>
    </>
  );
});

export const ProfileCard = React.forwardRef<HTMLDivElement, CardProps>((props, ref) => {
  const { sx, children, ...rest } = props;
  const { branded } = useEnvironment().displayConfig;
  return (
    <BaseCard
      direction='row'
      sx={[
        t => ({
          padding: 0,
          width: t.sizes.$220,
          maxWidth: `calc(100vw - ${t.sizes.$20})`,
          margin: branded ? `0 ${t.space.$7}` : undefined,
          [mqu.sm]: {
            maxWidth: `calc(100vw - ${t.sizes.$3})`,
            margin: branded ? `0 0 ${t.space.$7} 0` : '0',
          },
        }),
        sx,
      ]}
      {...rest}
      ref={ref}
    >
      {children}
      {branded && <PoweredByClerkTag />}
    </BaseCard>
  );
});

type BaseCardProps = PropsOfComponent<typeof Flex>;

export const BaseCard = React.forwardRef<HTMLDivElement, BaseCardProps>((props, ref) => {
  const { children, sx, ...rest } = props;
  const flowMetadata = useFlowMetadata();
  const { toggle } = useUnsafeModalContext();

  return (
    <Flex
      direction='col'
      className={generateFlowPartClassname(flowMetadata)}
      {...rest}
      elementDescriptor={[descriptors.card, props.elementDescriptor as ElementDescriptor]}
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
        sx,
      ]}
      ref={ref}
    >
      {toggle && (
        <IconButton
          elementDescriptor={descriptors.modalCloseButton}
          variant='ghost'
          colorScheme='neutral'
          aria-label='Close modal'
          onClick={toggle}
          icon={
            <Icon
              icon={Close}
              size='sm'
            />
          }
          sx={t => ({
            zIndex: t.zIndices.$modal,
            opacity: t.opacity.$inactive,
            ':hover': {
              opacity: 0.8,
            },
            position: 'absolute',
            top: t.space.$3,
            padding: t.space.$3,
            right: t.space.$3,
          })}
        />
      )}
      {children}
    </Flex>
  );
});
