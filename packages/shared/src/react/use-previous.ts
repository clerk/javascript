import type { StripeElement } from '@stripe/stripe-js';
import { useEffect, useRef } from 'react';

export const usePrevious = <T>(value: T): T => {
  const ref = useRef(value);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};

export const useAttachEvent = <A extends unknown[]>(
  element: StripeElement | null,
  event: string,
  cb?: (...args: A) => any,
) => {
  const cbDefined = !!cb;
  const cbRef = useRef(cb);

  // In many integrations the callback prop changes on each render.
  // Using a ref saves us from calling element.on/.off every render.
  useEffect(() => {
    cbRef.current = cb;
  }, [cb]);

  useEffect(() => {
    if (!cbDefined || !element) {
      return () => {};
    }

    const decoratedCb = (...args: A): void => {
      if (cbRef.current) {
        cbRef.current(...args);
      }
    };

    (element as any).on(event, decoratedCb);

    return () => {
      (element as any).off(event, decoratedCb);
    };
  }, [cbDefined, event, element, cbRef]);
};
