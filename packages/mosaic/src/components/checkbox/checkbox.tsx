import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { MosaicStyleProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { focusOutline } from '../../utils/focus-outline.styles';
import { reset } from '../../utils/reset.styles';
import { useOptionalFieldContext, useOptionalFieldControlProps } from '../field/field.context';
import { Icon } from '../icon';
import { checkboxInputMarker } from './checkbox.markers.stylex';
import { firstLine, indicatorSizes, sizes, styles } from './checkbox.styles';

export interface CheckboxProps
  extends Omit<React.ComponentPropsWithoutRef<'input'>, 'type' | 'size' | 'className' | 'style'>, MosaicStyleProps {
  size?: 'sm' | 'md';
  indeterminate?: boolean;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(function MosaicCheckbox(
  {
    size = 'md',
    indeterminate = false,
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
  const setInputRef = React.useCallback(
    (node: HTMLInputElement | null) => {
      if (node) {
        node.indeterminate = indeterminate;
      }
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [indeterminate, ref],
  );

  return (
    <span
      {...mergeStyleProps(
        themeProps('checkbox', { size, disabled }),
        stylex.props(reset.base, styles.root, sizes[size], horizontalField && firstLine[size], xstyle),
      )}
    >
      <input
        ref={setInputRef}
        type='checkbox'
        disabled={disabled}
        required={fieldProps?.required ?? requiredProp}
        id={fieldProps?.id ?? id}
        aria-invalid={fieldProps?.['aria-invalid'] ?? ariaInvalid}
        aria-labelledby={fieldProps?.['aria-labelledby'] ?? ariaLabelledBy}
        aria-describedby={fieldProps?.['aria-describedby'] ?? ariaDescribedBy}
        {...mergeStyleProps(
          themeProps('checkbox-input'),
          stylex.props(
            reset.base,
            focusOutline.visible,
            styles.input,
            styles.hitTarget,
            horizontalField && styles.fieldHitTarget,
            sizes[size],
            checkboxInputMarker,
          ),
          rest,
        )}
      />
      <span
        aria-hidden
        {...mergeStyleProps(
          themeProps('checkbox-indicator', { state: 'checked' }),
          stylex.props(reset.base, styles.indicator, indicatorSizes[size], styles.checkedIndicator),
        )}
      >
        <Icon
          name='checkmark'
          size='inherit'
        />
      </span>
      <span
        aria-hidden
        {...mergeStyleProps(
          themeProps('checkbox-indicator', { state: 'indeterminate' }),
          stylex.props(reset.base, styles.indicator, indicatorSizes[size], styles.indeterminateIndicator),
        )}
      >
        <Icon
          name='minus'
          size='inherit'
        />
      </span>
    </span>
  );
});
