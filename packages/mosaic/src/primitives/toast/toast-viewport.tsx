'use client';

import React, { type CSSProperties, type FocusEvent, useEffect } from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
import { useToastContext } from './toast-context';

export type ToastViewportProps = ComponentProps<'div'>;

export const ToastViewport = React.forwardRef<HTMLDivElement, ToastViewportProps>(function ToastViewport(props, ref) {
  const { render, ...otherProps } = props;
  const { toasts, expanded, frontmost, setHovering, setFocused, focusToast, viewportRef, prevFocusRef } =
    useToastContext();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'F6' || event.defaultPrevented) {
        return;
      }
      const viewport = viewportRef.current;
      const active = document.activeElement;
      if (!viewport || !(active instanceof HTMLElement)) {
        return;
      }

      if (viewport.contains(active)) {
        const previous = prevFocusRef.current;
        if (previous?.isConnected) {
          event.preventDefault();
          previous.focus();
        }
        return;
      }

      const first = toasts.find(t => t.transitionStatus !== 'ending' && !t.limited);
      if (!first) {
        return;
      }
      event.preventDefault();
      prevFocusRef.current = active;
      if (!focusToast(first.id)) {
        viewport.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [toasts, focusToast, viewportRef, prevFocusRef]);

  const isInside = (target: EventTarget | null) =>
    target instanceof Node && viewportRef.current?.contains(target) === true;

  const style: CSSProperties & Record<`--${string}`, string> = {
    '--toast-frontmost-height': `${frontmost?.height ?? 0}px`,
  };

  const defaultProps = {
    role: 'region',
    'aria-label': 'Notifications',
    tabIndex: -1,
    style,
    onMouseEnter: () => setHovering(true),
    onMouseLeave: () => setHovering(false),
    onFocus: (event: FocusEvent<HTMLDivElement>) => {
      if (!isInside(event.relatedTarget)) {
        prevFocusRef.current = event.relatedTarget instanceof HTMLElement ? event.relatedTarget : null;
      }
      setFocused(true);
    },
    onBlur: (event: FocusEvent<HTMLDivElement>) => {
      if (!isInside(event.relatedTarget)) {
        setFocused(false);
      }
    },
  } satisfies DefaultProps<'div'>;

  return useRender({
    defaultTagName: 'div',
    render,
    ref: [viewportRef, ref],
    state: { expanded },
    stateAttributesMapping: {
      expanded: v => (v ? { 'data-expanded': '' } : null),
    },
    props: mergeProps<'div'>(defaultProps, otherProps),
  });
});
