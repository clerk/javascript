import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { useControllableState } from '../../primitives/hooks';
import type { MosaicStyleProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { focusOutline } from '../../styles/focus-outline.styles';
import { reset } from '../../styles/reset.styles';
import { visuallyHidden } from '../../styles/visually-hidden.styles';
import { FieldProvider, useOptionalFieldContext, useOptionalFieldControlProps } from '../field/field.context';
import { Item } from '../item';
import { Text } from '../text';
import { radioInputMarker } from './radio.markers.stylex';
import { firstLine, indicatorSizes, layouts, sizes, styles } from './radio.styles';

/** `stack` gives each choice its own row. `grid` fits as many columns of cards as the width allows. */
export type RadioLayout = 'stack' | 'grid';

export interface RadioGroupProps<T extends string = string>
  extends Omit<React.ComponentPropsWithoutRef<'div'>, 'defaultValue' | 'className' | 'style'>, MosaicStyleProps {
  value?: T;
  defaultValue?: T;
  onValueChange?: (value: T) => void;
  name?: string;
  disabled?: boolean;
  /** @default 'stack' */
  layout?: RadioLayout;
}

interface RadioGroupContextValue {
  name: string;
  submits: boolean;
  value: string | undefined;
  setValue: (value: string) => void;
  disabled: boolean | undefined;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null);

// eslint-disable-next-line typescript/consistent-type-assertions -- The ref wrapper drops the value type parameter; the group only hands back values its caller passed in.
const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(function MosaicRadioGroup(
  { value: valueProp, defaultValue, onValueChange, name: nameProp, disabled, layout = 'stack', xstyle, ...rest },
  ref,
) {
  const generatedName = React.useId();
  const [value, setValue] = useControllableState<string | undefined>(valueProp, defaultValue, next => {
    if (next !== undefined) {
      onValueChange?.(next);
    }
  });
  const context = React.useMemo<RadioGroupContextValue>(
    () => ({ name: nameProp ?? generatedName, submits: nameProp !== undefined, value, setValue, disabled }),
    [nameProp, generatedName, value, setValue, disabled],
  );

  return (
    <RadioGroupContext.Provider value={context}>
      <div
        ref={ref}
        role='radiogroup'
        aria-disabled={disabled || undefined}
        {...mergeStyleProps(
          themeProps('radio-group', { layout }),
          stylex.props(reset.base, layouts[layout], xstyle),
          rest,
        )}
      />
    </RadioGroupContext.Provider>
  );
}) as <T extends string = string>(
  props: RadioGroupProps<T> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement;

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
        form={group?.submits === false ? '' : undefined}
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

export interface RadioSectionProps
  extends Omit<React.ComponentPropsWithoutRef<'fieldset'>, 'className' | 'style'>, MosaicStyleProps {
  /** The section's heading, rendered as its `<legend>`. */
  label: React.ReactNode;
  /** @default 'stack' */
  layout?: RadioLayout;
}

/**
 * A titled set of choices inside a `Radio.Group`. Renders a `<fieldset>`, so assistive tech
 * announces its label as a group. Its radios still belong to the group around it: they share its
 * value and name, and arrow keys move across sections.
 */
const RadioSection = React.forwardRef<HTMLFieldSetElement, RadioSectionProps>(function MosaicRadioSection(
  { label, layout = 'stack', xstyle, children, ...rest },
  ref,
) {
  return (
    <fieldset
      ref={ref}
      {...mergeStyleProps(
        themeProps('radio-section', { layout }),
        stylex.props(reset.base, styles.section, xstyle),
        rest,
      )}
    >
      <Text
        render={<legend />}
        color='foreground-secondary'
        xstyle={styles.sectionLabel}
      >
        {label}
      </Text>
      <div {...mergeStyleProps(themeProps('radio-section-content'), stylex.props(reset.base, layouts[layout]))}>
        {children}
      </div>
    </fieldset>
  );
});

export interface RadioCardProps
  extends Omit<React.ComponentPropsWithoutRef<'label'>, 'className' | 'style'>, MosaicStyleProps {
  value: string;
  disabled?: boolean;
}

/**
 * A choice of the `Radio.Group` around it, laid out as an `Item` row. It renders a `<label>` around
 * a visually hidden radio, so a click anywhere on it picks `value`. Its `Radio.Label` names the
 * radio and its `Radio.Description` describes it.
 *
 * @example
 * <Radio.Card value='okta'>
 *   <Radio.Content><Radio.Label>Okta workforce</Radio.Label></Radio.Content>
 * </Radio.Card>
 */
const RadioCard = React.forwardRef<HTMLLabelElement, RadioCardProps>(function MosaicRadioCard(
  { value, disabled = false, xstyle, children, ...rest },
  ref,
) {
  const group = React.useContext(RadioGroupContext);
  const checked = group?.value === value;

  return (
    <FieldProvider
      orientation='vertical'
      disabled={disabled}
      focusableWhenDisabled={false}
      required={false}
      invalid={false}
    >
      <Item.Root
        render={
          <label
            ref={ref}
            {...mergeStyleProps(
              themeProps('radio-card', { checked, disabled: disabled || group?.disabled }),
              stylex.props(focusOutline.within, xstyle),
              rest,
            )}
          />
        }
      >
        <RadioItem
          value={value}
          xstyle={visuallyHidden.base}
        />
        {children}
      </Item.Root>
    </FieldProvider>
  );
});

export const Radio = {
  Group: RadioGroup,
  Item: RadioItem,
  Section: RadioSection,
  Card: RadioCard,
  Media: Item.Media,
  Content: Item.Content,
  Label: Item.Label,
  Description: Item.Description,
};
