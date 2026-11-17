'use client';

import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { useRender } from '../../primitives/utils';
import type { MosaicComponentProps, MosaicElementProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { focusOutline } from '../../styles/focus-outline.styles';
import { reset } from '../../styles/reset.styles';
import { truncationStyles } from '../../styles/typography.styles';
import { useSlot } from './switcher.context';
import { styles } from './switcher-item.styles';

export type SwitcherItemProps = MosaicComponentProps<'div'>;
export type SwitcherItemMediaProps = MosaicElementProps<'div'>;
export type SwitcherItemContentProps = MosaicElementProps<'div'>;
export type SwitcherItemDescriptionProps = MosaicElementProps<'div'>;
export type SwitcherItemTrailingProps = MosaicElementProps<'div'>;
export type SwitcherGroupProps = MosaicElementProps<'div'>;
export type SwitcherSeparatorProps = MosaicElementProps<'hr'>;

export const SwitcherItem = React.forwardRef<HTMLDivElement, SwitcherItemProps>(function SwitcherItem(
  { render, xstyle, ...rest },
  ref,
) {
  const slot = useSlot();
  const interactive = Boolean(render);
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeStyleProps(
      themeProps(slot('item'), { interactive }),
      stylex.props(reset.base, focusOutline.visible, styles.root, interactive && styles.interactive, xstyle),
      rest,
    ),
  });
});

export function SwitcherItemMedia({ xstyle, ...rest }: SwitcherItemMediaProps) {
  const slot = useSlot();
  return (
    <div {...mergeStyleProps(themeProps(slot('item-media')), stylex.props(reset.base, styles.media, xstyle), rest)} />
  );
}

export function SwitcherItemContent({ xstyle, ...rest }: SwitcherItemContentProps) {
  const slot = useSlot();
  return (
    <div
      {...mergeStyleProps(themeProps(slot('item-content')), stylex.props(reset.base, styles.content, xstyle), rest)}
    />
  );
}

export type SwitcherItemLabelProps = MosaicElementProps<'div'> & {
  /**
   * `default` names the row's subject (a person, an organization) in its own color. `interactive`
   * takes the row's color, so it brightens with the row on hover. Use it where the text is the row
   * itself (`Add account`, `Sign out`).
   *
   * @default 'default'
   */
  variant?: 'default' | 'interactive';
};

export function SwitcherItemLabel({ variant = 'default', xstyle, ...rest }: SwitcherItemLabelProps) {
  const slot = useSlot();
  return (
    <div
      {...mergeStyleProps(
        themeProps(slot('item-label'), { variant }),
        stylex.props(
          reset.base,
          styles.label,
          variant === 'default' && styles.labelDefault,
          truncationStyles.singleLine,
          xstyle,
        ),
        rest,
      )}
    />
  );
}

export function SwitcherItemDescription({ xstyle, ...rest }: SwitcherItemDescriptionProps) {
  const slot = useSlot();
  return (
    <div
      {...mergeStyleProps(
        themeProps(slot('item-description')),
        stylex.props(reset.base, styles.description, truncationStyles.singleLine, xstyle),
        rest,
      )}
    />
  );
}

export function SwitcherItemTrailing({ xstyle, ...rest }: SwitcherItemTrailingProps) {
  const slot = useSlot();
  return (
    <div
      {...mergeStyleProps(themeProps(slot('item-trailing')), stylex.props(reset.base, styles.trailing, xstyle), rest)}
    />
  );
}

export function SwitcherGroup({ xstyle, ...rest }: SwitcherGroupProps) {
  const slot = useSlot();
  return <div {...mergeStyleProps(themeProps(slot('group')), stylex.props(reset.base, styles.group, xstyle), rest)} />;
}

export function SwitcherSeparator({ xstyle, ...rest }: SwitcherSeparatorProps) {
  const slot = useSlot();
  return (
    <hr {...mergeStyleProps(themeProps(slot('separator')), stylex.props(reset.base, styles.separator, xstyle), rest)} />
  );
}

export declare namespace SwitcherItem {
  type Props = SwitcherItemProps;
}

export declare namespace SwitcherItemMedia {
  type Props = SwitcherItemMediaProps;
}

export declare namespace SwitcherItemContent {
  type Props = SwitcherItemContentProps;
}

export declare namespace SwitcherItemLabel {
  type Props = SwitcherItemLabelProps;
}

export declare namespace SwitcherItemDescription {
  type Props = SwitcherItemDescriptionProps;
}

export declare namespace SwitcherItemTrailing {
  type Props = SwitcherItemTrailingProps;
}

export declare namespace SwitcherGroup {
  type Props = SwitcherGroupProps;
}

export declare namespace SwitcherSeparator {
  type Props = SwitcherSeparatorProps;
}
