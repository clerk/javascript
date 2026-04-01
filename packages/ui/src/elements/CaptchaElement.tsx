import { CAPTCHA_ELEMENT_ID } from '@clerk/shared/internal/clerk-js/constants';
import { useEffect, useRef } from 'react';

import { Box, useAppearance, useLocalizations } from '../customizables';

/**
 * This component uses a MutationObserver to listen for DOM changes made by our Turnstile logic,
 * which operates outside the React lifecycle. It stores the observed state in ref to ensure that
 * any external style changes, such as updates to max-height, min-height, or margin-bottom persist across re-renders,
 * preventing unwanted layout resets.
 */
export const CaptchaElement = () => {
  const elementRef = useRef(null);
  const maxHeightValueRef = useRef('0');
  const minHeightValueRef = useRef('unset');
  const marginBottomValueRef = useRef('unset');
  const { parsedCaptcha } = useAppearance();
  const { locale } = useLocalizations();
  const captchaTheme = parsedCaptcha?.theme;
  const captchaSize = parsedCaptcha?.size;
  // Turnstile expects the language to be lowercase, so we convert it here (e.g. 'en-US' -> 'en-us')
  // Supported languages: https://developers.cloudflare.com/turnstile/reference/supported-languages
  const captchaLanguage = parsedCaptcha?.language || locale?.toLowerCase();

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
      id={CAPTCHA_ELEMENT_ID}
      style={{
        display: 'block',
        alignSelf: 'center',
        maxHeight: maxHeightValueRef.current,
        minHeight: minHeightValueRef.current,
        marginBottom: marginBottomValueRef.current,
      }}
      data-cl-theme={captchaTheme}
      data-cl-size={captchaSize}
      data-cl-language={captchaLanguage}
    />
  );
};
