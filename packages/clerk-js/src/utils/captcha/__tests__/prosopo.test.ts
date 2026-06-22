import { CAPTCHA_ELEMENT_ID, CAPTCHA_INVISIBLE_CLASSNAME } from '@clerk/shared/internal/clerk-js/constants';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getProcaptchaToken } from '../prosopo';

/**
 * Mirrors the Turnstile regression guard: the inline `#clerk-captcha` "spotlight"
 * keys off `style.maxHeight !== '0'`, so the common invisible flow must never
 * mount Procaptcha into `#clerk-captcha`.
 */
describe('getProcaptchaToken — invisible flow', () => {
  let renderArgs: { element: Element; options: Record<string, any> } | undefined;

  beforeEach(() => {
    renderArgs = undefined;
    (window as any).procaptcha = {
      render: vi.fn((element: Element, options: Record<string, any>) => {
        renderArgs = { element, options };
        setTimeout(() => options.callback('mock_token'), 0);
        return Promise.resolve();
      }),
      reset: vi.fn(),
      execute: vi.fn(),
      ready: vi.fn(),
    };
  });

  afterEach(() => {
    document.body.innerHTML = '';
    delete (window as any).procaptcha;
    vi.restoreAllMocks();
  });

  it('renders into its own throwaway container, never #clerk-captcha', async () => {
    const inline = document.createElement('div');
    inline.id = CAPTCHA_ELEMENT_ID;
    inline.style.maxHeight = '0';
    document.body.appendChild(inline);

    const result = await getProcaptchaToken({
      captchaProvider: 'prosopo',
      siteKey: 'visible-key',
      invisibleSiteKey: 'invisible-key',
      widgetType: 'invisible',
    });

    expect(result).toEqual({ captchaToken: 'mock_token', captchaWidgetType: 'invisible' });

    // The invisible flow renders into the dedicated `.clerk-invisible-captcha` div with the invisible key.
    expect((window as any).procaptcha.render).toHaveBeenCalledTimes(1);
    expect((renderArgs?.element as HTMLElement).classList.contains(CAPTCHA_INVISIBLE_CLASSNAME)).toBe(true);
    expect(renderArgs?.options.siteKey).toBe('invisible-key');
    expect(renderArgs?.options.size).toBe('invisible');

    // The spotlight signal on #clerk-captcha is untouched throughout → no spotlight.
    expect(inline.style.maxHeight || '0').toBe('0');

    // The temporary invisible container is created then cleaned up in `finally`.
    expect(document.querySelector(`.${CAPTCHA_INVISIBLE_CLASSNAME}`)).toBeNull();
  });
});
