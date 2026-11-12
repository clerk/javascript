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
import { reset } from '../../styles/reset.styles';
import { truncationStyles } from '../../styles/typography.styles';
import { Button } from '../button';
import { Icon } from '../icon';
import { Input, type InputVariant } from '../input';
import { useOptionalInputGroupContext } from '../input-group/input-group.context';
import { scrollAreaRoot, scrollAreaViewport } from '../scroll-area';
import { styles, trigger } from './combobox.styles';

export type ComboboxRootProps<Item = unknown> = ComboboxProps<Item>;
export type ComboboxSize = 'sm' | 'md' | 'lg';
export type ComboboxTriggerProps = MosaicComponentProps<'button'>;
export type ComboboxClearProps = MosaicComponentProps<'button'>;
export const ComboboxCollection = HeadlessCombobox.Collection;

const ComboboxAnchorContext = React.createContext<{
  anchor: HTMLElement | null;
  setAnchor: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
} | null>(null);

export function ComboboxRoot<Item>({ sideOffset = 8, openOnInputClick = true, ...props }: ComboboxRootProps<Item>) {
  const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);
  const context = React.useMemo(() => ({ anchor, setAnchor }), [anchor]);
  return (
    <ComboboxAnchorContext.Provider value={context}>
      <HeadlessCombobox.Root
        sideOffset={sideOffset}
        openOnInputClick={openOnInputClick}
        {...props}
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
      {...mergeStyleProps(themeProps('combobox-input', { size, variant }), stylex.props(xstyle), rest)}
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

/** `span`, not `div`: the option's children are phrasing content. */
export type ComboboxMediaProps = MosaicComponentProps<'span'>;

/** Square leading column that centers an icon, flag or avatar, so every option's label starts on one line. */
export const ComboboxMedia = React.forwardRef<HTMLSpanElement, ComboboxMediaProps>(function MosaicComboboxMedia(
  { render, xstyle, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'span',
    render,
    ref,
    props: mergeStyleProps(themeProps('combobox-option-media'), stylex.props(reset.base, styles.media, xstyle), rest),
  });
});

export type ComboboxLabelProps = MosaicComponentProps<'span'>;

/** The option's name. Takes the space between the media and whatever trails it, truncating to one line. */
export const ComboboxLabel = React.forwardRef<HTMLSpanElement, ComboboxLabelProps>(function MosaicComboboxLabel(
  { render, xstyle, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'span',
    render,
    ref,
    props: mergeStyleProps(
      themeProps('combobox-option-label'),
      stylex.props(reset.base, styles.label, truncationStyles.singleLine, xstyle),
      rest,
    ),
  });
});

export type ComboboxDetailProps = MosaicComponentProps<'span'>;

/** Secondary trailing text, such as a code or count. Stays whole while the label truncates. */
export const ComboboxDetail = React.forwardRef<HTMLSpanElement, ComboboxDetailProps>(function MosaicComboboxDetail(
  { render, xstyle, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'span',
    render,
    ref,
    props: mergeStyleProps(themeProps('combobox-option-detail'), stylex.props(reset.base, styles.detail, xstyle), rest),
  });
});

export type ComboboxEmptyProps = MosaicComponentProps<'div'>;

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

export const ComboboxEmpty = React.forwardRef<HTMLDivElement, ComboboxEmptyProps>(function MosaicComboboxEmpty(
  { xstyle, ...rest },
  ref,
) {
  return (
    <HeadlessCombobox.Empty
      ref={ref}
      {...mergeStyleProps(themeProps('combobox-empty'), stylex.props(reset.base, styles.empty, xstyle), rest)}
    />
  );
});

export const Combobox = {
  Root: ComboboxRoot,
  Collection: ComboboxCollection,
  Input: ComboboxInput,
  Trigger: ComboboxTrigger,
  Clear: ComboboxClear,
  Popup: ComboboxPopup,
  List: ComboboxList,
  Option: ComboboxOption,
  Media: ComboboxMedia,
  Label: ComboboxLabel,
  Detail: ComboboxDetail,
  OptionIndicator: ComboboxOptionIndicator,
  Empty: ComboboxEmpty,
};
