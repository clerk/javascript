import {
  autoUpdate,
  Composite,
  CompositeItem,
  FloatingFocusManager,
  FloatingPortal,
  getOverflowAncestors,
  hide,
  limitShift,
  offset,
  shift,
  useFloating,
  useMergeRefs,
} from '@floating-ui/react';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { mergeProps, useRender } from '../../primitives/utils';
import type { MosaicComponentProps, XStyle } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../utils/reset.styles';
import { tabularNumbersStyle } from '../../utils/typography.styles';
import type { ButtonProps } from '../button';
import { Button } from '../button';
import { Icon } from '../icon';
import { styles } from './action-bar.styles';

const ITEM_ATTRIBUTE = 'data-action-bar-item';
const EDGE_GAP = 16;

const ActionBarContext = React.createContext<{ registerCount: (id: string | undefined) => void } | null>(null);

function scrollingAncestors(element: Element): Element[] {
  return getOverflowAncestors(element).filter(
    (node): node is Element =>
      node instanceof Element &&
      node.scrollHeight > node.clientHeight &&
      /auto|scroll|overlay/.test(getComputedStyle(node).overflowY),
  );
}

function enabledItems(bar: HTMLElement): HTMLElement[] {
  return Array.from(bar.querySelectorAll<HTMLElement>(`[${ITEM_ATTRIBUTE}]`)).filter(
    item => !item.matches(':disabled'),
  );
}

export interface ActionBarRootProps extends MosaicComponentProps<'div'> {
  /** Whether the bar is shown. Toggling it animates the bar in and out. */
  open: boolean;
  /** The table the bar acts on. The bar rests on its bottom edge and stays in view while it scrolls. */
  anchor: React.RefObject<HTMLElement | null>;
  /** Where the bar is portalled; `null` waits for the element. Inside a modal dialog, pass the dialog's popup. */
  portalRoot?: HTMLElement | null;
  /** Where focus goes when the bar closes while holding it. Defaults to where focus came from. */
  returnFocus?: React.RefObject<HTMLElement | null>;
  positionerXstyle?: XStyle;
}

/** A floating toolbar of actions for a selection. */
const Root = React.forwardRef<HTMLDivElement, ActionBarRootProps>(function ActionBarRoot(
  { open, anchor, portalRoot, returnFocus, render, xstyle, positionerXstyle, children, onFocus, ...rest },
  ref,
) {
  const barRef = React.useRef<HTMLDivElement | null>(null);
  const [barElement, setBarElement] = React.useState<HTMLDivElement | null>(null);
  const setBar = React.useCallback((node: HTMLDivElement | null) => {
    barRef.current = node;
    setBarElement(node);
  }, []);
  const originRef = React.useRef<HTMLElement | null>(null);
  const lastFocusedRef = React.useRef<HTMLElement | null>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [countId, setCountId] = React.useState<string | undefined>();
  const context = React.useMemo(() => ({ registerCount: setCountId }), []);

  const {
    refs,
    elements,
    floatingStyles,
    middlewareData,
    update,
    context: floatingContext,
  } = useFloating({
    open,
    placement: 'bottom',
    middleware: [
      offset(({ rects }) => -rects.floating.height / 2),
      {
        name: 'shiftIntoScrollport',
        fn: state =>
          shift({
            mainAxis: false,
            crossAxis: true,
            boundary: scrollingAncestors(state.elements.reference as Element),
            padding: EDGE_GAP,
            limiter: limitShift({ mainAxis: false, crossAxis: true }),
          }).fn(state),
      },
      hide(),
    ],
  });

  React.useLayoutEffect(() => {
    refs.setReference(anchor.current);
  });

  React.useEffect(() => {
    if (!open || !elements.reference || !elements.floating) {
      return;
    }
    return autoUpdate(elements.reference, elements.floating, update);
  }, [open, elements.reference, elements.floating, update]);

  React.useEffect(() => {
    if (!open || !barElement) {
      return;
    }
    const doc = barElement.ownerDocument;
    const recordOrigin = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      if (
        !barElement.contains(target) &&
        target !== lastFocusedRef.current &&
        !target.hasAttribute('data-floating-ui-focus-guard')
      ) {
        originRef.current = target;
      }
    };
    doc.addEventListener('focusin', recordOrigin);
    return () => doc.removeEventListener('focusin', recordOrigin);
  }, [open, barElement]);

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

  React.useLayoutEffect(() => {
    const bar = barRef.current;
    if (!bar) {
      return;
    }
    if (open) {
      bar.inert = false;
      return;
    }
    setActiveIndex(0);
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
  }, [open, restoreFocus, barElement]);

  const handleFocus = (event: React.FocusEvent<HTMLDivElement>) => {
    onFocus?.(event);
    const bar = barRef.current;
    const target = event.target as HTMLElement;
    lastFocusedRef.current = target;
    if (!bar?.contains(target)) {
      return;
    }
    if (!open) {
      restoreFocus();
      return;
    }
  };

  const handleItemsKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const bar = barRef.current;
    if (!bar?.contains(event.target as Node)) {
      event.stopPropagation();
      return;
    }
    if (event.key !== 'Home' && event.key !== 'End') {
      return;
    }
    const items = enabledItems(bar);
    const target = event.key === 'Home' ? items[0] : items[items.length - 1];
    if (!target) {
      return;
    }
    event.preventDefault();
    const all = Array.from(bar.querySelectorAll<HTMLElement>(`[${ITEM_ATTRIBUTE}]`));
    setActiveIndex(all.indexOf(target));
    target.focus();
  };

  return (
    <ActionBarContext.Provider value={context}>
      <FloatingPortal root={portalRoot}>
        <FloatingFocusManager
          context={floatingContext}
          modal={false}
          initialFocus={-1}
          returnFocus={false}
          closeOnFocusOut={false}
          disabled={!open}
        >
          <div
            ref={useMergeRefs([refs.setFloating, ref])}
            style={{
              ...floatingStyles,
              visibility: middlewareData.hide?.referenceHidden ? 'hidden' : undefined,
            }}
            {...mergeStyleProps(
              themeProps('action-bar-positioner'),
              stylex.props(reset.base, styles.positioner, positionerXstyle),
            )}
          >
            <Composite
              orientation='horizontal'
              loop
              activeIndex={activeIndex}
              onNavigate={setActiveIndex}
              render={(compositeProps: React.HTMLAttributes<HTMLElement>) => {
                const { ref: compositeRef, ...merged } = mergeProps<'div'>(
                  {
                    'aria-describedby': countId,
                    ...mergeStyleProps(
                      themeProps('action-bar', { open }),
                      stylex.props(reset.base, styles.bar, xstyle),
                      rest,
                    ),
                  },
                  compositeProps as Record<string, unknown>,
                );
                // eslint-disable-next-line react-hooks/rules-of-hooks
                return useRender({
                  defaultTagName: 'div',
                  render,
                  ref: [setBar, compositeRef as React.Ref<unknown>],
                  props: {
                    ...merged,
                    'data-open': open,
                    role: 'toolbar',
                    onFocus: handleFocus,
                    children: (
                      <div
                        role='presentation'
                        onKeyDown={handleItemsKeyDown}
                        {...stylex.props(styles.items)}
                      >
                        {children}
                      </div>
                    ),
                  },
                });
              }}
            />
          </div>
        </FloatingFocusManager>
      </FloatingPortal>
    </ActionBarContext.Provider>
  );
});

export type ActionBarActionProps = ButtonProps;

/**
 * A control in the bar: a ghost button that joins the bar's arrow-key navigation. Pass it as the
 * `render` of a `Menu.Trigger` or `Dialog.Trigger` to open one from the bar.
 */
const Action = React.forwardRef<HTMLButtonElement, ActionBarActionProps>(function ActionBarAction(
  { color, xstyle, ...rest },
  ref,
) {
  return (
    <CompositeItem
      render={(itemProps: React.HTMLAttributes<HTMLElement>) => {
        const { ref: itemRef, ...merged } = mergeProps<'button'>(
          rest as Record<string, unknown>,
          itemProps as Record<string, unknown>,
        );
        return (
          <Button
            variant='ghost'
            size='md'
            color={color}
            {...merged}
            {...{ [ITEM_ATTRIBUTE]: '' }}
            // eslint-disable-next-line react-hooks/rules-of-hooks
            ref={useMergeRefs([ref, itemRef as React.Ref<HTMLButtonElement>])}
            xstyle={[color === 'negative' && styles.destructive, xstyle]}
          />
        );
      }}
    />
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

export type ActionBarDismissProps = Omit<ActionBarActionProps, 'children'>;

/** Clears the selection. Labelled "Clear selection" by default. */
const Dismiss = React.forwardRef<HTMLButtonElement, ActionBarDismissProps>(function ActionBarDismiss(
  { 'aria-label': ariaLabel, ...rest },
  ref,
) {
  return (
    <Action
      ref={ref}
      shape='square'
      aria-label={ariaLabel ?? 'Clear selection'}
      {...mergeStyleProps(themeProps('action-bar-dismiss'), rest)}
    >
      <Icon name='x' />
    </Action>
  );
});

/** Bulk actions for a table selection. */
export const ActionBar = { Root, Action, Count, Separator, Dismiss };
