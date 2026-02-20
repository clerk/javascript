import { PROTECT_CHECK_CONTAINER_ID } from '@clerk/shared/internal/clerk-js/constants';
import { useEffect, useRef } from 'react';

import { Box } from '../customizables';

/**
 * This component provides a container div for protect check scripts to render into.
 * Uses a MutationObserver (same pattern as CaptchaElement) to respond to style changes
 * made by protect check scripts outside React's lifecycle.
 */
export const ProtectCheckElement = () => {
  const elementRef = useRef(null);
  const maxHeightValueRef = useRef('0');
  const minHeightValueRef = useRef('unset');
  const marginBottomValueRef = useRef('unset');

  useEffect(() => {
    if (!elementRef.current) {
      return;
    }

    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        const target = mutation.target as HTMLDivElement;
        if (mutation.type === 'attributes' && mutation.attributeName === 'style' && elementRef.current) {
          maxHeightValueRef.current = target.style.maxHeight || '0';
          minHeightValueRef.current = target.style.minHeight || 'unset';
          marginBottomValueRef.current = target.style.marginBottom || 'unset';
        }
      });
    });

    observer.observe(elementRef.current, {
      attributes: true,
      attributeFilter: ['style'],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <Box
      ref={elementRef}
      id={PROTECT_CHECK_CONTAINER_ID}
      style={{
        display: 'block',
        alignSelf: 'center',
        maxHeight: maxHeightValueRef.current,
        minHeight: minHeightValueRef.current,
        marginBottom: marginBottomValueRef.current,
      }}
    />
  );
};
