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

export type InputVariant = 'default' | 'headless';

export interface InputProps extends Omit<MosaicComponentProps<'input'>, 'size'> {
  size?: 'sm' | 'md' | 'lg';
  /** Removes field chrome so a parent composition can provide it. @default 'default' */
  variant?: InputVariant;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function MosaicInput(
  {
    size: sizeProp,
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
  forwardedRef,
) {
  const inputGroup = useOptionalInputGroupContext();
  const fieldProps = useOptionalFieldControlProps({
    id,
    disabled: disabledProp,
    required: requiredProp,
    ariaInvalid,
    ariaLabelledBy,
    ariaDescribedBy,
  });
  const size = inputGroup?.size ?? sizeProp ?? 'md';
  const disabled = inputGroup?.disabled || fieldProps?.disabled || disabledProp || false;
  const required = fieldProps?.required ?? requiredProp;
  const ariaInvalidValue = inputGroup?.invalid ? true : (fieldProps?.['aria-invalid'] ?? ariaInvalid);
  const setGroupInput = inputGroup?.setInput;
  const setInputRef = React.useCallback(
    (node: HTMLInputElement | null) => {
      setGroupInput?.(node);
      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    },
    [forwardedRef, setGroupInput],
  );

  return useRender({
    defaultTagName: 'input',
    render,
    ref: setInputRef,
    props: {
      disabled,
      required,
      id: fieldProps?.id ?? id,
      'aria-invalid': ariaInvalidValue,
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
