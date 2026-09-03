import { useRender } from '@clerk/headless/utils';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { inputStyles } from '../../utils/input.styles';
import { reset } from '../../utils/reset.styles';
import { useOptionalFieldControlProps } from '../field/field.context';
import { sizes, styles } from './input.styles';

export type InputVariant = 'default' | 'headless';

export interface InputProps extends Omit<MosaicComponentProps<'input'>, 'size'> {
  size?: 'sm' | 'md' | 'lg';
  /** Removes field chrome so a parent composition can provide it. @default 'default' */
  variant?: InputVariant;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function MosaicInput(
  {
    size = 'md',
    variant = 'default',
    disabled: disabledProp,
    required: requiredProp,
    render,
    className,
    style,
    id,
    'aria-invalid': ariaInvalid,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    ...rest
  },
  ref,
) {
  const fieldProps = useOptionalFieldControlProps({
    id,
    disabled: disabledProp,
    required: requiredProp,
    ariaInvalid,
    ariaLabelledBy,
    ariaDescribedBy,
  });
  const disabled = fieldProps?.disabled ?? disabledProp ?? false;
  const required = fieldProps?.required ?? requiredProp;

  return useRender({
    defaultTagName: 'input',
    render,
    ref,
    props: {
      disabled,
      required,
      id: fieldProps?.id ?? id,
      'aria-invalid': fieldProps?.['aria-invalid'] ?? ariaInvalid,
      'aria-labelledby': fieldProps?.['aria-labelledby'] ?? ariaLabelledBy,
      'aria-describedby': fieldProps?.['aria-describedby'] ?? ariaDescribedBy,
      ...mergeStyleProps(
        themeProps('input', { size, variant, disabled }),
        stylex.props(
          reset.base,
          styles.base,
          sizes[size],
          variant === 'default' && inputStyles.base,
          variant === 'headless' && styles.headless,
          variant === 'default' && disabled && inputStyles.disabled,
        ),
        className,
        style,
      ),
      ...rest,
    },
  });
});
