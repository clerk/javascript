import { CAPTCHA_ELEMENT_ID } from '@clerk/shared/internal/clerk-js/constants';
import { useSafeLayoutEffect } from '@clerk/shared/react';
import { useLatestRef } from '@floating-ui/react/utils';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { useRender } from '../../primitives/utils';
import { getComputedStyle } from '../../primitives/utils/dom';
import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../styles/reset.styles';
import { styles } from './captcha.styles';

export interface CaptchaProps extends Omit<MosaicComponentProps<'div'>, 'id' | 'children'> {
  /** The Turnstile widget's theme. When unset, it matches the `color-scheme` the element renders in: `dark`, `light` (also when none is set), or the visitor's color scheme when both are allowed. */
  theme?: 'auto' | 'light' | 'dark';
  /** The Turnstile widget's size. Turnstile uses `normal` when it is unset. */
  size?: 'normal' | 'flexible' | 'compact';
  /** The Turnstile widget's language, an ISO 639-1 code such as `en` or `en-us`. Turnstile follows the visitor's language when it is unset. */
  language?: string;
  /** Called when Turnstile starts or stops asking the visitor to solve an interactive challenge, so the caller can make room for it. */
  onInteractiveChange?: (interactive: boolean) => void;
}

/**
 * The element clerk-js renders Cloudflare Turnstile into when a sign-in or sign-up requires a
 * CAPTCHA. It stays empty and collapsed unless Turnstile asks the visitor to solve an interactive
 * challenge, when clerk-js expands it and sets `data-cl-interactive`. Until then it is out of the
 * layout, so it adds no gap to a flex parent. Render one per page, mounted before the sign-in or
 * sign-up is created.
 *
 * @example
 * <Captcha theme='dark' />
 */
export const Captcha = React.forwardRef<HTMLDivElement, CaptchaProps>(function MosaicCaptcha(
  { render, xstyle, theme, size, language, onInteractiveChange, ...rest },
  ref,
) {
  const [element, setElement] = React.useState<HTMLDivElement | null>(null);
  const [schemeTheme, setSchemeTheme] = React.useState<CaptchaProps['theme']>();

  useSafeLayoutEffect(() => {
    if (theme || !element) {
      return;
    }
    setSchemeTheme(themeFromColorScheme(getComputedStyle(element).colorScheme));
  });

  const onInteractiveChangeRef = useLatestRef(onInteractiveChange);

  React.useEffect(() => {
    if (!element) {
      return undefined;
    }
    let interactive = element.hasAttribute('data-cl-interactive');
    const observer = new MutationObserver(() => {
      const next = element.hasAttribute('data-cl-interactive');
      if (next !== interactive) {
        interactive = next;
        onInteractiveChangeRef.current?.(next);
      }
    });
    observer.observe(element, { attributes: true, attributeFilter: ['data-cl-interactive'] });
    return () => observer.disconnect();
  }, [element, onInteractiveChangeRef]);

  return useRender({
    defaultTagName: 'div',
    render,
    ref: [ref, setElement],
    props: {
      ...mergeStyleProps(themeProps('captcha'), stylex.props(reset.base, styles.root, xstyle), rest),
      id: CAPTCHA_ELEMENT_ID,
      'data-cl-theme': theme ?? schemeTheme,
      'data-cl-size': size,
      'data-cl-language': language,
    },
  });
});

function themeFromColorScheme(colorScheme: string): CaptchaProps['theme'] {
  const schemes = colorScheme.split(/\s+/);
  if (!schemes.includes('dark')) {
    return 'light';
  }
  return schemes.includes('light') ? 'auto' : 'dark';
}
