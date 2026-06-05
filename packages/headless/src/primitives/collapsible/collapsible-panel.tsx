'use client';

import { type RefObject, useLayoutEffect, useRef, useState } from 'react';
import { useTransition } from '../../hooks/use-transition';
import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
import { useCollapsibleContext } from './collapsible-context';

export interface CollapsiblePanelProps extends ComponentProps<'div'> {}

export function CollapsiblePanel(props: CollapsiblePanelProps) {
  const { render, ...otherProps } = props;
  const { open, triggerId, panelId } = useCollapsibleContext();

  const panelRef = useRef<HTMLElement | null>(null);
  const [height, setHeight] = useState<number | undefined>(undefined);
  const [width, setWidth] = useState<number | undefined>(undefined);

  const hasBeenClosed = useRef(false);
  if (!open) hasBeenClosed.current = true;

  const { mounted, transitionProps } = useTransition({
    open,
    ref: panelRef as RefObject<HTMLElement>,
  });

  useLayoutEffect(() => {
    if (!mounted) return;

    const panel = panelRef.current;
    if (!panel) return;

    const measure = () => {
      setHeight(panel.scrollHeight);
      setWidth(panel.scrollWidth);
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(panel, { box: 'border-box' });

    return () => ro.disconnect();
  }, [mounted]);

  const state = { open };

  const effectiveTransitionProps = !hasBeenClosed.current
    ? {
        ...transitionProps,
        'data-cl-starting-style': undefined,
        style: undefined,
      }
    : transitionProps;

  const defaultProps: Record<string, unknown> = {
    'data-cl-slot': 'collapsible-panel',
    id: panelId,
    role: 'region' as const,
    'aria-labelledby': triggerId,
    ref: panelRef,
    ...effectiveTransitionProps,
    style: {
      '--collapsible-panel-height': height != null ? `${height}px` : undefined,
      '--collapsible-panel-width': width != null ? `${width}px` : undefined,
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
