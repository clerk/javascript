import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { useRender } from '../../primitives/utils';
import type { MosaicComponentProps, MosaicElementProps, XStyle } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../utils/reset.styles';
import { Button } from '../button';
import { Icon } from '../icon';
import { styles } from './action-bar.styles';

export interface ActionBarRootProps extends MosaicComponentProps<'div'> {
  /** Whether the bar is shown. Toggling it animates the bar in and out. */
  open: boolean;
  /**
   * Pins the bar to the foot of the nearest scroll container instead of a positioned ancestor, so
   * it stays in view while a long surface scrolls (a `Profile` page, a modal). Place `ActionBar.Root`
   * as the last child of that scrolling column. Off, the bar is absolute within the nearest
   * positioned ancestor — give that ancestor `position: relative`.
   *
   * @default false
   */
  sticky?: boolean;
  positionerXstyle?: XStyle;
}

/**
 * A floating bar of actions for a selection. It sits at the foot of its container — the nearest
 * positioned ancestor, or the nearest scroll container with `sticky` — and animates in and out with
 * `open`. While `open` is false it is inert and click-through, so the surface underneath stays
 * usable. Compose a count, a separator, the actions, and a dismiss:
 *
 * @example
 * <ActionBar.Root open={count > 0}>
 *   <ActionBar.Count>{count} selected</ActionBar.Count>
 *   <ActionBar.Separator />
 *   <Menu.Root>…</Menu.Root>
 *   <Button color='negative' variant='ghost' shape='square' aria-label='Remove'>
 *     <Icon name='trash' />
 *   </Button>
 *   <ActionBar.Separator />
 *   <ActionBar.Dismiss onClick={clearSelection} />
 * </ActionBar.Root>
 */
const Root = React.forwardRef<HTMLDivElement, ActionBarRootProps>(function ActionBarRoot(
  { open, sticky = false, render, xstyle, positionerXstyle, children, ...rest },
  ref,
) {
  const barRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (barRef.current) {
      barRef.current.inert = !open;
    }
  }, [open]);

  const bar = useRender({
    defaultTagName: 'div',
    render,
    ref: barRef,
    props: {
      ...mergeStyleProps(themeProps('action-bar', { open }), stylex.props(reset.base, styles.bar, xstyle), rest),
      'data-open': open,
      role: 'toolbar',
      children,
    },
  });

  return (
    <div
      ref={ref}
      {...mergeStyleProps(
        themeProps('action-bar-positioner', { sticky }),
        stylex.props(
          reset.base,
          styles.positioner,
          sticky ? styles.positionerSticky : styles.positionerAbsolute,
          positionerXstyle,
        ),
      )}
    >
      {bar}
    </div>
  );
});

export type ActionBarCountProps = MosaicComponentProps<'div'>;

/** The leading count of what is selected, e.g. `3 selected`. */
const Count = React.forwardRef<HTMLDivElement, ActionBarCountProps>(function ActionBarCount(
  { render, xstyle, children, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('action-bar-count'), stylex.props(reset.base, styles.count, xstyle), rest),
      children,
    },
  });
});

export type ActionBarSeparatorProps = MosaicComponentProps<'div'>;

/** A vertical divider between groups of the bar. */
const Separator = React.forwardRef<HTMLDivElement, ActionBarSeparatorProps>(function ActionBarSeparator(
  { render, xstyle, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('action-bar-separator'), stylex.props(reset.base, styles.separator), rest),
      'aria-hidden': true,
    },
  });
});

export type ActionBarDismissProps = MosaicElementProps<'button'>;

/** Dismisses the bar. A ghost icon button; defaults its label to "Clear selection". */
const Dismiss = React.forwardRef<HTMLButtonElement, ActionBarDismissProps>(function ActionBarDismiss(
  { xstyle, 'aria-label': ariaLabel, ...rest },
  ref,
) {
  return (
    <Button
      ref={ref}
      variant='ghost'
      shape='square'
      size='md'
      aria-label={ariaLabel ?? 'Clear selection'}
      {...mergeStyleProps(themeProps('action-bar-dismiss'), stylex.props(xstyle), rest)}
    >
      <Icon name='x' />
    </Button>
  );
});

/**
 * A floating bar of actions for a current selection, composed through `ActionBar.Root`,
 * `ActionBar.Count`, `ActionBar.Separator`, and `ActionBar.Dismiss`. The actions themselves
 * (a `Menu`, a `Button`) are whatever children you place between them.
 */
export const ActionBar = { Root, Count, Separator, Dismiss };
