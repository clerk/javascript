import { CAPTCHA_ELEMENT_ID, CAPTCHA_INVISIBLE_CLASSNAME } from '@clerk/shared/internal/clerk-js/constants';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getTurnstileToken } from '../turnstile';

/**
 * Regression guard for the inline "spotlight": the spotlight keys off
 * `#clerk-captcha`'s `style.maxHeight !== '0'`. The common invisible flow (~99% of
 * challenges) must never create or mutate `#clerk-captcha`, so its `maxHeight` stays
 * `'0'` and no spotlight is ever triggered. This pins that existing behavior.
 */
describe('getTurnstileToken — invisible flow', () => {
  let renderConfig: Record<string, any> | undefined;

  beforeEach(() => {
    renderConfig = undefined;
    (window as any).turnstile = {
      render: vi.fn((_selector: string, config: Record<string, any>) => {
        renderConfig = config;
        // Real Turnstile returns the widget id, then fires the callback asynchronously.
        // Invisible challenges resolve without ever escalating to interactive, so the
        // `before-interactive-callback` (the only code that expands #clerk-captcha) never fires.
        setTimeout(() => config.callback('mock_token'), 0);
        return 'mock_widget_id';
      }),
      remove: vi.fn(),
      reset: vi.fn(),
    };
  });

  afterEach(() => {
    document.body.innerHTML = '';
    delete (window as any).turnstile;
    vi.restoreAllMocks();
  });

  it('renders into its own throwaway container, never #clerk-captcha', async () => {
    // An inline #clerk-captcha may coexist on the page (e.g. a Start card is mounted),
    // but an invisible challenge must never touch it.
    const inline = document.createElement('div');
    inline.id = CAPTCHA_ELEMENT_ID;
    inline.style.maxHeight = '0';
    document.body.appendChild(inline);

    const result = await getTurnstileToken({
      captchaProvider: 'turnstile',
      siteKey: 'visible-key',
      invisibleSiteKey: 'invisible-key',
      widgetType: 'invisible',
    });

    expect(result).toEqual({ captchaToken: 'mock_token', captchaWidgetType: 'invisible' });

    // The invisible flow targets its own `.clerk-invisible-captcha` div with the invisible key.
    expect((window as any).turnstile.render).toHaveBeenCalledWith(`.${CAPTCHA_INVISIBLE_CLASSNAME}`, expect.anything());
    expect(renderConfig?.sitekey).toBe('invisible-key');

    // The spotlight signal on #clerk-captcha is untouched throughout → no spotlight.
    expect(inline.style.maxHeight || '0').toBe('0');

    // The temporary invisible container is created then cleaned up in `finally`.
    expect(document.querySelector(`.${CAPTCHA_INVISIBLE_CLASSNAME}`)).toBeNull();
  });
});
