import React from 'react';

import { common, createCssVariables, createVariants, PrimitiveProps, StyleVariants } from '../styledSystem';
import { colors } from '../utils';
import { applyDataStateProps } from './applyDataStateProps';
import { Flex } from './Flex';
import { Spinner } from './Spinner';

const vars = createCssVariables('accent', 'accentDark', 'accentDarker', 'accentLighter', 'accentLightest', 'border');

const { applyVariants, filterProps } = createVariants(theme => {
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
        md: { minHeight: theme.sizes.$9, padding: `${theme.space.$2x5} ${theme.space.$4}` },
      },
      colorScheme: {
        primary: {
          [vars.accentLightest]: theme.options.$darkMode
            ? colors.makeTransparent(theme.colors.$primary400, 0.8)
            : colors.makeTransparent(theme.colors.$primary300, 0.8),
          [vars.accentLighter]: theme.options.$darkMode
            ? colors.makeTransparent(theme.colors.$primary800, 0.5)
            : theme.colors.$primary100,
          [vars.accent]: theme.colors.$primary500,
          [vars.accentDark]: theme.colors.$primary600,
          [vars.accentDarker]: theme.colors.$primary700,
        },
        danger: {
          [vars.accentLightest]: theme.colors.$danger50,
          [vars.accentLighter]: theme.colors.$danger100,
          [vars.accent]: theme.colors.$danger500,
          [vars.accentDark]: theme.colors.$danger600,
          [vars.accentDarker]: theme.colors.$danger700,
        },
        neutral: {
          [vars.border]: theme.colors.$blackAlpha200,
          [vars.accentLightest]: theme.colors.$blackAlpha50,
          [vars.accentLighter]: theme.colors.$blackAlpha300,
          [vars.accent]: theme.colors.$colorText,
          [vars.accentDark]: theme.colors.$blackAlpha600,
          [vars.accentDarker]: theme.colors.$blackAlpha700,
        },
      },
      variant: {
        solid: {
          backgroundColor: vars.accent,
          color: theme.colors.$colorTextOnPrimaryBackground,
          '&:hover': { backgroundColor: vars.accentDark },
          '&:active': { backgroundColor: vars.accentDarker },
        },
        outline: {
          border: theme.borders.$normal,
          borderColor: vars.accentLighter,
          color: vars.accent,
          '&:hover': { backgroundColor: vars.accentLightest },
          '&:active': { backgroundColor: vars.accentLighter },
        },
        ghost: {
          color: vars.accent,
          '&:hover': { backgroundColor: vars.accentLightest },
          '&:active': { backgroundColor: vars.accentLighter },
        },
        icon: {
          color: vars.accent,
          border: theme.borders.$normal,
          borderRadius: theme.radii.$lg,
          borderColor: vars.border,
          '&:hover': { backgroundColor: vars.accentLightest },
          '&:active': { backgroundColor: vars.accentLighter },
        },
        ghostIcon: {
          color: vars.accent,
          minHeight: theme.sizes.$6,
          width: theme.sizes.$6,
          padding: `${theme.space.$1} ${theme.space.$1}`,
          '&:hover': { color: vars.accentDark },
          '&:active': { color: vars.accentDarker },
        },
        link: {
          ...common.textVariants(theme).smallRegular,
          minHeight: 'fit-content',
          height: 'fit-content',
          width: 'fit-content',
          textTransform: 'none',
          padding: 0,
          color: vars.accent,
          '&:hover': { textDecoration: 'underline' },
          '&:active': { color: vars.accentDark },
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
      textVariant: 'buttonRegularRegular',
      colorScheme: 'primary',
      variant: 'solid',
      size: 'md',
      focusRing: true,
    },
  };
});

type OwnProps = PrimitiveProps<'button'> & {
  isLoading?: boolean;
  loadingText?: string;
  isDisabled?: boolean;
  isActive?: boolean;
};
type ButtonProps = OwnProps & StyleVariants<typeof applyVariants>;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const parsedProps: ButtonProps = { ...props, isDisabled: props.isDisabled || props.isLoading };
  const { isLoading, isDisabled, loadingText, children, ...rest } = filterProps(parsedProps);

  return (
    <button
      type={rest.type || 'button'}
      {...applyDataStateProps(rest)}
      disabled={isDisabled}
      css={applyVariants(parsedProps)}
      ref={ref}
    >
      {isLoading && (
        <Flex
          as='span'
          gap={2}
          center
        >
          <Spinner
            css={{ position: loadingText ? undefined : 'absolute' }}
            aria-label={loadingText || 'Loading'}
          />
          {loadingText || <span style={{ opacity: 0 }}>{children}</span>}
        </Flex>
      )}
      {!isLoading && children}
    </button>
  );
});

export { Button };
