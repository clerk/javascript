import React from 'react';

import { createCssVariables, createVariants, cssutils, PrimitiveProps, StyleVariants } from '../styledSystem';
import { Flex } from './Flex';
import { Spinner } from './Spinner';

const { accentColor, accentColorActive, accentColorHover } = createCssVariables(
  'accentColor',
  'accentColorHover',
  'accentColorActive',
);

const { applyVariants, filterProps } = createVariants(theme => ({
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
    '&:disabled': {
      cursor: 'not-allowed',
      pointerEvents: 'none',
      opacity: theme.opacity.$disabled,
    },
  },
  variants: {
    colorScheme: {
      primary: {
        [accentColorActive]: theme.colors.$primary400,
        [accentColor]: theme.colors.$primary500,
        [accentColorHover]: theme.colors.$primary600,
      },
      danger: {
        [accentColorActive]: theme.colors.$danger300,
        [accentColor]: theme.colors.$danger500,
        [accentColorHover]: theme.colors.$danger600,
      },
    },
    variant: {
      solid: {
        backgroundColor: accentColor,
        color: theme.colors.$white,
        '&:hover': { backgroundColor: accentColorHover },
        '&:active': { backgroundColor: accentColorActive },
      },
      outline: {
        border: '1px solid',
        borderColor: accentColor,
        color: accentColor,
        '&:hover': { borderColor: accentColorHover },
        '&:active': { borderColor: accentColorActive },
      },
      ghost: {
        color: accentColor,
        '&:hover': { color: accentColorHover },
        '&:active': { color: accentColorActive },
      },
    },
    size: {
      md: { padding: `${theme.space.$2x5} ${theme.space.$5}` },
    },
  },
  defaultVariants: {
    colorScheme: 'primary',
    variant: 'solid',
    size: 'md',
  },
}));

type OwnProps = PrimitiveProps<'button'> & { isLoading?: boolean; loadingText?: string; isDisabled?: boolean };
type ButtonProps = OwnProps & StyleVariants<typeof applyVariants>;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const parsedProps: ButtonProps = { ...props, isDisabled: props.isDisabled || props.isLoading };
  const { isLoading, isDisabled, loadingText, children, ...rest } = filterProps(parsedProps);

  return (
    <button
      {...rest}
      disabled={isDisabled}
      css={applyVariants(parsedProps)}
      ref={ref}
    >
      {isLoading ? (
        <Flex gap={2}>
          <Spinner />
          {loadingText || children}
        </Flex>
      ) : (
        children
      )}
    </button>
  );
});

export { Button };
