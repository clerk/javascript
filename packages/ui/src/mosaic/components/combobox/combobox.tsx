'use client';

import type { ComboboxProps } from '@clerk/headless/combobox';
import { Combobox as HeadlessCombobox } from '@clerk/headless/combobox';
import { useRender } from '@clerk/headless/utils';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../utils/reset.styles';
import { Icon } from '../icon';
import { Input, type InputVariant } from '../input';
import { useOptionalInputGroupContext } from '../input-group/input-group.context';
import { scrollAreaRoot, scrollAreaViewport } from '../scroll-area';
import { styles } from './combobox.styles';

export type ComboboxRootProps = ComboboxProps;
export type ComboboxSize = 'sm' | 'md' | 'lg';
export type ComboboxTriggerProps = MosaicComponentProps<'button'>;
export const ComboboxCollection = HeadlessCombobox.Collection;

const ComboboxAnchorContext = React.createContext<{
  anchor: HTMLElement | null;
  setAnchor: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
} | null>(null);

export function ComboboxRoot({ sideOffset = 8, ...props }: ComboboxRootProps) {
  const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);
  const context = React.useMemo(() => ({ anchor, setAnchor }), [anchor]);
  return (
    <ComboboxAnchorContext.Provider value={context}>
      <HeadlessCombobox.Root
        sideOffset={sideOffset}
        {...props}
      />
    </ComboboxAnchorContext.Provider>
  );
}

export const ComboboxTrigger = React.forwardRef<HTMLButtonElement, ComboboxTriggerProps>(function MosaicComboboxTrigger(
  { className, style, ...props },
  ref,
) {
  return (
    <HeadlessCombobox.Trigger
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
  { size: sizeProp, variant: variantProp, render, className, style, ...rest },
  ref,
) {
  const inputGroup = useOptionalInputGroupContext();
  const variant = variantProp ?? (inputGroup ? 'ghost' : 'default');
  const setAnchor = React.useContext(ComboboxAnchorContext)?.setAnchor;
  const groupElement = inputGroup?.element;
  React.useLayoutEffect(() => {
    setAnchor?.(groupElement ?? null);
    return () => setAnchor?.(null);
  }, [groupElement, setAnchor]);
  const size = inputGroup?.size ?? sizeProp ?? 'md';

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
      {...mergeStyleProps(themeProps('combobox-input', { size, variant }), className, style)}
      {...rest}
    />
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
  { anchor, portalRoot, className, style, children, ...rest },
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
        </HeadlessCombobox.Popup>
      </HeadlessCombobox.Positioner>
    </HeadlessCombobox.Portal>
  );
});

export type ComboboxListProps = MosaicComponentProps<'div'>;

/** Scrollable listbox used when the combobox is embedded in another surface. */
export const ComboboxList = React.forwardRef<HTMLDivElement, ComboboxListProps>(function MosaicComboboxList(
  { className, style, ...rest },
  ref,
) {
  return (
    <HeadlessCombobox.List
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
    <HeadlessCombobox.Option
      ref={ref}
      {...mergeStyleProps(themeProps('combobox-option'), stylex.props(reset.base, styles.option), className, style)}
      {...rest}
    />
  );
});

export type ComboboxEmptyProps = MosaicComponentProps<'p'>;

export type ComboboxOptionIndicatorProps = MosaicComponentProps<'span'>;

export const ComboboxOptionIndicator = React.forwardRef<HTMLSpanElement, ComboboxOptionIndicatorProps>(
  function MosaicComboboxOptionIndicator({ className, style, children, ...props }, ref) {
    return (
      <HeadlessCombobox.OptionIndicator
        ref={ref}
        {...mergeStyleProps(themeProps('combobox-option-indicator'), stylex.props(styles.indicator), className, style)}
        {...props}
      >
        {children ?? (
          <Icon
            name='check'
            size='sm'
          />
        )}
      </HeadlessCombobox.OptionIndicator>
    );
  },
);

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
  Root: ComboboxRoot,
  Collection: ComboboxCollection,
  Input: ComboboxInput,
  Trigger: ComboboxTrigger,
  Popup: ComboboxPopup,
  List: ComboboxList,
  Option: ComboboxOption,
  OptionIndicator: ComboboxOptionIndicator,
  Empty: ComboboxEmpty,
};
