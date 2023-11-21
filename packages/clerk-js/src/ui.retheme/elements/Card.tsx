import React from 'react';

import { useEnvironment } from '../contexts';
import { descriptors, Flex, generateFlowPartClassname, Icon, useAppearance } from '../customizables';
import type { ElementDescriptor } from '../customizables/elementDescriptors';
import { Close } from '../icons';
import type { PropsOfComponent } from '../styledSystem';
import { mqu } from '../styledSystem';
import { ApplicationLogo } from './ApplicationLogo';
import { useFlowMetadata } from './contexts';
import { IconButton } from './IconButton';
import { useUnsafeModalContext } from './Modal';
import { PoweredByClerkTag } from './PoweredByClerk';

type CardProps = PropsOfComponent<typeof BaseCard> &
  React.PropsWithChildren<{
    footerItems?: React.ReactNode[];
  }>;

export const Card = React.forwardRef<HTMLDivElement, CardProps>((props, ref) => {
  const { sx, children, footerItems, ...rest } = props;
  const appearance = useAppearance();
  const flowMetadata = useFlowMetadata();
  const { branded } = useEnvironment().displayConfig;

  return (
    <>
      {appearance.parsedLayout.logoPlacement === 'outside' && (
        <ApplicationLogo
          sx={t => ({
            [mqu.sm]: {
              margin: `0 0 ${t.space.$7} 0`,
            },
          })}
        />
      )}
      <BaseCard
        className={generateFlowPartClassname(flowMetadata)}
        ref={ref}
      >
        <Flex
          elementDescriptor={descriptors.cardContent}
          direction='col'
          gap={8}
          sx={[
            t => ({
              zIndex: t.zIndices.$card,
              position: 'relative',
              backgroundColor: t.colors.$colorBackground,
              padding: t.space.$8,
              boxShadow: t.shadows.$cardInnerDropShadow,
              width: t.sizes.$100,
              borderRadius: `${t.radii.$card} ${t.radii.$card} ${t.radii.$lg} ${t.radii.$lg}`,
            }),
            sx,
          ]}
          {...rest}
        >
          {appearance.parsedLayout.logoPlacement === 'inside' && <ApplicationLogo />}
          {children}
        </Flex>
        <CardFooter>
          {footerItems?.map((item, index) => (
            <CardFooterItem key={index}>{item}</CardFooterItem>
          ))}
          {branded && (
            <CardFooterItem>
              <PoweredByClerkTag />
            </CardFooterItem>
          )}
        </CardFooter>
      </BaseCard>
    </>
  );
});

export const ProfileCard = React.forwardRef<HTMLDivElement, CardProps>((props, ref) => {
  const { sx, children, ...rest } = props;
  const { branded } = useEnvironment().displayConfig;
  return (
    <BaseCard ref={ref}>
      <Flex
        sx={[
          t => ({
            width: t.sizes.$220,
          }),
          sx,
        ]}
        {...rest}
      >
        {children}
      </Flex>
      <CardFooter>
        {branded && (
          <CardFooterItem>
            <PoweredByClerkTag />
          </CardFooterItem>
        )}
      </CardFooter>
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
          backgroundColor: t.colors.$colorBackground,
          willChange: 'transform, opacity, height',
          transitionProperty: t.transitionProperty.$common,
          transitionDuration: '200ms',
          borderRadius: t.radii.$card,
          boxShadow: t.shadows.$cardOuterDropShadow,
          overflow: 'hidden',
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
            color: t.colors.$colorTextTertiary,
            zIndex: t.zIndices.$modal,
            position: 'absolute',
            top: t.space.$none,
            right: t.space.$none,
            padding: t.space.$3,
          })}
        />
      )}
      {children}
    </Flex>
  );
});

type CardFooterProps = PropsOfComponent<typeof Flex>;
export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>((props, ref) => {
  return (
    <Flex
      direction='col'
      align='center'
      justify='center'
      elementDescriptor={descriptors.cardFooter}
      sx={t => ({
        '>:first-of-type': {
          padding: `${t.space.$6} ${t.space.$2} ${t.space.$4} ${t.space.$2}`,
          marginTop: `-${t.space.$2}`,
        },
        '>:not(:first-of-type)': {
          padding: `${t.space.$4} ${t.space.$2}`,
          borderTop: t.borders.$normal,
          borderColor: t.colors.$blackAlpha100,
        },
      })}
      {...props}
      ref={ref}
    />
  );
});

type CardFooterItemProps = PropsOfComponent<typeof Flex>;
export const CardFooterItem = React.forwardRef<HTMLDivElement, CardFooterItemProps>((props, ref) => {
  const { sx, ...rest } = props;

  return (
    <Flex
      align='center'
      justify='center'
      elementDescriptor={descriptors.cardFooterItem}
      sx={[
        sx,
        t => ({
          position: 'relative',
          width: '100%',
          backgroundColor: t.colors.$blackAlpha200,
        }),
      ]}
      {...rest}
      ref={ref}
    />
  );
});
