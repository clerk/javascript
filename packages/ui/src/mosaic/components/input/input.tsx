import { useRender } from '@clerk/headless/utils';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { inputSurface } from '../../utils/input-surface.styles';
import { reset } from '../../utils/reset.styles';
import { useOptionalFieldControlProps } from '../field/field.context';
import { sizes, styles } from './input.styles';

export interface InputProps extends Omit<MosaicComponentProps<'input'>, 'size'> {
  size?: 'sm' | 'md' | 'lg';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function MosaicInput(
  {
    size = 'md',
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
        themeProps('input', { size, disabled }),
        stylex.props(reset.base, inputSurface.base, styles.base, sizes[size], disabled && inputSurface.disabled),
        className,
        style,
      ),
      ...rest,
    },
  });
});
