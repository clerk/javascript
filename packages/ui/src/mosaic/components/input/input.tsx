import { useRender } from '@clerk/headless/utils';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../reset.styles';
import { useOptionalFieldControlSemantics } from '../field/field';
import { sizes, styles } from './input.styles';

export interface InputProps extends Omit<MosaicComponentProps<'input'>, 'size'> {
  size?: 'sm' | 'md' | 'lg';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function MosaicInput(
  {
    size = 'md',
    id,
    disabled = false,
    required = false,
    render,
    className,
    style,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    'aria-disabled': ariaDisabled,
    'aria-required': ariaRequired,
    ...rest
  },
  ref,
) {
  const field = useOptionalFieldControlSemantics({
    disabled,
    required,
    ariaLabelledBy,
    ariaDescribedBy,
    ariaInvalid,
    ariaDisabled,
    ariaRequired,
  });
  const effectiveDisabled = field?.state.disabled ?? disabled;
  const effectiveRequired = field?.state.required ?? required;
  const theme = field
    ? mergeStyleProps(
        themeProps('field-control', field.state),
        themeProps('input', { size, disabled: effectiveDisabled }),
      )
    : themeProps('input', { size, disabled: effectiveDisabled });

  return useRender({
    defaultTagName: 'input',
    render,
    ref,
    props: {
      id: field?.props.id ?? id,
      disabled: effectiveDisabled,
      required: effectiveRequired,
      'aria-labelledby': field?.props['aria-labelledby'] ?? ariaLabelledBy,
      'aria-describedby': field?.props['aria-describedby'] ?? ariaDescribedBy,
      'aria-invalid': field?.props['aria-invalid'] ?? ariaInvalid,
      'aria-disabled': field?.props['aria-disabled'] ?? ariaDisabled,
      'aria-required': field?.props['aria-required'] ?? ariaRequired,
      ...mergeStyleProps(
        theme,
        stylex.props(reset.base, styles.base, sizes[size], effectiveDisabled && styles.disabled),
        className,
        style,
      ),
      ...rest,
    },
  });
});
