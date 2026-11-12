'use client';

import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { Checkmark } from '../../icons/glyphs/checkmark';
import { ChevronDown } from '../../icons/glyphs/chevron-down';
import { X } from '../../icons/glyphs/x';
import type { ComboboxProps } from '../../primitives/combobox';
import { Combobox as HeadlessCombobox } from '../../primitives/combobox';
import { useRender } from '../../primitives/utils';
import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { chipStyles } from '../../styles/chip.styles';
import { focusOutline } from '../../styles/focus-outline.styles';
import { inputStyles } from '../../styles/input.styles';
import { reset } from '../../styles/reset.styles';
import { Button } from '../button';
import { useOptionalFieldContext, useOptionalFieldControlProps } from '../field/field.context';
import { Icon } from '../icon';
import { Input, type InputVariant } from '../input';
import { useOptionalInputGroupContext } from '../input-group/input-group.context';
import { scrollAreaRoot, scrollAreaViewport } from '../scroll-area';
import { styles, trigger } from './combobox.styles';

export type ComboboxRootProps = ComboboxProps;
export type ComboboxSize = 'sm' | 'md' | 'lg';
export type ComboboxTriggerProps = MosaicComponentProps<'button'>;
export type ComboboxClearProps = MosaicComponentProps<'button'>;
export const ComboboxCollection = HeadlessCombobox.Collection;
export const ComboboxValue = HeadlessCombobox.Value;
export type ComboboxValueProps = React.ComponentProps<typeof HeadlessCombobox.Value>;

const ComboboxAnchorContext = React.createContext<{
  anchor: HTMLElement | null;
  setAnchor: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
} | null>(null);

const ComboboxInChipsContext = React.createContext(false);

export function ComboboxRoot({ sideOffset = 8, openOnInputClick = true, ...props }: ComboboxRootProps) {
  const field = useOptionalFieldContext();
  const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);
  const context = React.useMemo(() => ({ anchor, setAnchor }), [anchor]);
  return (
    <ComboboxAnchorContext.Provider value={context}>
      <HeadlessCombobox.Root
        sideOffset={sideOffset}
        openOnInputClick={openOnInputClick}
        {...props}
        disabled={props.disabled ?? field?.disabled}
        focusableWhenDisabled={props.focusableWhenDisabled ?? field?.focusableWhenDisabled}
      />
    </ComboboxAnchorContext.Provider>
  );
}

export const ComboboxTrigger = React.forwardRef<HTMLButtonElement, ComboboxTriggerProps>(function MosaicComboboxTrigger(
  { xstyle, render, children, ...rest },
  ref,
) {
  return (
    <HeadlessCombobox.Trigger
      ref={ref}
      render={
        render ??
        (props => (
          <Button
            xstyle={trigger.base}
            {...props}
          />
        ))
      }
      {...mergeStyleProps(themeProps('combobox-trigger'), stylex.props(xstyle), rest)}
    >
      {children ?? (
        <Icon
          glyph={ChevronDown}
          size='md'
        />
      )}
    </HeadlessCombobox.Trigger>
  );
});

export const ComboboxClear = React.forwardRef<HTMLButtonElement, ComboboxClearProps>(function MosaicComboboxClear(
  { xstyle, render, children, ...rest },
  ref,
) {
  return (
    <HeadlessCombobox.Clear
      ref={ref}
      render={
        render ??
        (props => (
          <Button
            xstyle={[trigger.base, trigger.clear]}
            {...props}
          />
        ))
      }
      {...mergeStyleProps(themeProps('combobox-clear'), stylex.props(xstyle), rest)}
    >
      {children ?? (
        <Icon
          glyph={X}
          size='md'
        />
      )}
    </HeadlessCombobox.Clear>
  );
});

export interface ComboboxInputProps extends Omit<MosaicComponentProps<'input'>, 'size'> {
  size?: ComboboxSize;
  variant?: InputVariant;
}

export const ComboboxInput = React.forwardRef<HTMLInputElement, ComboboxInputProps>(function MosaicComboboxInput(
  { size: sizeProp, variant: variantProp, render, xstyle, ...rest },
  ref,
) {
  const inputGroup = useOptionalInputGroupContext();
  const variant = variantProp ?? (inputGroup ? 'ghost' : 'default');
  const setAnchor = React.useContext(ComboboxAnchorContext)?.setAnchor;
  const inChips = React.useContext(ComboboxInChipsContext);
  const groupElement = inputGroup?.element;
  React.useLayoutEffect(() => {
    if (inChips) {
      return;
    }
    setAnchor?.(groupElement ?? null);
    return () => setAnchor?.(null);
  }, [groupElement, setAnchor, inChips]);
  const size = inputGroup?.size ?? sizeProp ?? 'md';

  if (inChips) {
    return (
      <ChipsInput
        ref={ref}
        render={render}
        xstyle={xstyle}
        {...rest}
      />
    );
  }

  return (
    <HeadlessCombobox.Input
      ref={ref}
      render={
        render ?? (
          <Input
            size={size}
            variant={variant}
          />
        )
      }
      {...mergeStyleProps(themeProps('combobox-input', { size, variant }), stylex.props(xstyle), rest)}
    />
  );
});

const ChipsInput = React.forwardRef<HTMLInputElement, MosaicComponentProps<'input'>>(function MosaicComboboxChipsInput(
  {
    id,
    required: requiredProp,
    'aria-invalid': ariaInvalid,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    xstyle,
    ...rest
  },
  ref,
) {
  const fieldProps = useOptionalFieldControlProps({
    id,
    required: requiredProp,
    ariaInvalid,
    ariaLabelledBy,
    ariaDescribedBy,
  });

  return (
    <HeadlessCombobox.Input
      ref={ref}
      id={fieldProps?.id ?? id}
      required={fieldProps?.required ?? requiredProp}
      aria-invalid={fieldProps?.['aria-invalid'] ?? ariaInvalid}
      aria-labelledby={fieldProps?.['aria-labelledby'] ?? ariaLabelledBy}
      aria-describedby={fieldProps?.['aria-describedby'] ?? ariaDescribedBy}
      {...mergeStyleProps(themeProps('combobox-input'), stylex.props(reset.base, chipStyles.input, xstyle), rest)}
    />
  );
});

export type ComboboxChipsProps = MosaicComponentProps<'div'>;

/** The field for a `multiple` combobox. Holds the chips and the input, and anchors the popup. */
export const ComboboxChips = React.forwardRef<HTMLDivElement, ComboboxChipsProps>(function MosaicComboboxChips(
  { xstyle, ...rest },
  ref,
) {
  return (
    <ComboboxInChipsContext.Provider value>
      <HeadlessCombobox.Chips
        ref={ref}
        {...mergeStyleProps(
          themeProps('combobox-chips'),
          stylex.props(reset.base, inputStyles.group, chipStyles.field, styles.chips, xstyle),
          rest,
        )}
      />
    </ComboboxInChipsContext.Provider>
  );
});

export interface ComboboxChipProps extends MosaicComponentProps<'div'> {
  value: string;
  /** Accessible name of the chip's remove button. */
  removeLabel: string;
}

export const ComboboxChip = React.forwardRef<HTMLDivElement, ComboboxChipProps>(function MosaicComboboxChip(
  { removeLabel, children, xstyle, ...rest },
  ref,
) {
  return (
    <HeadlessCombobox.Chip
      ref={ref}
      {...mergeStyleProps(
        themeProps('combobox-chip'),
        stylex.props(reset.base, focusOutline.visible, chipStyles.chip, xstyle),
        rest,
      )}
    >
      <span {...mergeStyleProps(themeProps('combobox-chip-label'), stylex.props(reset.base, chipStyles.label))}>
        {children}
      </span>
      <HeadlessCombobox.ChipRemove
        aria-label={removeLabel}
        {...mergeStyleProps(themeProps('combobox-chip-remove'), stylex.props(reset.base, chipStyles.remove))}
      >
        <Icon
          glyph={X}
          size='md'
        />
      </HeadlessCombobox.ChipRemove>
    </HeadlessCombobox.Chip>
  );
});

export interface ComboboxPopupProps extends MosaicComponentProps<'div'> {
  /** Overrides positioning against the input group or standalone input. */
  anchor?: React.ComponentPropsWithoutRef<typeof HeadlessCombobox.Positioner>['anchor'];
  /** Container the combobox portals into. Defaults to `document.body`. */
  portalRoot?: React.ComponentPropsWithoutRef<typeof HeadlessCombobox.Portal>['root'];
}

/** Floating listbox surface. Portal and positioning are handled internally. */
export const ComboboxPopup = React.forwardRef<HTMLDivElement, ComboboxPopupProps>(function MosaicComboboxPopup(
  { anchor, portalRoot, xstyle, children, ...rest },
  ref,
) {
  const context = React.useContext(ComboboxAnchorContext);
  return (
    <HeadlessCombobox.Portal root={portalRoot}>
      <HeadlessCombobox.Positioner
        anchor={anchor ?? context?.anchor}
        {...mergeStyleProps(themeProps('combobox-positioner'), stylex.props(reset.base, styles.positioner))}
      >
        <HeadlessCombobox.Popup
          ref={ref}
          {...mergeStyleProps(
            themeProps('combobox-popup'),
            stylex.props(reset.base, scrollAreaRoot, styles.popup, xstyle),
            rest,
          )}
        >
          <div
            {...mergeStyleProps(
              themeProps('combobox-viewport'),
              stylex.props(reset.base, ...scrollAreaViewport(), styles.viewport),
            )}
          >
            {children}
          </div>
        </HeadlessCombobox.Popup>
      </HeadlessCombobox.Positioner>
    </HeadlessCombobox.Portal>
  );
});

export type ComboboxListProps = MosaicComponentProps<'div'>;

/** Scrollable listbox used when the combobox is embedded in another surface. */
export const ComboboxList = React.forwardRef<HTMLDivElement, ComboboxListProps>(function MosaicComboboxList(
  { xstyle, ...rest },
  ref,
) {
  return (
    <HeadlessCombobox.List
      ref={ref}
      {...mergeStyleProps(
        themeProps('combobox-list'),
        stylex.props(reset.base, scrollAreaRoot, ...scrollAreaViewport(), styles.list, xstyle),
        rest,
      )}
    />
  );
});

export interface ComboboxOptionProps extends MosaicComponentProps<'div'> {
  value: string;
  label?: string;
  disabled?: boolean;
}

export const ComboboxOption = React.forwardRef<HTMLDivElement, ComboboxOptionProps>(function MosaicComboboxOption(
  { xstyle, ...rest },
  ref,
) {
  return (
    <HeadlessCombobox.Option
      ref={ref}
      {...mergeStyleProps(themeProps('combobox-option'), stylex.props(reset.base, styles.option, xstyle), rest)}
    />
  );
});

export type ComboboxEmptyProps = MosaicComponentProps<'p'>;

export type ComboboxOptionIndicatorProps = MosaicComponentProps<'span'>;

export const ComboboxOptionIndicator = React.forwardRef<HTMLSpanElement, ComboboxOptionIndicatorProps>(
  function MosaicComboboxOptionIndicator({ xstyle, children, ...rest }, ref) {
    return (
      <HeadlessCombobox.OptionIndicator
        ref={ref}
        {...mergeStyleProps(themeProps('combobox-option-indicator'), stylex.props(styles.indicator, xstyle), rest)}
      >
        {children ?? (
          <Icon
            glyph={Checkmark}
            size='md'
          />
        )}
      </HeadlessCombobox.OptionIndicator>
    );
  },
);

export const ComboboxEmpty = React.forwardRef<HTMLParagraphElement, ComboboxEmptyProps>(function MosaicComboboxEmpty(
  { render, xstyle, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'p',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('combobox-empty'), stylex.props(reset.base, styles.empty, xstyle), rest),
    },
  });
});

export const Combobox = {
  Root: ComboboxRoot,
  Collection: ComboboxCollection,
  Value: ComboboxValue,
  Chips: ComboboxChips,
  Chip: ComboboxChip,
  Input: ComboboxInput,
  Trigger: ComboboxTrigger,
  Clear: ComboboxClear,
  Popup: ComboboxPopup,
  List: ComboboxList,
  Option: ComboboxOption,
  OptionIndicator: ComboboxOptionIndicator,
  Empty: ComboboxEmpty,
};
