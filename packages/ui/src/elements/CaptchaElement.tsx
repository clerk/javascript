import { CAPTCHA_ELEMENT_ID } from '@clerk/shared/internal/clerk-js/constants';
import { useEffect, useRef, useState } from 'react';

import { Box, useAppearance, useLocalizations } from '../customizables';

/**
 * This component uses a MutationObserver to listen for DOM changes made by our Turnstile logic,
 * which operates outside the React lifecycle. It stores the observed state in ref to ensure that
 * any external style changes, such as updates to max-height, min-height, or margin-bottom persist across re-renders,
 * preventing unwanted layout resets.
 *
 * When Turnstile escalates to an interactive "Verify you are human" challenge it sets the element's
 * `maxHeight` to a non-`'0'` value (reset back to `'0'` on resolve/error). `onInteractiveChange` surfaces
 * that signal so a parent can react (e.g. spotlight the challenge); it never fires on mount.
 */
export const CaptchaElement = ({
  onInteractiveChange,
  gapless,
}: {
  onInteractiveChange?: (interactive: boolean) => void;
  /**
   * When true, the element is removed from flow (`position:absolute`) while collapsed so it adds no
   * gap gutter to a flex parent, switching to `position:static` while interactive. Opt-in so the
   * other (non-spotlight) render sites keep their current positioning.
   */
  gapless?: boolean;
}) => {
  const elementRef = useRef(null);
  const maxHeightValueRef = useRef('0');
  const minHeightValueRef = useRef('unset');
  const marginBottomValueRef = useRef('unset');
  // State forces a re-render on the interactive transition, which re-applies the ref-held styles
  // above (preserving Turnstile's injected values) and drives the `gapless` position toggle.
  const [isInteractive, setIsInteractive] = useState(false);
  // The observer is set up once (`[]` deps), so it reads the latest callback through a ref.
  const onInteractiveChangeRef = useRef(onInteractiveChange);
  onInteractiveChangeRef.current = onInteractiveChange;
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

          // ORDERING IS LOAD-BEARING: derive and apply the interactive signal only AFTER the refs above
          // are updated. The re-render that `setIsInteractive` triggers reads those refs fresh; setting
          // state earlier (or from a separate effect) would write stale defaults back into `style` and
          // clobber Turnstile's injected styles.
          const nowInteractive = maxHeightValueRef.current !== '0';
          setIsInteractive(nowInteractive);
          onInteractiveChangeRef.current?.(nowInteractive);
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
        // When `gapless`, drop out of flow while collapsed so the element contributes no gap gutter
        // to its flex parent; rejoin flow once the interactive challenge expands it.
        position: gapless ? (isInteractive ? 'static' : 'absolute') : undefined,
      }}
      data-cl-theme={captchaTheme}
      data-cl-size={captchaSize}
      data-cl-language={captchaLanguage}
    />
  );
};
