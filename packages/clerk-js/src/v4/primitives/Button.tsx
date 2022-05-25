import React from 'react';

import { createCssVariables, createVariants, cssutils, PrimitiveProps, StyleVariants } from '../styledSystem';
import { Flex } from './Flex';
import { Spinner } from './Spinner';
import { Text } from './Text';

const vars = createCssVariables('accent', 'accentDark', 'accentDarker', 'accentLighter', 'accentLightest');

const { applyVariants, filterProps } = createVariants(theme => {
  return {
    base: {
      margin: 0,
      padding: 0,
      border: 0,
      outline: 0,
      cursor: 'pointer',
      backgroundColor: 'unset',
      color: 'currentColor',
      borderRadius: theme.radii.$md,
      ...cssutils.addCenteredFlex('inline-flex'),
      ...cssutils.addFocusRing(theme),
      transitionProperty: theme.transitionProperty.$common,
      transitionDuration: theme.transitionDuration.$controls,
      '&:disabled': {
        cursor: 'not-allowed',
        pointerEvents: 'none',
        opacity: theme.opacity.$disabled,
      },
    },
    variants: {
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
          [vars.accentLightest]: theme.colors.$gray50,
          [vars.accentLighter]: theme.colors.$gray100,
          [vars.accent]: theme.colors.$gray500,
          [vars.accentDark]: theme.colors.$gray600,
          [vars.accentDarker]: theme.colors.$gray700,
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
          border: '1px solid',
          borderColor: vars.accent,
          color: vars.accent,
          '&:hover': { backgroundColor: vars.accentLightest },
          '&:active': { backgroundColor: vars.accentLighter },
        },
        ghost: {
          color: vars.accent,
          '&:hover': { backgroundColor: vars.accentLightest },
          '&:active': { backgroundColor: vars.accentLighter },
        },
      },
      size: {
        md: { minHeight: theme.sizes.$9, padding: `${theme.space.$2x5} ${theme.space.$5}` },
      },
    },
    defaultVariants: {
      colorScheme: 'primary',
      variant: 'solid',
      size: 'md',
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
  const { isLoading, isDisabled, loadingText, icon, children, ...rest } = filterProps(parsedProps);

  return (
    <button
      {...rest}
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
          {loadingText && <Text variant='buttonLabel'>{loadingText}</Text>}
        </Flex>
      )}
      {!isLoading && (
        <>
          <Text variant='buttonLabel'>{children}</Text>
        </>
      )}
    </button>
  );
});

export { Button };
