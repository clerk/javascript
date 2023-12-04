import type { PropsWithChildren } from 'react';
import React from 'react';

import { descriptors, Icon, Spinner } from '../customizables';
import { ArrowRightButtonIcon } from '../icons';
import type { PrimitiveProps, StyleVariants } from '../styledSystem';
import { common, createCssVariables, createVariants } from '../styledSystem';
import { applyDataStateProps } from './applyDataStateProps';
import { Flex } from './Flex';

const vars = createCssVariables('idle', 'hover', 'text', 'textHover', 'borderShadow');

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
        iconLg: { minHeight: theme.sizes.$14, width: theme.sizes.$14 },
        xs: { minHeight: theme.sizes.$1x5, padding: `${theme.space.$1x5} ${theme.space.$1x5}` },
        sm: {
          minHeight: theme.sizes.$7,
          padding: `${theme.space.$1x5} ${theme.space.$3x5}`,
        },
        md: {
          minHeight: theme.sizes.$9,
          padding: `${theme.space.$2x5} ${theme.space.$5}`,
          letterSpacing: theme.sizes.$xxs,
        },
      },
      colorScheme: {
        primary: {
          [vars.idle]: theme.colors.$primary800, //we should ideally make this primary500
          [vars.hover]: theme.colors.$primary800, //same on purpose
          [vars.text]: theme.colors.$colorTextOnPrimaryBackground,
          [vars.textHover]: theme.colors.$colorTextOnPrimaryBackground,
          [vars.borderShadow]:
            '0px 0px 0px 1px #2F3037, 0px 1px 1px 0px rgba(255, 255, 255, 0.07) inset, 0px 2px 3px 0px rgba(34, 42, 53, 0.20), 0px 1px 1px 0px rgba(0, 0, 0, 0.24)',
        },
        secondary: {
          [vars.idle]: theme.colors.$transparent,
          [vars.hover]: theme.colors.$blackAlpha50,
          [vars.text]: theme.colors.$colorText,
          [vars.textHover]: theme.colors.$colorText,
          [vars.borderShadow]:
            '0px 2px 3px -1px rgba(0, 0, 0, 0.08), 0px 1px 0px 0px rgba(0, 0, 0, 0.02), 0px 0px 0px 1px rgba(0, 0, 0, 0.08)',
        },
        danger: {
          [vars.idle]: theme.colors.$transparent,
          [vars.hover]: theme.colors.$danger50,
          [vars.text]: theme.colors.$colorText,
          [vars.textHover]: theme.colors.$danger400,
          [vars.borderShadow]:
            '0px 2px 3px -1px rgba(0, 0, 0, 0.08), 0px 1px 0px 0px rgba(0, 0, 0, 0.02), 0px 0px 0px 1px rgba(0, 0, 0, 0.08)',
        },
      },
      variant: {
        primary: {
          backgroundColor: vars.idle,
          color: vars.text,
          boxShadow: vars.borderShadow,
          '&:hover': {
            backgroundColor: vars.hover,
            color: vars.textHover,
          },
          ':before': {
            position: 'absolute',
            content: '""',
            borderRadius: 'inherit',
            zIndex: -1,
            inset: 0,
            background: `linear-gradient(180deg, ${theme.colors.$whiteAlpha300} 0%, ${theme.colors.$transparent} 100%)`,
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
            background: `linear-gradient(180deg, ${theme.colors.$whiteAlpha200} 0%, ${theme.colors.$transparent} 100%)`,
          },
          ':hover::after': {
            opacity: 1,
          },
          ':active::after': {
            opacity: 0,
          },
        },
        secondary: {
          backgroundColor: vars.idle,
          color: vars.text,
          boxShadow: vars.borderShadow,
          '&:hover': {
            backgroundColor: vars.hover,
            color: vars.textHover,
          },
          '&:focus': props.hoverAsFocus ? { backgroundColor: vars.hover, color: vars.textHover } : undefined,
          '&:active': { backgroundColor: vars.idle },
        },
        ghost: {
          color: vars.text,
          '&:hover': { backgroundColor: vars.hover, color: vars.textHover },
          '&:focus': props.hoverAsFocus ? { backgroundColor: vars.hover, color: vars.textHover } : undefined,
          '&:active': { backgroundColor: vars.idle },
        },
        ghostIcon: {
          color: vars.idle,
          minHeight: theme.sizes.$6,
          width: theme.sizes.$6,
          padding: `${theme.space.$1} ${theme.space.$1}`,
          '&:hover': { color: vars.hover },
          '&:focus': props.hoverAsFocus ? { backgroundColor: vars.hover } : undefined,
          '&:active': { color: vars.idle },
        },
        link: {
          ...common.textVariants(theme).smallRegular,
          minHeight: 'fit-content',
          height: 'fit-content',
          width: 'fit-content',
          textTransform: 'none',
          padding: 0,
          color: vars.idle,
          '&:hover': { textDecoration: 'underline' },
          '&:focus': props.hoverAsFocus ? { textDecoration: 'underline' } : undefined,
          '&:active': { color: vars.idle },
        },
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
      textVariant: 'buttonSmallRegular',
      colorScheme: 'primary',
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
      gap={2}
    >
      {children}
      <Icon
        icon={ArrowRightButtonIcon}
        sx={t => ({
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
          {loadingText || <span style={{ opacity: 0 }}>{children}</span>}
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
      ref={ref}
    >
      {children}
    </button>
  );
});

export { Button, SimpleButton };
