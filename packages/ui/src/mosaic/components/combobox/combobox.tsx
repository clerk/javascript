'use client';

import type { AutocompleteProps } from '@clerk/headless/autocomplete';
import { Autocomplete as Primitive } from '@clerk/headless/autocomplete';
import { useRender } from '@clerk/headless/utils';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../utils/reset.styles';
import { Input, type InputVariant } from '../input';
import { useOptionalInputGroupContext } from '../input-group/input-group.context';
import { scrollAreaRoot, scrollAreaViewport } from '../scroll-area';
import { styles } from './combobox.styles';

export type ComboboxRootProps = AutocompleteProps;
export type ComboboxSize = 'sm' | 'md' | 'lg';
export type ComboboxTriggerProps = MosaicComponentProps<'button'>;

export const ComboboxTrigger = React.forwardRef<HTMLButtonElement, ComboboxTriggerProps>(function MosaicComboboxTrigger(
  { className, style, ...props },
  ref,
) {
  return (
    <Primitive.Trigger
      ref={ref}
      {...mergeStyleProps(themeProps('combobox-trigger'), className, style)}
      {...props}
    />
  );
});

export interface ComboboxInputProps extends Omit<MosaicComponentProps<'input'>, 'size'> {
  size?: ComboboxSize;
  variant?: InputVariant;
}

export const ComboboxInput = React.forwardRef<HTMLInputElement, ComboboxInputProps>(function MosaicComboboxInput(
  { size: sizeProp, variant = 'default', render, className, style, ...rest },
  ref,
) {
  const inputGroup = useOptionalInputGroupContext();
  const size = inputGroup?.size ?? sizeProp ?? 'md';

  return (
    <Primitive.Input
      ref={ref}
      render={
        render ?? (
          <Input
            size={size}
            variant={variant}
          />
        )
      }
      {...mergeStyleProps(themeProps('combobox-input', { size, variant }), className, style)}
      {...rest}
    />
  );
});

export interface ComboboxPopupProps extends MosaicComponentProps<'div'> {
  /** Container the combobox portals into. Defaults to `document.body`. */
  portalRoot?: React.ComponentPropsWithoutRef<typeof Primitive.Portal>['root'];
}

/** Floating listbox surface. Portal and positioning are handled internally. */
export const ComboboxPopup = React.forwardRef<HTMLDivElement, ComboboxPopupProps>(function MosaicComboboxPopup(
  { portalRoot, className, style, children, ...rest },
  ref,
) {
  return (
    <Primitive.Portal root={portalRoot}>
      <Primitive.Positioner
        {...mergeStyleProps(themeProps('combobox-positioner'), stylex.props(reset.base, styles.positioner))}
      >
        <Primitive.Popup
          ref={ref}
          {...mergeStyleProps(
            themeProps('combobox-popup'),
            stylex.props(reset.base, scrollAreaRoot, styles.popup),
            className,
            style,
          )}
          {...rest}
        >
          <div
            {...mergeStyleProps(
              themeProps('combobox-viewport'),
              stylex.props(reset.base, ...scrollAreaViewport(), styles.viewport),
            )}
          >
            {children}
          </div>
        </Primitive.Popup>
      </Primitive.Positioner>
    </Primitive.Portal>
  );
});

export type ComboboxListProps = MosaicComponentProps<'div'>;

/** Scrollable listbox used when the combobox is embedded in another surface. */
export const ComboboxList = React.forwardRef<HTMLDivElement, ComboboxListProps>(function MosaicComboboxList(
  { className, style, ...rest },
  ref,
) {
  return (
    <Primitive.List
      ref={ref}
      {...mergeStyleProps(
        themeProps('combobox-list'),
        stylex.props(reset.base, scrollAreaRoot, ...scrollAreaViewport(), styles.list),
        className,
        style,
      )}
      {...rest}
    />
  );
});

export interface ComboboxOptionProps extends MosaicComponentProps<'div'> {
  value: string;
  label?: string;
  disabled?: boolean;
}

export const ComboboxOption = React.forwardRef<HTMLDivElement, ComboboxOptionProps>(function MosaicComboboxOption(
  { className, style, ...rest },
  ref,
) {
  return (
    <Primitive.Option
      ref={ref}
      {...mergeStyleProps(themeProps('combobox-option'), stylex.props(reset.base, styles.option), className, style)}
      {...rest}
    />
  );
});

export type ComboboxEmptyProps = MosaicComponentProps<'p'>;

export const ComboboxEmpty = React.forwardRef<HTMLParagraphElement, ComboboxEmptyProps>(function MosaicComboboxEmpty(
  { render, className, style, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'p',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('combobox-empty'), stylex.props(reset.base, styles.empty), className, style),
      ...rest,
    },
  });
});

export const Combobox = {
  Root: Primitive.Root,
  Input: ComboboxInput,
  Trigger: ComboboxTrigger,
  Popup: ComboboxPopup,
  List: ComboboxList,
  Option: ComboboxOption,
  Empty: ComboboxEmpty,
};
