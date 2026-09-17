import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { MosaicStyleProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { focusOutline } from '../../utils/focus-outline.styles';
import { reset } from '../../utils/reset.styles';
import { Icon } from '../icon';
import { checkboxInputMarker } from './checkbox.markers.stylex';
import { indicatorSizes, sizes, styles } from './checkbox.styles';

export interface CheckboxProps
  extends Omit<React.ComponentPropsWithoutRef<'input'>, 'type' | 'size' | 'className' | 'style'>, MosaicStyleProps {
  size?: 'sm' | 'md';
  indeterminate?: boolean;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(function MosaicCheckbox(
  { size = 'md', indeterminate = false, disabled, xstyle, ...rest },
  ref,
) {
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
        stylex.props(reset.base, styles.root, sizes[size], indicatorSizes[size], xstyle),
      )}
    >
      <input
        ref={setInputRef}
        type='checkbox'
        disabled={disabled}
        {...mergeStyleProps(
          themeProps('checkbox-input'),
          stylex.props(
            reset.base,
            focusOutline.visible,
            styles.input,
            styles.hitTarget,
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
          stylex.props(reset.base, styles.indicator, styles.checkedIndicator),
        )}
      >
        <Icon
          name='check'
          size='inherit'
        />
      </span>
      <span
        aria-hidden
        {...mergeStyleProps(
          themeProps('checkbox-indicator', { state: 'indeterminate' }),
          stylex.props(reset.base, styles.indicator, styles.indeterminateIndicator),
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
