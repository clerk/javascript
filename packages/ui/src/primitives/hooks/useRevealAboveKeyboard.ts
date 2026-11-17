import type React from 'react';
import { useEffect, useRef } from 'react';

const isIOS = () => typeof CSS !== 'undefined' && CSS.supports('-webkit-touch-callout', 'none');

export const useRevealAboveKeyboard = <T extends HTMLElement>(
  onFocus: React.FocusEventHandler<T> | undefined,
  onBlur: React.FocusEventHandler<T> | undefined,
) => {
  const stopRef = useRef<(() => void) | null>(null);

  const stop = () => {
    stopRef.current?.();
    stopRef.current = null;
  };

  useEffect(() => stop, []);

  return {
    onFocus: (e: React.FocusEvent<T>) => {
      onFocus?.(e);
      const viewport = window.visualViewport;
      if (!viewport || !isIOS()) {
        return;
      }
      const element = e.currentTarget;
      const reveal = () => {
        if (element.getBoundingClientRect().bottom > viewport.offsetTop + viewport.height) {
          element.scrollIntoView({ block: 'center' });
        }
      };
      stop();
      viewport.addEventListener('resize', reveal);
      stopRef.current = () => viewport.removeEventListener('resize', reveal);
      reveal();
    },
    onBlur: (e: React.FocusEvent<T>) => {
      stop();
      onBlur?.(e);
    },
  };
};
