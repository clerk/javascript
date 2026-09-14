import { useRender } from '@clerk/headless/utils';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { inputStyles } from '../../utils/input.styles';
import { reset } from '../../utils/reset.styles';
import { useOptionalFieldControlProps } from '../field/field.context';
import { useOptionalInputGroupContext } from '../input-group/input-group.context';
import { sizes, styles } from './input.styles';

/** `default` provides field chrome; `ghost` keeps input sizing while its container provides chrome and focus styling. */
export type InputVariant = 'default' | 'ghost';

export interface InputProps extends Omit<MosaicComponentProps<'input'>, 'size'> {
  size?: 'sm' | 'md' | 'lg';
  /** Defaults to `ghost` inside InputGroup and `default` elsewhere. */
  variant?: InputVariant;
}

const variantStyles = {
  default: inputStyles.base,
  ghost: styles.ghost,
} as const;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function MosaicInput(
  {
    size: sizeProp,
    variant: variantProp,
    disabled: disabledProp,
    required: requiredProp,
    render,
    xstyle,
    id,
    'aria-invalid': ariaInvalid,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    ...rest
  },
  forwardedRef,
) {
  const inputGroup = useOptionalInputGroupContext();
  const variant = variantProp ?? (inputGroup ? 'ghost' : 'default');
  const fieldProps = useOptionalFieldControlProps({
    id,
    disabled: disabledProp,
    required: requiredProp,
    ariaInvalid,
    ariaLabelledBy,
    ariaDescribedBy,
  });
  const control = fieldProps ?? {
    id,
    disabled: disabledProp,
    required: requiredProp,
    'aria-invalid': ariaInvalid,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
  };
  const size = inputGroup?.size ?? sizeProp ?? 'md';
  const disabled = inputGroup?.disabled || control.disabled || false;

  return useRender({
    defaultTagName: 'input',
    render,
    ref: [forwardedRef, inputGroup?.inputRef],
    props: {
      ...control,
      disabled,
      'aria-invalid': inputGroup?.invalid ? true : control['aria-invalid'],
      ...mergeStyleProps(
        themeProps('input', { size, variant, disabled }),
        stylex.props(
          reset.base,
          styles.base,
          sizes[size],
          variantStyles[variant],
          variant === 'default' && disabled && inputStyles.disabled,
          xstyle,
        ),
        rest,
      ),
    },
  });
});
