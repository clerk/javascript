import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { useControllableState } from '../../primitives/hooks';
import type { MosaicStyleProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { focusOutline } from '../../styles/focus-outline.styles';
import { reset } from '../../styles/reset.styles';
import { useOptionalFieldContext, useOptionalFieldControlProps } from '../field/field.context';
import { radioInputMarker } from './radio.markers.stylex';
import { firstLine, indicatorSizes, sizes, styles } from './radio.styles';

export interface RadioGroupProps
  extends Omit<React.ComponentPropsWithoutRef<'div'>, 'defaultValue' | 'className' | 'style'>, MosaicStyleProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  disabled?: boolean;
}

interface RadioGroupContextValue {
  name: string;
  value: string | undefined;
  setValue: (value: string) => void;
  disabled: boolean | undefined;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null);

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(function MosaicRadioGroup(
  { value: valueProp, defaultValue, onValueChange, name: nameProp, disabled, xstyle, ...rest },
  ref,
) {
  const generatedName = React.useId();
  const [value, setValue] = useControllableState<string | undefined>(valueProp, defaultValue, next => {
    if (next !== undefined) {
      onValueChange?.(next);
    }
  });
  const context = React.useMemo<RadioGroupContextValue>(
    () => ({ name: nameProp ?? generatedName, value, setValue, disabled }),
    [nameProp, generatedName, value, setValue, disabled],
  );

  return (
    <RadioGroupContext.Provider value={context}>
      <div
        ref={ref}
        role='radiogroup'
        aria-disabled={disabled || undefined}
        {...mergeStyleProps(themeProps('radio-group'), stylex.props(reset.base, styles.group, xstyle), rest)}
      />
    </RadioGroupContext.Provider>
  );
});

export interface RadioItemProps
  extends
    Omit<React.ComponentPropsWithoutRef<'input'>, 'type' | 'size' | 'value' | 'className' | 'style'>,
    MosaicStyleProps {
  size?: 'sm' | 'md';
  value?: string;
}

const RadioItem = React.forwardRef<HTMLInputElement, RadioItemProps>(function MosaicRadioItem(
  {
    size = 'md',
    value,
    checked: checkedProp,
    onChange,
    name: nameProp,
    disabled: disabledProp,
    required: requiredProp,
    id,
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
    ariaLabelledBy,
    ariaDescribedBy,
  });
  const group = React.useContext(RadioGroupContext);
  const disabled = (fieldProps?.disabled ?? disabledProp) || group?.disabled;
  const checked = group && value !== undefined ? group.value === value : checkedProp;

  return (
    <span
      {...mergeStyleProps(
        themeProps('radio', { size, disabled }),
        stylex.props(reset.base, styles.root, sizes[size], horizontalField && firstLine[size], xstyle),
      )}
    >
      <input
        ref={ref}
        type='radio'
        value={value}
        name={group?.name ?? nameProp}
        checked={checked}
        onChange={event => {
          onChange?.(event);
          if (group && value !== undefined) {
            group.setValue(value);
          }
        }}
        disabled={disabled}
        required={fieldProps?.required ?? requiredProp}
        id={fieldProps?.id ?? id}
        aria-labelledby={fieldProps?.['aria-labelledby'] ?? ariaLabelledBy}
        aria-describedby={fieldProps?.['aria-describedby'] ?? ariaDescribedBy}
        {...mergeStyleProps(
          themeProps('radio-input'),
          stylex.props(
            reset.base,
            focusOutline.visible,
            styles.input,
            styles.hitTarget,
            horizontalField && styles.fieldHitTarget,
            sizes[size],
            radioInputMarker,
          ),
          rest,
        )}
      />
      <span
        aria-hidden
        {...mergeStyleProps(
          themeProps('radio-indicator'),
          stylex.props(reset.base, styles.indicator, indicatorSizes[size]),
        )}
      />
    </span>
  );
});

export const Radio = {
  Group: RadioGroup,
  Item: RadioItem,
};
