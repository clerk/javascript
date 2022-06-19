import React from 'react';

import { common, createCssVariables, createVariants, PrimitiveProps, StyleVariants } from '../styledSystem';
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
        iconLg: { height: theme.sizes.$14, width: theme.sizes.$14 },
        xs: { height: theme.sizes.$1x5, padding: `${theme.space.$1x5} ${theme.space.$1x5}` },
        // md: { height: theme.sizes.$9, padding: `${theme.space.$2x5} ${theme.space.$4}` },
        md: { minHeight: theme.sizes.$9, padding: `${theme.space.$2x5} ${theme.space.$4}` },
      },
      colorScheme: {
        primary: {
          [vars.accentLightest]: theme.colors.$primary50,
          [vars.accentLighter]: theme.colors.$primary100,
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
          [vars.accent]: theme.colors.$text500,
          [vars.accentDark]: theme.colors.$blackAlpha600,
          [vars.accentDarker]: theme.colors.$blackAlpha700,
        },
      },
      variant: {
        solid: {
          backgroundColor: vars.accent,
          color: theme.colors.$white,
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
          border: theme.borders.$normal,
          borderRadius: theme.radii.$lg,
          borderColor: vars.border,
          '&:hover': { backgroundColor: vars.accentLightest },
          '&:active': { backgroundColor: vars.accentLighter },
        },
        ghostIcon: {
          color: vars.accent,
          height: theme.sizes.$6,
          width: theme.sizes.$6,
          padding: `${theme.space.$1} ${theme.space.$1}`,
          '&:hover': { color: vars.accentDark },
          '&:active': { color: vars.accentDarker },
        },
        link: {
          ...common.textVariants(theme).link,
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
};
type ButtonProps = OwnProps & StyleVariants<typeof applyVariants>;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const parsedProps: ButtonProps = { ...props, isDisabled: props.isDisabled || props.isLoading };
  const { isLoading, isDisabled, loadingText, children, ...rest } = filterProps(parsedProps);

  return (
    <button
      {...applyDataStateProps(rest)}
      type={rest.type || 'button'}
      disabled={isDisabled}
      css={applyVariants(parsedProps)}
      ref={ref}
    >
      {isLoading && (
        <Flex
          gap={2}
          center
        >
          <Spinner
            aria-busy
            aria-live='polite'
            aria-label={loadingText || 'Loading'}
          />
          {loadingText || undefined}
        </Flex>
      )}
      {!isLoading && children}
    </button>
  );
});

type BlockButtonIconProps = ButtonProps & { leftIcon?: React.ReactElement; rightIcon?: React.ReactElement };

/**
 * For the state of the right arrow icon in this composite component
 * we're using CSS variables because we do not want to increase the
 * CSS rule specificity using a different method like classnames/styles.
 * `sx` is a "weak style" attribute with a specificity of 1, so it's easily
 * overridable from the outside
 */
const BlockButtonIcon = React.forwardRef<HTMLButtonElement, BlockButtonIconProps>((props, ref) => {
  const parsedProps: BlockButtonIconProps = { ...props, isDisabled: props.isDisabled || props.isLoading };
  const { isLoading, isDisabled, loadingText, children, leftIcon, rightIcon, ...rest } = filterProps(parsedProps);

  const leftIconElement = leftIcon
    ? React.cloneElement(leftIcon, {
        sx: [leftIcon.props.sx, theme => ({ width: theme.sizes.$4, marginRight: theme.space.$4 })],
      })
    : null;

  return (
    <button
      {...rest}
      type={rest.type || 'button'}
      disabled={isDisabled}
      css={[
        applyVariants({ block: true, variant: 'outline', colorScheme: 'neutral', textVariant: 'link', ...parsedProps }),
        theme => ({
          color: theme.colors.$text500,
          '--arrow-opacity': '0',
          '--arrow-transform': `translateX(-${theme.space.$2});`,
          '&:hover,&:focus ': {
            '--arrow-opacity': '1',
            '--arrow-transform': 'translateX(0px);',
          },
        }),
      ]}
      ref={ref}
    >
      {isLoading ? (
        <Spinner
          aria-busy
          aria-live='polite'
          aria-label={loadingText || 'Loading'}
          css={theme => ({ marginRight: theme.space.$4 })}
        />
      ) : (
        leftIconElement
      )}

      {children}

      {rightIcon &&
        React.cloneElement(rightIcon, {
          sx: [
            rightIcon.props.sx,
            theme => ({
              color: theme.colors.$gray500,
              transition: 'all 100ms ease',
              opacity: `var(--arrow-opacity)`,
              transform: `var(--arrow-transform)`,
            }),
          ],
        })}
    </button>
  );
});

export { Button, BlockButtonIcon };
