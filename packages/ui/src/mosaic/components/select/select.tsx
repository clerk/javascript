import type {
  SelectOptionProps as PrimitiveSelectOptionProps,
  SelectPopupProps as PrimitiveSelectPopupProps,
  SelectPortalProps,
  SelectProps as PrimitiveSelectProps,
} from '@clerk/headless/select';
import { Select as Primitive } from '@clerk/headless/select';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { focusOutline } from '../../utils/focus-outline.styles';
import { reset } from '../../utils/reset.styles';
import { truncationStyles } from '../../utils/typography.styles';
import { Button } from '../button';
import { mergeIds, useOptionalFieldControlProps } from '../field/field.context';
import { Icon } from '../icon';
import { scrollAreaRoot, scrollAreaViewport } from '../scroll-area';
import { selectOptionScope } from './select.markers.stylex';
import * as slots from './select.styles';

export interface SelectItem {
  value: string;
  /** Shown in the row and in the trigger once selected; also drives typeahead. */
  label: string;
  /**
   * Secondary line under the label. Rows with one are taller than the trigger, so pair it with
   * `alignItemWithTrigger={false}`.
   */
  description?: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<PrimitiveSelectProps, 'items'> {
  /**
   * Every choice. Required, unlike the primitive's: the options only mount while the listbox is
   * open, so this is what lets the closed trigger show the selected label. `Select.Popup`
   * renders them as `Select.Option`s when it is given no children.
   */
  items: SelectItem[];
}

const ItemsContext = React.createContext<SelectItem[]>([]);

/** Holds the selection and the items; renders no element of its own. */
export function SelectRoot({ items, children, ...rest }: SelectProps): React.ReactElement {
  return (
    <ItemsContext.Provider value={items}>
      <Primitive.Root
        items={items}
        {...rest}
      >
        {children}
      </Primitive.Root>
    </ItemsContext.Provider>
  );
}

export type SelectTriggerVariant = 'outline' | 'ghost';

export type SelectTriggerProps = MosaicComponentProps<'button'> & {
  /**
   * `outline` is the bordered form control; `ghost` drops the border for triggers that sit in
   * dense surfaces such as table rows.
   *
   * @default 'outline'
   */
  variant?: SelectTriggerVariant;
  /** Shown in place of the selected label while nothing is selected. */
  placeholder?: React.ReactNode;
};

/**
 * Opens the listbox and shows the selected option's label. Renders a neutral `md` `Button` by
 * default; pass `render` to supply your own element. Inside a `Field` it takes the field's id,
 * disabled, required, invalid, label, and message relationships.
 */
export const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(function MosaicSelectTrigger(
  {
    variant = 'outline',
    placeholder,
    render,
    className,
    style,
    children,
    id: idProp,
    disabled: disabledProp,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    'aria-required': ariaRequired,
    ...rest
  },
  ref,
) {
  const generatedId = React.useId();
  const valueId = `${generatedId}-value`;
  const fieldProps = useOptionalFieldControlProps({
    id: idProp,
    disabled: disabledProp,
    ariaInvalid,
    ariaLabelledBy,
    ariaDescribedBy,
    labelElementType: 'span',
  });
  const id = fieldProps?.id ?? idProp ?? generatedId;
  // A combobox takes no name from its content, so the value is named explicitly, after any label.
  // An `aria-label` is kept by naming the trigger itself.
  const labelledBy = fieldProps?.['aria-labelledby'] ?? ariaLabelledBy ?? (ariaLabel ? id : undefined);
  const trigger: SelectTriggerProps['render'] =
    render ??
    (props => (
      <Button
        variant={variant}
        color='neutral'
        size='md'
        {...props}
      />
    ));

  return (
    <Primitive.Trigger
      ref={ref}
      render={trigger}
      id={id}
      disabled={fieldProps?.disabled ?? disabledProp}
      aria-label={ariaLabel}
      aria-labelledby={mergeIds(labelledBy, children === undefined ? valueId : undefined)}
      aria-describedby={fieldProps?.['aria-describedby'] ?? ariaDescribedBy}
      aria-invalid={fieldProps?.['aria-invalid'] ?? ariaInvalid}
      aria-required={ariaRequired ?? (fieldProps?.required ? true : undefined)}
      {...mergeStyleProps(themeProps('select-trigger', { variant }), className, style)}
      {...rest}
    >
      {children ?? (
        <Primitive.Value
          id={valueId}
          placeholder={placeholder}
          {...mergeStyleProps(
            themeProps('select-value'),
            stylex.props(reset.base, truncationStyles.singleLine, slots.value.base),
          )}
        />
      )}
      <Icon
        name='chevron-down'
        size='sm'
        placement='inline-end'
        {...themeProps('select-trigger-icon')}
      />
    </Primitive.Trigger>
  );
});

export interface SelectPopupProps extends PrimitiveSelectPopupProps {
  /** Container the listbox portals into. Defaults to `document.body`. */
  portalRoot?: SelectPortalProps['root'];
}

/**
 * The floating surface: portals, positions, and renders the options. Given no children it renders
 * one `Select.Option` per root `item`; pass children to compose the rows yourself. The portal and
 * the positioner are not parts a consumer composes, so they stay out of the public API.
 */
export const SelectPopup = React.forwardRef<HTMLDivElement, SelectPopupProps>(function MosaicSelectPopup(
  { portalRoot, className, style, children, ...rest },
  ref,
) {
  const items = React.useContext(ItemsContext);

  return (
    <Primitive.Portal root={portalRoot}>
      <Primitive.Positioner
        {...mergeStyleProps(themeProps('select-positioner'), stylex.props(reset.base, slots.positioner.base))}
      >
        <Primitive.Popup
          ref={ref}
          {...mergeStyleProps(
            themeProps('select-popup'),
            stylex.props(reset.base, scrollAreaRoot, slots.popup.base),
            className,
            style,
          )}
          {...rest}
        >
          <div
            {...mergeStyleProps(
              themeProps('select-viewport'),
              stylex.props(reset.base, ...scrollAreaViewport(), slots.viewport.base),
            )}
          >
            {children ??
              items.map(item => (
                <SelectOption
                  key={item.value}
                  {...item}
                />
              ))}
          </div>
        </Primitive.Popup>
      </Primitive.Positioner>
    </Primitive.Portal>
  );
});

export interface SelectOptionProps extends Omit<PrimitiveSelectOptionProps, 'label' | 'children'>, SelectItem {}

/** A single choice: its label, an optional description, and a check when it is the selection. */
export const SelectOption = React.forwardRef<HTMLButtonElement, SelectOptionProps>(function MosaicSelectOption(
  { label, description, className, style, ...rest },
  ref,
) {
  const id = React.useId();
  const labelId = `${id}-label`;
  const descriptionId = `${id}-description`;
  const described = description !== undefined;

  return (
    <Primitive.Option
      ref={ref}
      label={label}
      aria-labelledby={labelId}
      aria-describedby={described ? descriptionId : undefined}
      {...mergeStyleProps(
        themeProps('select-option', { described }),
        stylex.props(
          reset.base,
          focusOutline.visible,
          selectOptionScope,
          slots.option.base,
          described && slots.option.described,
        ),
        className,
        style,
      )}
      {...rest}
    >
      <span {...mergeStyleProps(themeProps('select-option-content'), stylex.props(reset.base, slots.content.base))}>
        <span
          id={labelId}
          {...mergeStyleProps(themeProps('select-option-label'), stylex.props(reset.base, truncationStyles.singleLine))}
        >
          {label}
        </span>
        {described && (
          <span
            id={descriptionId}
            {...mergeStyleProps(
              themeProps('select-option-description'),
              stylex.props(reset.base, slots.description.base),
            )}
          >
            {description}
          </span>
        )}
      </span>
      <Icon
        name='check'
        size='sm'
        xstyle={slots.indicator.base}
        {...themeProps('select-option-indicator')}
      />
    </Primitive.Option>
  );
});

export const Select = {
  Root: SelectRoot,
  Trigger: SelectTrigger,
  Popup: SelectPopup,
  Option: SelectOption,
};
