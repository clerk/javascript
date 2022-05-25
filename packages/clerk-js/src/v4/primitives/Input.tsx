import { createVariants, PrimitiveProps, StyleVariants } from '../styledSystem';
import { useInput } from './hooks/useInput';

// TODO: Connect with CSS variables

const { applyVariants, filterProps } = createVariants((theme, props) => ({
  base: {
    margin: 0,
    outline: 0,
    padding: `${theme.sizes.$2x5} ${theme.sizes.$4}`,
    fontStyle: 'normal',
    fontWeight: theme.fontWeights.$normal,
    border: '1px solid',
    borderColor: props.hasError ? theme.colors.$danger500 : theme.colors.$blackAlpha300,
    borderRadius: theme.radii.$md,
    '&:focus-visible': {
      borderColor: props.hasError ? theme.colors.$danger500 : theme.colors.$primary50,
      boxShadow: 'none',
    },
  },
  variants: {},
}));

type InputProps = PrimitiveProps<'input'> &
  StyleVariants<typeof applyVariants> & {
    isDisabled?: boolean;
    hasError?: boolean;
  };

const Input = (props: InputProps): JSX.Element => {
  const propsWithoutVariants = filterProps(props);
  const { onChange } = useInput(propsWithoutVariants.onChange);
  const { isDisabled, hasError, ...rest } = propsWithoutVariants;
  return (
    <input
      {...rest}
      onChange={onChange}
      disabled={isDisabled}
      css={applyVariants(props)}
    />
  );
};

export { Input };
