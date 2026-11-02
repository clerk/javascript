'use client';

import React, { useLayoutEffect, useRef, useState } from 'react';

import { useAnimationsFinished } from '../hooks/use-animations-finished';
import { useTransition } from '../hooks/use-transition';
import { type ComponentProps, mergeProps, useRender } from '../utils';
import { autoUpdate, getScrollDimensions } from '../utils/dom';
import { useAccordionItemContext } from './accordion-context';

export type AccordionPanelProps = ComponentProps<'div'>;

export const AccordionPanel = React.forwardRef<HTMLDivElement, AccordionPanelProps>(
  function AccordionPanel(props, ref) {
    const { render, ...otherProps } = props;
    const { open, triggerId, panelId } = useAccordionItemContext();

    const panelRef = useRef<HTMLElement | null>(null);
    const [height, setHeight] = useState<number | undefined>(undefined);

    const { mounted, transitionStatus, transitionProps } = useTransition({
      open,
      ref: panelRef,
    });

    const runOnAnimationsFinished = useAnimationsFinished(panelRef, open);

    // Measure the content height and keep it in sync via ResizeObserver
    useLayoutEffect(() => {
      if (!mounted) {
        return;
      }

      const panel = panelRef.current;
      if (!panel) {
        return;
      }

      return autoUpdate(panel, () => setHeight(getScrollDimensions(panel).height));
    }, [mounted]);

    // Once the open animation settles, drop the measured pixel height so the
    // panel flows naturally with its content (CSS var omitted → height: auto).
    useLayoutEffect(() => {
      if (!open || !mounted) {
        return;
      }
      runOnAnimationsFinished(() => setHeight(undefined));
    }, [open, mounted, runOnAnimationsFinished]);

    // Re-pin to a measured pixel value when closing starts so the exit
    // transition animates from a concrete height (height: auto can't interpolate).
    useLayoutEffect(() => {
      if (open || transitionStatus !== 'ending') {
        return;
      }
      const panel = panelRef.current;
      if (!panel) {
        return;
      }
      setHeight(getScrollDimensions(panel).height);
    }, [open, transitionStatus]);

    const state = { open };

    const defaultProps: Record<string, unknown> = {
      id: panelId,
      role: 'region' as const,
      'aria-labelledby': triggerId,
      ...transitionProps,
      style: {
        '--cl-accordion-panel-height': height != null ? `${height}px` : undefined,
        ...transitionProps.style,
      },
    };

    const merged = mergeProps<'div'>(defaultProps, otherProps);
    // The wired id is owned by the primitive: a consumer-supplied id must not
    // override it, or the trigger/panel aria pairing would silently break.
    merged.id = panelId;

    return useRender({
      defaultTagName: 'div',
      render,
      enabled: mounted,
      ref: [panelRef, ref],
      state,
      stateAttributesMapping: {
        open: (v: boolean): Record<string, string> | null => (v ? { 'data-open': '' } : { 'data-closed': '' }),
      },
      props: merged,
    });
  },
);
