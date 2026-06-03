'use client';

import { type RefObject, useLayoutEffect, useRef, useState } from 'react';
import { useTransition } from '../../hooks/use-transition';
import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
import { useAccordionItemContext } from './accordion-context';

export interface AccordionPanelProps extends ComponentProps<'div'> {}

export function AccordionPanel(props: AccordionPanelProps) {
  const { render, ...otherProps } = props;
  const { open, triggerId, panelId } = useAccordionItemContext();

  const panelRef = useRef<HTMLElement | null>(null);
  const [height, setHeight] = useState<number | undefined>(undefined);

  // Track whether open has ever transitioned from true→false.
  // Until that happens, skip enter animations (prevents animate-on-load).
  const hasBeenClosed = useRef(false);
  if (!open) hasBeenClosed.current = true;

  const { mounted, transitionProps } = useTransition({
    open,
    ref: panelRef as RefObject<HTMLElement>,
  });

  // Measure the content height and keep it in sync via ResizeObserver
  useLayoutEffect(() => {
    if (!mounted) return;

    const panel = panelRef.current;
    if (!panel) return;

    // Measure scrollHeight of the panel's content
    const measure = () => {
      setHeight(panel.scrollHeight);
    };

    measure();

    const ro = new ResizeObserver(measure);
    // Observe children mutations that affect height
    ro.observe(panel, { box: 'border-box' });

    return () => ro.disconnect();
  }, [mounted]);

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
    ref: panelRef,
    ...effectiveTransitionProps,
    style: {
      '--cl-accordion-panel-height': height != null ? `${height}px` : undefined,
      ...effectiveTransitionProps.style,
    },
  };

  return renderElement({
    defaultTagName: 'div',
    render,
    enabled: mounted,
    state,
    stateAttributesMapping: {
      open: (v: boolean): Record<string, string> | null => (v ? { 'data-cl-open': '' } : { 'data-cl-closed': '' }),
    },
    props: mergeProps<'div'>(defaultProps, otherProps),
  });
}
