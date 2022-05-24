import { createCssVariables, createVariants, PrimitiveProps, StyleVariants } from '../styledSystem';

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
    backgroundColor: 'unset',
    cursor: 'pointer',
    borderRadius: theme.radii.$md,
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
        '&:hover': {
          backgroundColor: accentColorHover,
        },
        '&:active': {
          backgroundColor: accentColorActive,
        },
      },
      outline: {
        border: '1px solid',
        borderColor: accentColor,
        color: accentColor,
        '&:hover': {
          borderColor: accentColorHover,
        },
        '&:active': {
          borderColor: accentColorActive,
        },
      },
      ghost: {
        color: accentColor,
      },
    },
    size: {
      md: {
        py: theme.space.$2x5,
        px: theme.space.$5,
      },
    },
  },
  defaultVariants: {
    colorScheme: 'primary',
    variant: 'solid',
    size: 'md',
  },
}));

type ButtonProps = PrimitiveProps<'button'> &
  StyleVariants<typeof applyVariants> & {
    isLoading?: boolean;
    isDisabled?: boolean;
  };

const Button = (props: ButtonProps): JSX.Element => {
  const propsWithoutVariants = filterProps(props);
  const { isDisabled, isLoading, ...rest } = propsWithoutVariants;
  return (
    <button
      {...rest}
      disabled={isDisabled}
      css={applyVariants(props)}
    />
  );
};

export { Button };
