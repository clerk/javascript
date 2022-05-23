import { createStyles, PrimitiveProps, StyleVariants } from '../styledSystem';

const { applyVariants, filterProps } = createStyles(theme => ({
  base: {
    margin: 0,
    padding: 0,
    border: 0,
    backgroundColor: 'unset',
    flexCenter: '',
    cursor: 'pointer',
    borderRadius: theme.radii.$md,
    my: theme.space.$2x5,
    '&:disabled': {
      backgroundColor: theme.colors.$primary200,
    },
  },
  variants: {
    colorScheme: {
      primary: {
        '--color': theme.colors.$primary500,
        '--color-hover': theme.colors.$primary600,
        '--color-active': theme.colors.$primary300,
      },
      danger: {
        '--color': theme.colors.$danger500,
        '--color-hover': theme.colors.$danger700,
        '--color-active': theme.colors.$danger300,
      },
    },
    variant: {
      solid: {
        backgroundColor: 'var(--color)',
        color: theme.colors.$white,
        '&:hover': {
          backgroundColor: 'var(--color-hover)',
        },
      },
      outline: {
        border: '1px solid',
        borderColor: 'var(--color)',
        color: 'var(--color)',
        '&:hover': {
          borderColor: 'var(--color-hover)',
        },
      },
      ghost: {
        color: 'var(--color)',
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
