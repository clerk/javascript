import type { PropsWithChildren } from 'react';
import React from 'react';

import { descriptors, Icon, Spinner } from '../customizables';
import { ArrowRightButtonIcon } from '../icons';
import type { PrimitiveProps, StyleVariants } from '../styledSystem';
import { common, createCssVariables, createVariants } from '../styledSystem';
import { applyDataStateProps } from './applyDataStateProps';
import { Flex } from './Flex';

const vars = createCssVariables('accent', 'accentHover', 'accentContrast', 'alpha', 'border');

const { applyVariants, filterProps } = createVariants(
  (theme, props: OwnProps & { colorScheme?: 'primary' | 'secondary' | 'neutral' | 'danger' }) => {
    return {
      base: {
        margin: 0,
        padding: 0,
        borderWidth: 0,
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
        colorScheme: {
          primary: {
            [vars.accent]: theme.colors.$primary500,
            [vars.accentHover]: theme.colors.$primaryHover,
            [vars.border]: theme.colors.$primary500,
            [vars.accentContrast]: theme.colors.$colorPrimaryForeground,
            [vars.alpha]: theme.colors.$neutralAlpha50,
          },
          secondary: {
            [vars.accent]: theme.colors.$colorBackground,
            [vars.accentHover]: `color-mix(in srgb, ${vars.accent}, ${theme.colors.$neutralAlpha50})`,
            [vars.border]: theme.colors.$primary500,
            [vars.accentContrast]: theme.colors.$colorForeground,
            [vars.alpha]: theme.colors.$neutralAlpha50,
          },
          neutral: {
            [vars.accent]: theme.colors.$neutralAlpha600,
            [vars.accentHover]: theme.colors.$neutralAlpha700,
            [vars.border]: theme.colors.$neutralAlpha200,
            [vars.accentContrast]: theme.colors.$white,
            [vars.alpha]: theme.colors.$neutralAlpha50,
          },
          danger: {
            [vars.accent]: theme.colors.$danger500,
            [vars.accentHover]: theme.colors.$danger600,
            [vars.accentContrast]: theme.colors.$white,
            [vars.border]: theme.colors.$danger500,
            [vars.alpha]: theme.colors.$dangerAlpha50,
          },
        },
        variant: {
          solid: {
            backgroundColor: vars.accent,
            color: vars.accentContrast,
            borderWidth: theme.borderWidths.$normal,
            borderStyle: theme.borderStyles.$solid,
            borderColor: vars.accent,
            '&:hover': {
              backgroundColor: vars.accentHover,
            },
            '&:focus': props.hoverAsFocus
              ? {
                  backgroundColor: vars.accentHover,
                }
              : undefined,
          },
          outline: {
            borderWidth: theme.borderWidths.$normal,
            borderStyle: theme.borderStyles.$solid,
            borderColor: theme.colors.$borderAlpha150,
            color: theme.colors.$neutralAlpha600,
            '&:hover': { backgroundColor: theme.colors.$neutralAlpha50 },
            '&:focus': props.hoverAsFocus
              ? { backgroundColor: theme.colors.$neutralAlpha50, borderColor: theme.colors.$borderAlpha300 }
              : undefined,
          },
          bordered: {
            borderWidth: theme.borderWidths.$normal,
            borderStyle: theme.borderStyles.$solid,
            borderColor: theme.colors.$borderAlpha150,
            color: vars.accentContrast,
            backgroundColor: vars.accent,
            '&:hover': { backgroundColor: vars.accentHover },
            '&:focus': props.hoverAsFocus
              ? { backgroundColor: vars.accentHover, borderColor: theme.colors.$borderAlpha300 }
              : undefined,
          },
          ghost: {
            color: vars.accent,
            '&:hover': { backgroundColor: vars.alpha, color: vars.accentHover },
            '&:focus': props.hoverAsFocus ? { backgroundColor: vars.alpha, color: vars.accentHover } : undefined,
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
        variant: 'solid',
        colorScheme: 'primary',
        size: 'sm',
        focusRing: true,
      },
    };
  },
);
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
          marginInlineStart: t.space.$2,
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
      data-variant={props.variant || 'solid'}
      data-color={props.colorScheme || 'primary'}
      css={applyVariants(parsedProps)}
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
      css={applyVariants(parsedProps)}
      disabled={isDisabled}
      data-variant={props.variant || 'solid'}
      data-color={props.colorScheme || 'primary'}
      ref={ref}
    >
      {children}
    </button>
  );
});

export { Button, SimpleButton };
