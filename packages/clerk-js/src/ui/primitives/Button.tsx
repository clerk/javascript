import type { PropsWithChildren } from 'react';
import React from 'react';

import { descriptors, Icon, Spinner } from '../customizables';
import { ArrowRightButtonIcon } from '../icons';
import type { PrimitiveProps, StyleVariants } from '../styledSystem';
import { common, createVariants } from '../styledSystem';
import { applyDataStateProps } from './applyDataStateProps';
import { Flex } from './Flex';

const { applyVariants, filterProps } = createVariants((theme, props: OwnProps) => {
  return {
    base: {
      margin: 0,
      padding: 0,
      border: 0,
      outline: 0,
      userSelect: 'none',
      cursor: 'pointer',
      backgroundColor: 'unset',
      color: 'currentColor',
      borderRadius: theme.radii.$md,
      position: 'relative',
      isolation: 'isolate',
      ...common.centeredFlex('inline-flex'),
      ...common.disabled(theme),
      transitionProperty: theme.transitionProperty.$common,
      transitionDuration: theme.transitionDuration.$controls,
    },
    variants: {
      textVariant: common.textVariants(theme),
      size: {
        iconLg: {
          width: theme.sizes.$13,
        },
        xs: {
          padding: `${theme.space.$1} ${theme.space.$3}`,
        },
        sm: {
          padding: `${theme.space.$1x5} ${theme.space.$3}`,
        },
        md: {
          padding: `${theme.space.$2x5} ${theme.space.$5}`,
        },
      },
      variant: {
        primary: {
          backgroundColor: theme.colors.$primary500,
          color: theme.colors.$colorTextOnPrimaryBackground,
          boxShadow: theme.shadows.$buttonShadow,
          border: theme.borders.$normal,
          borderColor: theme.colors.$primary500,
          ':before': {
            position: 'absolute',
            content: '""',
            borderRadius: 'inherit',
            zIndex: -1,
            inset: 0,
            background: `linear-gradient(180deg, ${theme.colors.$whiteAlpha150} 0%, ${theme.colors.$transparent} 100%)`,
          },
          ':after': {
            position: 'absolute',
            content: '""',
            borderRadius: 'inherit',
            zIndex: -1,
            inset: 0,
            opacity: 0,
            transitionProperty: theme.transitionProperty.$common,
            transitionDuration: theme.transitionDuration.$controls,
            background: `linear-gradient(180deg, ${theme.colors.$whiteAlpha100} 0%, ${theme.colors.$transparent} 100%)`,
          },
          ':hover::after': {
            opacity: 1,
          },
          ':active::after': {
            opacity: 0,
          },
        },
        primaryDanger: {
          backgroundColor: theme.colors.$danger500,
          color: theme.colors.$colorTextOnPrimaryBackground,
          boxShadow: theme.shadows.$buttonShadow,
          border: theme.borders.$normal,
          borderColor: theme.colors.$danger500,
          ':before': {
            position: 'absolute',
            content: '""',
            borderRadius: 'inherit',
            zIndex: -1,
            inset: 0,
            background: `linear-gradient(180deg, ${theme.colors.$whiteAlpha150} 0%, ${theme.colors.$transparent} 100%)`,
          },
          ':after': {
            position: 'absolute',
            content: '""',
            borderRadius: 'inherit',
            zIndex: -1,
            inset: 0,
            opacity: 0,
            transitionProperty: theme.transitionProperty.$common,
            transitionDuration: theme.transitionDuration.$controls,
            background: `linear-gradient(180deg, ${theme.colors.$whiteAlpha100} 0%, ${theme.colors.$transparent} 100%)`,
          },
          ':hover::after': {
            opacity: 1,
          },
          ':active::after': {
            opacity: 0,
          },
        },
        secondary: {
          color: theme.colors.$colorTextOnSecondaryBackground,
          //browser didn't like going from a gradient to a normal color
          background: common.mergedColorsBackground(theme.colors.$secondary50, theme.colors.$transparent),
          '&:hover': {
            color: theme.colors.$colorTextOnSecondaryBackground,
            background: common.mergedColorsBackground(theme.colors.$secondary500, theme.colors.$blackAlpha50),
          },
          '&:focus': props.hoverAsFocus
            ? {
                color: theme.colors.$colorTextOnSecondaryBackground,
                background: common.mergedColorsBackground(theme.colors.$secondary500, theme.colors.$blackAlpha50),
              }
            : undefined,
          '&:active': { backgroundColor: theme.colors.$secondary500 },
          boxShadow: theme.shadows.$secondaryButtonShadow,
          border: theme.borders.$normal,
          borderColor: theme.colors.$blackAlpha100,
        },
        ghost: {
          color: theme.colors.$colorTextSecondary,
          '&:hover': {
            color: theme.colors.$colorText,
            background: theme.colors.$blackAlpha50,
          },
          '&:focus': props.hoverAsFocus
            ? {
                background: theme.colors.$blackAlpha50,
                color: theme.colors.$colorText,
              }
            : undefined,
        },
        ghostPrimary: {
          color: theme.colors.$primary500,
          '&:hover': {
            color: theme.colors.$primary500,
            backgroundColor: theme.colors.$blackAlpha50,
          },
          '&:focus': props.hoverAsFocus
            ? {
                color: theme.colors.$primary500,
                backgroundColor: theme.colors.$blackAlpha50,
              }
            : undefined,
        },
        ghostDanger: {
          color: theme.colors.$danger500,
          '&:hover': { color: theme.colors.$danger500, backgroundColor: theme.colors.$dangerAlpha50 },
          '&:focus': props.hoverAsFocus
            ? { color: theme.colors.$danger500, backgroundColor: theme.colors.$danger50 }
            : undefined,
        },
        link: {
          minHeight: 'fit-content',
          height: 'fit-content',
          width: 'fit-content',
          textTransform: 'none',
          padding: 0,
          color: theme.colors.$primary500,
          '&:hover': { textDecoration: 'underline' },
          '&:focus': props.hoverAsFocus ? { textDecoration: 'underline' } : undefined,
        },
        linkDanger: {
          minHeight: 'fit-content',
          height: 'fit-content',
          width: 'fit-content',
          textTransform: 'none',
          padding: 0,
          color: theme.colors.$danger500,
          '&:hover': { textDecoration: 'underline' },
          '&:focus': props.hoverAsFocus ? { textDecoration: 'underline' } : undefined,
        },
        unstyled: {},
        roundWrapper: { padding: 0, margin: 0, height: 'unset', width: 'unset', minHeight: 'unset' },
      },
      block: {
        true: { width: '100%' },
      },
      focusRing: {
        true: { ...common.focusRing(theme) },
      },
    },
    defaultVariants: {
      textVariant: 'buttonLarge',
      variant: 'primary',
      size: 'sm',
      focusRing: true,
    },
  };
});
type OwnProps = PrimitiveProps<'button'> & {
  isLoading?: boolean;
  loadingText?: string;
  isDisabled?: boolean;
  isActive?: boolean;
  hoverAsFocus?: boolean;
  hasArrow?: boolean;
};

type ButtonProps = OwnProps & StyleVariants<typeof applyVariants>;

const ButtonChildrenWithArrow = ({ children }: PropsWithChildren) => {
  return (
    <Flex
      align='center'
      as='span'
    >
      {children}
      <Icon
        elementDescriptor={descriptors.buttonArrowIcon}
        icon={ArrowRightButtonIcon}
        sx={t => ({
          marginLeft: t.space.$2,
          width: t.sizes.$2x5,
          height: t.sizes.$2x5,
          opacity: t.opacity.$inactive,
        })}
      />
    </Flex>
  );
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const parsedProps: ButtonProps = { ...props, isDisabled: props.isDisabled || props.isLoading };
  const {
    isLoading,
    isDisabled,
    hoverAsFocus,
    loadingText,
    children,
    hasArrow,
    onClick: onClickProp,
    ...rest
  } = filterProps(parsedProps);

  const onClick: React.MouseEventHandler<HTMLButtonElement> = e => {
    if (rest.type !== 'submit') {
      e.preventDefault();
    }
    return onClickProp?.(e);
  };

  return (
    <button
      {...applyDataStateProps(rest)}
      // Explicitly remove type=submit or type=button
      // to prevent global css resets (eg tailwind) from affecting
      // the default styles of our components
      type={undefined}
      onClick={onClick}
      disabled={isDisabled}
      css={applyVariants(parsedProps) as any}
      data-variant={props.variant || 'primary'}
      ref={ref}
    >
      {isLoading && (
        <Flex
          as='span'
          gap={2}
          center
          css={{
            position: 'relative',
          }}
        >
          <Spinner
            aria-label={loadingText || 'Loading'}
            elementDescriptor={descriptors.spinner}
            sx={{
              position: loadingText ? undefined : 'absolute',
            }}
          />
          {loadingText || <span style={{ display: 'inline-flex', visibility: 'hidden' }}>{children}</span>}
        </Flex>
      )}
      {!isLoading && (hasArrow ? <ButtonChildrenWithArrow>{children}</ButtonChildrenWithArrow> : children)}
    </button>
  );
});

const SimpleButton = React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const parsedProps: ButtonProps = { ...props, isDisabled: props.isDisabled || props.isLoading };

  const { loadingText, isDisabled, hoverAsFocus, children, onClick: onClickProp, ...rest } = filterProps(parsedProps);

  const onClick: React.MouseEventHandler<HTMLButtonElement> = e => {
    if (rest.type !== 'submit') {
      e.preventDefault();
    }
    return onClickProp?.(e);
  };

  return (
    <button
      {...applyDataStateProps(rest)}
      // Explicitly remove type=submit or type=button
      // to prevent global css resets (eg tailwind) from affecting
      // the default styles of our components
      type={undefined}
      onClick={onClick}
      css={applyVariants(parsedProps) as any}
      disabled={isDisabled}
      data-variant={props.variant || 'primary'}
      ref={ref}
    >
      {children}
    </button>
  );
});

export { Button, SimpleButton };
