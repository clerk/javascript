'use client';

import { useMergeRefs } from '@floating-ui/react';
import React, { type RefObject, useLayoutEffect, useRef, useState } from 'react';

import { useAnimationsFinished } from '../../hooks/use-animations-finished';
import { useTransition } from '../../hooks/use-transition';
import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
import { resetLayoutStyles } from '../../utils/reset-layout-styles';
import { useAccordionItemContext } from './accordion-context';

export type AccordionPanelProps = ComponentProps<'div'>;

export const AccordionPanel = React.forwardRef<HTMLDivElement, AccordionPanelProps>(
  function AccordionPanel(props, ref) {
    const { render, ...otherProps } = props;
    const { open, triggerId, panelId } = useAccordionItemContext();

    const panelRef = useRef<HTMLElement | null>(null);
    // Merge the consumer ref with the internal panelRef so passing a ref does not
    // clobber the ref the panel relies on for height measurement.
    const combinedRef = useMergeRefs([panelRef, ref]);
    const [height, setHeight] = useState<number | undefined>(undefined);

    // Track whether open has ever transitioned from true→false.
    // Until that happens, skip enter animations (prevents animate-on-load).
    const hasBeenClosed = useRef(false);
    if (!open) {
      hasBeenClosed.current = true;
    }

    const { mounted, transitionStatus, transitionProps } = useTransition({
      open,
      ref: panelRef as RefObject<HTMLElement>,
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

      // Measure scrollHeight of the panel's content. Reset flex/grid alignment
      // first so non-default alignment can't shrink the reported height.
      let restoreLayoutStyles: (() => void) | undefined;
      const measure = () => {
        restoreLayoutStyles?.();
        restoreLayoutStyles = resetLayoutStyles(panel);
        setHeight(panel.scrollHeight);
      };

      measure();

      const ro = new ResizeObserver(measure);
      // Observe children mutations that affect height
      ro.observe(panel, { box: 'border-box' });

      return () => {
        ro.disconnect();
        restoreLayoutStyles?.();
      };
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
      const restoreLayoutStyles = resetLayoutStyles(panel);
      setHeight(panel.scrollHeight);
      return restoreLayoutStyles;
    }, [open, transitionStatus]);

    const state = { open };

    // Skip enter animation for panels that have never been closed
    const effectiveTransitionProps = !hasBeenClosed.current
      ? {
          ...transitionProps,
          'data-cl-starting-style': undefined,
          style: undefined,
        }
      : transitionProps;

    const defaultProps: Record<string, unknown> = {
      'data-cl-slot': 'accordion-panel',
      id: panelId,
      role: 'region' as const,
      'aria-labelledby': triggerId,
      ref: combinedRef,
      ...effectiveTransitionProps,
      style: {
        '--cl-accordion-panel-height': height != null ? `${height}px` : undefined,
        ...effectiveTransitionProps.style,
      },
    };

    const merged = mergeProps<'div'>(defaultProps, otherProps);
    // The wired id is owned by the primitive: a consumer-supplied id must not
    // override it, or the trigger/panel aria pairing would silently break.
    merged.id = panelId;

    return renderElement({
      defaultTagName: 'div',
      render,
      enabled: mounted,
      state,
      stateAttributesMapping: {
        open: (v: boolean): Record<string, string> | null => (v ? { 'data-cl-open': '' } : { 'data-cl-closed': '' }),
      },
      props: merged,
    });
  },
);
