import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { useRender } from '../../primitives/utils';
import type { MosaicComponentProps, MosaicElementProps, XStyle } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../utils/reset.styles';
import { Button } from '../button';
import { Icon } from '../icon';
import { styles } from './action-bar.styles';

const ITEM_SELECTOR = 'button, a[href], input, select, textarea, [tabindex]';

const ActionBarContext = React.createContext<{ registerCount: (id: string | undefined) => void } | null>(null);

function toolbarItems(bar: HTMLElement): HTMLElement[] {
  return Array.from(bar.querySelectorAll<HTMLElement>(ITEM_SELECTOR)).filter(
    item => !item.matches(':disabled') && item.closest('[role="toolbar"]') === bar,
  );
}

function syncTabStops(items: HTMLElement[], active: HTMLElement | undefined) {
  for (const item of items) {
    item.tabIndex = item === active ? 0 : -1;
  }
}

export type ActionBarAnchorProps = MosaicComponentProps<'div'>;

/**
 * Wraps the surface the bar acts on — a `Table.Root` — together with `ActionBar.Root`, which goes
 * last. The bar rests on the anchor's bottom edge and, while that edge is scrolled out of view,
 * pins to the foot of the nearest scroll container: the content column of a `Profile` in a dialog,
 * or the page when the profile is inline.
 */
const Anchor = React.forwardRef<HTMLDivElement, ActionBarAnchorProps>(function ActionBarAnchor(
  { render, xstyle, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeStyleProps(themeProps('action-bar-anchor'), stylex.props(reset.base, styles.anchor, xstyle), rest),
  });
});

export interface ActionBarRootProps extends MosaicComponentProps<'div'> {
  /** Whether the bar is shown. Toggling it animates the bar in and out. */
  open: boolean;
  /**
   * Where focus goes when the bar closes while it holds focus. Defaults to the element focus
   * entered the bar from, when that is still on the page.
   */
  returnFocus?: React.RefObject<HTMLElement | null>;
  positionerXstyle?: XStyle;
}

/**
 * A floating toolbar of actions for a selection, placed as the last child of `ActionBar.Anchor`.
 * It is one tab stop: the arrow keys, `Home`, and `End` move between its controls. While `open` is
 * false it is inert and click-through, and if it held focus, focus returns to where it came from.
 * Label it, and point `aria-controls` at the table it acts on:
 *
 * @example
 * <ActionBar.Anchor>
 *   <Table.Root id={tableId}>…</Table.Root>
 *   <ActionBar.Root open={count > 0} aria-label='Bulk actions' aria-controls={tableId}>
 *     <ActionBar.Count>{count} selected</ActionBar.Count>
 *     <ActionBar.Separator />
 *     <Menu.Root>…</Menu.Root>
 *     <ActionBar.Separator />
 *     <ActionBar.Dismiss onClick={clearSelection} />
 *   </ActionBar.Root>
 * </ActionBar.Anchor>
 */
const Root = React.forwardRef<HTMLDivElement, ActionBarRootProps>(function ActionBarRoot(
  { open, returnFocus, render, xstyle, positionerXstyle, children, onKeyDown, onFocus, ...rest },
  ref,
) {
  const barRef = React.useRef<HTMLDivElement>(null);
  const activeRef = React.useRef<HTMLElement | undefined>(undefined);
  const originRef = React.useRef<HTMLElement | null>(null);
  const [countId, setCountId] = React.useState<string | undefined>();
  const context = React.useMemo(() => ({ registerCount: setCountId }), []);

  React.useLayoutEffect(() => {
    const bar = barRef.current;
    if (!bar) {
      return;
    }
    if (!open) {
      if (bar.contains(bar.ownerDocument.activeElement)) {
        const target = returnFocus?.current ?? originRef.current;
        if (target?.isConnected) {
          target.focus();
        } else {
          (bar.ownerDocument.activeElement as HTMLElement | null)?.blur();
        }
      }
      activeRef.current = undefined;
    }
    bar.inert = !open;
  }, [open, returnFocus]);

  React.useLayoutEffect(() => {
    const bar = barRef.current;
    if (!bar) {
      return;
    }
    const items = toolbarItems(bar);
    if (!activeRef.current || !items.includes(activeRef.current)) {
      activeRef.current = items[0];
    }
    syncTabStops(items, activeRef.current);
  });

  const handleFocus = (event: React.FocusEvent<HTMLDivElement>) => {
    onFocus?.(event);
    const bar = barRef.current;
    const target = event.target as HTMLElement;
    if (!bar) {
      return;
    }
    const from = event.relatedTarget as HTMLElement | null;
    if (from && !bar.contains(from)) {
      originRef.current = from;
    }
    const items = toolbarItems(bar);
    if (items.includes(target)) {
      activeRef.current = target;
      syncTabStops(items, target);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    const bar = barRef.current;
    const target = event.target as HTMLElement;
    if (event.defaultPrevented || !bar || target.matches('input, textarea, select')) {
      return;
    }
    const items = toolbarItems(bar);
    const index = items.indexOf(target);
    if (index === -1) {
      return;
    }
    const forward = getComputedStyle(bar).direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
    const backward = forward === 'ArrowRight' ? 'ArrowLeft' : 'ArrowRight';
    let next: number;
    switch (event.key) {
      case forward:
        next = (index + 1) % items.length;
        break;
      case backward:
        next = (index - 1 + items.length) % items.length;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = items.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    items[next].focus();
  };

  const bar = useRender({
    defaultTagName: 'div',
    render,
    ref: barRef,
    props: {
      'aria-describedby': countId,
      ...mergeStyleProps(themeProps('action-bar', { open }), stylex.props(reset.base, styles.bar, xstyle), rest),
      'data-open': open,
      role: 'toolbar',
      'aria-orientation': 'horizontal',
      onKeyDown: handleKeyDown,
      onFocus: handleFocus,
      children,
    },
  });

  return (
    <ActionBarContext.Provider value={context}>
      <div
        ref={ref}
        {...mergeStyleProps(
          themeProps('action-bar-positioner'),
          stylex.props(reset.base, styles.positioner, positionerXstyle),
        )}
      >
        {bar}
      </div>
    </ActionBarContext.Provider>
  );
});

export type ActionBarCountProps = MosaicComponentProps<'div'>;

/**
 * The leading count of what is selected, e.g. `3 selected`. It describes the toolbar and is a
 * polite live region, so a change in the selection is announced.
 */
const Count = React.forwardRef<HTMLDivElement, ActionBarCountProps>(function ActionBarCount(
  { render, xstyle, id: idProp, children, ...rest },
  ref,
) {
  const generatedId = React.useId();
  const id = idProp ?? generatedId;
  const registerCount = React.useContext(ActionBarContext)?.registerCount;
  React.useLayoutEffect(() => {
    registerCount?.(id);
    return () => registerCount?.(undefined);
  }, [registerCount, id]);

  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      'aria-live': 'polite',
      'aria-atomic': true,
      ...mergeStyleProps(themeProps('action-bar-count'), stylex.props(reset.base, styles.count, xstyle), rest),
      id,
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
      ...mergeStyleProps(themeProps('action-bar-separator'), stylex.props(reset.base, styles.separator, xstyle), rest),
      role: 'separator',
      'aria-orientation': 'vertical',
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
 * A floating toolbar of actions for a current selection, composed through `ActionBar.Anchor`,
 * `ActionBar.Root`, `ActionBar.Count`, `ActionBar.Separator`, and `ActionBar.Dismiss`. The actions
 * themselves (a `Menu`, a `Button`) are whatever children you place between them.
 */
export const ActionBar = { Anchor, Root, Count, Separator, Dismiss };
