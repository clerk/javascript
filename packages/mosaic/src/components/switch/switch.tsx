import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { MosaicStyleProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { focusOutline } from '../../styles/focus-outline.styles';
import { reset } from '../../styles/reset.styles';
import { useOptionalFieldContext, useOptionalFieldControlProps } from '../field/field.context';
import { switchInputMarker } from './switch.markers.stylex';
import { firstLine, sizes, styles } from './switch.styles';

export interface SwitchProps
  extends
    Omit<React.ComponentPropsWithoutRef<'input'>, 'type' | 'role' | 'size' | 'className' | 'style'>,
    MosaicStyleProps {
  size?: 'sm' | 'md';
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(function MosaicSwitch(
  {
    size = 'md',
    disabled: disabledProp,
    required: requiredProp,
    id,
    'aria-invalid': ariaInvalid,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    xstyle,
    ...rest
  },
  ref,
) {
  const horizontalField = useOptionalFieldContext()?.orientation === 'horizontal';
  const fieldProps = useOptionalFieldControlProps({
    id,
    disabled: disabledProp,
    required: requiredProp,
    ariaInvalid,
    ariaLabelledBy,
    ariaDescribedBy,
  });
  const disabled = fieldProps?.disabled ?? disabledProp;

  return (
    <span
      {...mergeStyleProps(
        themeProps('switch', { size, disabled }),
        stylex.props(
          reset.base,
          styles.root,
          sizes[size],
          disabled && styles.disabled,
          horizontalField && firstLine[size],
          xstyle,
        ),
      )}
    >
      <input
        ref={ref}
        type='checkbox'
        role='switch'
        disabled={disabled}
        required={fieldProps?.required ?? requiredProp}
        id={fieldProps?.id ?? id}
        aria-invalid={fieldProps?.['aria-invalid'] ?? ariaInvalid}
        aria-labelledby={fieldProps?.['aria-labelledby'] ?? ariaLabelledBy}
        aria-describedby={fieldProps?.['aria-describedby'] ?? ariaDescribedBy}
        {...mergeStyleProps(
          themeProps('switch-input'),
          stylex.props(
            reset.base,
            focusOutline.visible,
            styles.input,
            styles.hitTarget,
            horizontalField && styles.fieldHitTarget,
            switchInputMarker,
          ),
          rest,
        )}
      />
      <span
        aria-hidden
        {...mergeStyleProps(themeProps('switch-thumb'), stylex.props(reset.base, styles.thumb))}
      />
    </span>
  );
});
