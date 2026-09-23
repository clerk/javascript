import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { useRender } from '../../primitives/utils';
import type { MosaicComponentProps, MosaicElementProps, XStyle } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../utils/reset.styles';
import { tabularNumbersStyle } from '../../utils/typography.styles';
import { Button } from '../button';
import { Icon } from '../icon';
import { styles } from './action-bar.styles';

const ITEM_SELECTOR = 'button, a[href], input, select, textarea, [tabindex]';

const ActionBarContext = React.createContext<{ registerCount: (id: string | undefined) => void } | null>(null);

function toolbarItems(bar: HTMLElement): HTMLElement[] {
  return Array.from(bar.querySelectorAll<HTMLElement>(ITEM_SELECTOR)).filter(
    item => !item.matches(':disabled, [data-floating-ui-focus-guard]') && item.closest('[role="toolbar"]') === bar,
  );
}

function syncTabStops(items: HTMLElement[], active: HTMLElement | undefined) {
  for (const item of items) {
    item.tabIndex = item === active ? 0 : -1;
  }
}

export type ActionBarAnchorProps = MosaicComponentProps<'div'>;

/** Wraps the table and `ActionBar.Root`. The bar rests on its bottom edge and stays in view while it scrolls. */
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
  /** Where focus goes when the bar closes while holding it. Defaults to where focus came from. */
  returnFocus?: React.RefObject<HTMLElement | null>;
  positionerXstyle?: XStyle;
}

/** A floating toolbar of actions for a selection. Place it last in `ActionBar.Anchor`. */
const Root = React.forwardRef<HTMLDivElement, ActionBarRootProps>(function ActionBarRoot(
  { open, returnFocus, render, xstyle, positionerXstyle, children, onKeyDown, onFocus, onBlur, ...rest },
  ref,
) {
  const barRef = React.useRef<HTMLDivElement>(null);
  const activeRef = React.useRef<HTMLElement | undefined>(undefined);
  const originRef = React.useRef<HTMLElement | null>(null);
  const [countId, setCountId] = React.useState<string | undefined>();
  const context = React.useMemo(() => ({ registerCount: setCountId }), []);

  const lastFocusedRef = React.useRef<HTMLElement | null>(null);

  const restoreFocus = React.useCallback(() => {
    const bar = barRef.current;
    if (!bar) {
      return;
    }
    const target = returnFocus?.current ?? originRef.current;
    bar.inert = true;
    if (target?.isConnected && !bar.contains(target)) {
      target.focus();
    } else if (bar.contains(bar.ownerDocument.activeElement)) {
      (bar.ownerDocument.activeElement as HTMLElement).blur();
    }
  }, [returnFocus]);

  const syncItems = React.useCallback(() => {
    const bar = barRef.current;
    if (!bar) {
      return;
    }
    const items = toolbarItems(bar);
    if (!activeRef.current || !items.includes(activeRef.current)) {
      activeRef.current = items[0];
    }
    syncTabStops(items, activeRef.current);
  }, []);

  React.useLayoutEffect(() => {
    const bar = barRef.current;
    if (!bar) {
      return;
    }
    if (open) {
      bar.inert = false;
      return;
    }
    activeRef.current = undefined;
    const doc = bar.ownerDocument;
    const active = doc.activeElement as HTMLElement | null;
    if (bar.contains(active)) {
      restoreFocus();
      return;
    }
    if (!active || active !== lastFocusedRef.current) {
      bar.inert = true;
      return;
    }
    let frame = requestAnimationFrame(function watch() {
      const current = doc.activeElement;
      if (current === active && active.isConnected) {
        frame = requestAnimationFrame(watch);
      } else if (!current || current === doc.body || bar.contains(current)) {
        restoreFocus();
      } else {
        bar.inert = true;
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [open, restoreFocus]);

  React.useLayoutEffect(syncItems);

  const handleFocus = (event: React.FocusEvent<HTMLDivElement>) => {
    onFocus?.(event);
    const bar = barRef.current;
    const target = event.target as HTMLElement;
    const previous = lastFocusedRef.current;
    lastFocusedRef.current = target;
    if (!bar?.contains(target)) {
      return;
    }
    if (!open) {
      restoreFocus();
      return;
    }
    const from = event.relatedTarget as HTMLElement | null;
    if (from && from !== previous && !bar.contains(from)) {
      originRef.current = from;
    }
    const items = toolbarItems(bar);
    if (items.includes(target)) {
      activeRef.current = target;
      syncTabStops(items, target);
    }
  };

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    onBlur?.(event);
    syncItems();
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
      onBlur: handleBlur,
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

/** The selected count. Describes the toolbar and announces changes. */
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
      ...mergeStyleProps(
        themeProps('action-bar-count'),
        stylex.props(reset.base, styles.count, tabularNumbersStyle.enabled, xstyle),
        rest,
      ),
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

/** Clears the selection. Labelled "Clear selection" by default. */
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

/** Bulk actions for a table selection. */
export const ActionBar = { Anchor, Root, Count, Separator, Dismiss };
