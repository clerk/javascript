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
import { activeElement, contains, getDocument, getTarget, useLatestRef } from '@floating-ui/react/utils';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { useAnimationsFinished, useTransitionStatus } from '../../primitives/hooks';
import { mergeProps, useRender } from '../../primitives/utils';
import { getComputedStyle } from '../../primitives/utils/dom';
import type { MosaicComponentProps, XStyle } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../utils/reset.styles';
import { tabularNumbersStyle } from '../../utils/typography.styles';
import type { ButtonProps } from '../button';
import { Button } from '../button';
import { Icon } from '../icon';
import { VisuallyHidden } from '../visually-hidden';
import { styles } from './action-bar.styles';

const EDGE_GAP = 16;

const ActionBarContext = React.createContext<{ countId: string } | null>(null);

function scrollingAncestors(element: Element): Element[] {
  return getOverflowAncestors(element).filter(
    (node): node is Element =>
      node instanceof Element &&
      node.scrollHeight > node.clientHeight &&
      /auto|scroll|overlay/.test(getComputedStyle(node).overflowY),
  );
}

export interface ActionBarRootProps extends MosaicComponentProps<'div'> {
  /** Whether the bar is shown. */
  open: boolean;
  /** The table the bar rests on. */
  anchor: React.RefObject<HTMLElement | null>;
  /** Where the bar is portalled. Inside a modal dialog, pass its popup. */
  portalRoot?: HTMLElement | null;
  /** Where focus goes when the bar closes while holding it: an element ref, or a function returning one. */
  finalFocus?: React.RefObject<HTMLElement | null> | (() => HTMLElement | null);
  /** Announced when the selection changes while the bar is open, e.g. `3 selected`. */
  announcement?: string;
  /** Announced when the bar opens, e.g. `1 selected, bulk actions follow the table`. Defaults to `announcement`. */
  openAnnouncement?: string;
  positionerXstyle?: XStyle;
}

const Root = React.forwardRef<HTMLDivElement, ActionBarRootProps>(function ActionBarRoot(
  {
    open,
    anchor,
    portalRoot,
    finalFocus,
    announcement,
    openAnnouncement,
    render,
    xstyle,
    positionerXstyle,
    children,
    ...rest
  },
  ref,
) {
  const barRef = React.useRef<HTMLDivElement | null>(null);
  const countId = React.useId();
  const context = React.useMemo(() => ({ countId }), [countId]);
  const openChildrenRef = React.useRef(children);
  if (open) {
    openChildrenRef.current = children;
  }

  const wasOpenRef = React.useRef(false);
  const [status, setStatus] = React.useState('');
  React.useLayoutEffect(() => {
    const wasOpen = wasOpenRef.current;
    wasOpenRef.current = open;
    if (!open) {
      setStatus('');
    } else if (!wasOpen) {
      setStatus(openAnnouncement ?? announcement ?? '');
    } else {
      setStatus(announcement ?? '');
    }
  }, [open, announcement, openAnnouncement]);

  const {
    refs,
    floatingStyles,
    middlewareData,
    context: floatingContext,
  } = useFloating({
    open,
    placement: 'bottom',
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(({ rects }) => -rects.floating.height / 4),
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

  const { mounted, transitionStatus, setMounted } = useTransitionStatus(open);
  const runOnAnimationsFinished = useAnimationsFinished(barRef, open);

  const focusWithinRef = React.useRef(false);
  const finalFocusRef = useLatestRef(finalFocus);

  React.useEffect(() => {
    if (transitionStatus !== 'ending') {
      return;
    }
    const moveFocus = () => {
      const target = finalFocusRef.current;
      (typeof target === 'function' ? target() : target?.current)?.focus();
    };
    const bar = barRef.current;
    if (bar && contains(bar, activeElement(getDocument(bar)))) {
      moveFocus();
    }
    return runOnAnimationsFinished(() => {
      if (focusWithinRef.current) {
        moveFocus();
      }
      setMounted(false);
    });
  }, [transitionStatus, runOnAnimationsFinished, finalFocusRef, setMounted]);

  const guardPortalledKeys = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const bar = barRef.current;
    if (!bar || !contains(bar, getTarget(event.nativeEvent) as Element)) {
      event.stopPropagation();
    }
  };

  const floatingRef = useMergeRefs([refs.setFloating, ref]);

  return (
    <ActionBarContext.Provider value={context}>
      <VisuallyHidden
        role='status'
        aria-live='polite'
        aria-atomic
      >
        {status}
      </VisuallyHidden>
      {mounted ? (
        <FloatingPortal root={portalRoot}>
          <FloatingFocusManager
            context={floatingContext}
            modal={false}
            initialFocus={-1}
            returnFocus={false}
            closeOnFocusOut={false}
          >
            <div
              ref={floatingRef}
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
                    ref: [barRef, compositeRef as React.Ref<unknown>],
                    props: {
                      ...merged,
                      ...(transitionStatus === 'starting'
                        ? { 'data-starting-style': '', style: { transition: 'none' } }
                        : null),
                      ...(transitionStatus === 'ending' ? { 'data-ending-style': '' } : null),
                      'data-open': open,
                      role: 'toolbar',
                      onFocus: () => {
                        focusWithinRef.current = true;
                      },
                      onBlur: () => {
                        focusWithinRef.current = false;
                      },
                      children: (
                        <div
                          role='presentation'
                          onKeyDown={guardPortalledKeys}
                          {...stylex.props(styles.items)}
                        >
                          {open ? children : openChildrenRef.current}
                        </div>
                      ),
                    },
                  });
                }}
              />
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      ) : null}
    </ActionBarContext.Provider>
  );
});

export type ActionBarActionProps = ButtonProps;

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
            // eslint-disable-next-line react-hooks/rules-of-hooks
            ref={useMergeRefs([ref, itemRef as React.Ref<HTMLButtonElement>])}
            xstyle={[color === 'negative' && styles.destructive, xstyle]}
          />
        );
      }}
    />
  );
});

export type ActionBarCountProps = Omit<MosaicComponentProps<'div'>, 'id'>;

const Count = React.forwardRef<HTMLDivElement, ActionBarCountProps>(function ActionBarCount(
  { render, xstyle, ...rest },
  ref,
) {
  const countId = React.useContext(ActionBarContext)?.countId;
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('action-bar-count'),
        stylex.props(reset.base, styles.count, tabularNumbersStyle.enabled, xstyle),
        rest,
      ),
      id: countId,
    },
  });
});

export type ActionBarSeparatorProps = MosaicComponentProps<'div'>;

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

export const ActionBar = { Root, Action, Count, Separator, Dismiss };
