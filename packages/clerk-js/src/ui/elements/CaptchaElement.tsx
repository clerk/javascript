import { useEffect, useRef } from 'react';

import { CAPTCHA_ELEMENT_ID } from '../../utils/captcha';
import { Box } from '../customizables';

export const CaptchaElement = () => {
  const elementRef = useRef(null);
  const maxHeightValueRef = useRef('0');
  const minHeightValueRef = useRef('unset');
  const marginBottomValueRef = useRef('unset');

  useEffect(() => {
    if (!elementRef.current) return;

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
      id={CAPTCHA_ELEMENT_ID}
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
