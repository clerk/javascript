import { CAPTCHA_ELEMENT_ID, CAPTCHA_INVISIBLE_CLASSNAME } from '@clerk/shared/internal/clerk-js/constants';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@clerk/shared/loadScript', () => ({
  loadScript: vi.fn(async () => ({}) as any),
}));

import { loadScript } from '@clerk/shared/loadScript';

import { getProcaptchaToken } from '../prosopo';

type RenderCall = { element: Element; options: Record<string, any> };

const installProcaptchaMock = (renderImpl?: (call: RenderCall) => void) => {
  const calls: RenderCall[] = [];
  (window as any).procaptcha = {
    render: vi.fn((element: Element, options: Record<string, any>) => {
      const call: RenderCall = { element, options };
      calls.push(call);
      renderImpl?.(call);
      return Promise.resolve();
    }),
    reset: vi.fn(),
    execute: vi.fn(),
    ready: vi.fn(),
  };
  return calls;
};

/**
 * Regression guard for the inline "spotlight": the spotlight keys off `#clerk-captcha`'s
 * `style.maxHeight !== '0'`. The common invisible flow (~99% of challenges) must never create or
 * mutate `#clerk-captcha`, so its `maxHeight` stays `'0'` and no spotlight is ever triggered.
 */
describe('getProcaptchaToken', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    delete (window as any).procaptcha;
    vi.restoreAllMocks();
  });

  describe('invisible flow', () => {
    beforeEach(() => {
      installProcaptchaMock(call => {
        setTimeout(() => call.options.callback('mock_token'), 0);
      });
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

      const renderMock = (window as any).procaptcha.render as ReturnType<typeof vi.fn>;
      expect(renderMock).toHaveBeenCalledTimes(1);
      const [containerArg, optionsArg] = renderMock.mock.calls[0];
      expect((containerArg as HTMLElement).classList.contains(CAPTCHA_INVISIBLE_CLASSNAME)).toBe(true);
      expect(optionsArg.siteKey).toBe('invisible-key');
      expect(optionsArg.size).toBe('invisible');

      // Spotlight signal on #clerk-captcha is untouched throughout.
      expect(inline.style.maxHeight || '0').toBe('0');

      // Temporary container is cleaned up.
      expect(document.querySelector(`.${CAPTCHA_INVISIBLE_CLASSNAME}`)).toBeNull();

      // execute() is required to start the challenge for invisible widgets.
      expect((window as any).procaptcha.execute).toHaveBeenCalledTimes(1);
    });

    it('falls back to invisible when widgetType is "smart" but #clerk-captcha is absent', async () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await getProcaptchaToken({
        captchaProvider: 'prosopo',
        siteKey: 'visible-key',
        invisibleSiteKey: 'invisible-key',
        widgetType: 'smart',
      });

      expect(result.captchaWidgetType).toBe('invisible');
      const optionsArg = ((window as any).procaptcha.render as any).mock.calls[0][1];
      expect(optionsArg.siteKey).toBe('invisible-key');
      expect(optionsArg.size).toBe('invisible');
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('smart flow', () => {
    it('renders into #clerk-captcha with the visible site key, no invisible container', async () => {
      installProcaptchaMock(call => {
        setTimeout(() => call.options.callback('smart_token'), 0);
      });

      const inline = document.createElement('div');
      inline.id = CAPTCHA_ELEMENT_ID;
      inline.setAttribute('data-cl-theme', 'dark');
      document.body.appendChild(inline);

      const result = await getProcaptchaToken({
        captchaProvider: 'prosopo',
        siteKey: 'visible-key',
        invisibleSiteKey: 'invisible-key',
        widgetType: 'smart',
      });

      expect(result).toEqual({ captchaToken: 'smart_token', captchaWidgetType: 'smart' });

      const renderMock = (window as any).procaptcha.render as ReturnType<typeof vi.fn>;
      const [containerArg, optionsArg] = renderMock.mock.calls[0];
      expect((containerArg as HTMLElement).id).toBe(CAPTCHA_ELEMENT_ID);
      expect(optionsArg.siteKey).toBe('visible-key');
      expect(optionsArg.theme).toBe('dark');
      expect(optionsArg.size).toBeUndefined();

      // Smart widgets are not triggered through execute().
      expect((window as any).procaptcha.execute).not.toHaveBeenCalled();

      // No invisible container leaked.
      expect(document.querySelector(`.${CAPTCHA_INVISIBLE_CLASSNAME}`)).toBeNull();

      // Smart-flow inline styles are reverted on cleanup.
      expect(inline.style.minHeight).toBe('unset');
      expect(inline.style.marginBottom).toBe('unset');
    });

    it('drops invalid theme attributes silently', async () => {
      installProcaptchaMock(call => setTimeout(() => call.options.callback('t'), 0));

      const inline = document.createElement('div');
      inline.id = CAPTCHA_ELEMENT_ID;
      inline.setAttribute('data-cl-theme', 'rainbow');
      document.body.appendChild(inline);

      await getProcaptchaToken({
        captchaProvider: 'prosopo',
        siteKey: 'visible-key',
        invisibleSiteKey: 'invisible-key',
        widgetType: 'smart',
      });

      const optionsArg = ((window as any).procaptcha.render as any).mock.calls[0][1];
      expect(optionsArg.theme).toBeUndefined();
    });
  });

  describe('modal flow', () => {
    it('opens the modal, renders into the modal container, and closes the modal on success', async () => {
      installProcaptchaMock(call => setTimeout(() => call.options.callback('modal_token'), 0));

      const wrapper = document.createElement('div');
      wrapper.id = 'cl-modal-captcha-wrapper';
      const container = document.createElement('div');
      container.id = 'cl-modal-captcha-container';
      document.body.append(wrapper, container);

      const openModal = vi.fn(async () => undefined);
      const closeModal = vi.fn(async () => undefined);

      const result = await getProcaptchaToken({
        captchaProvider: 'prosopo',
        siteKey: 'visible-key',
        invisibleSiteKey: 'invisible-key',
        widgetType: 'invisible',
        modalContainerQuerySelector: '#cl-modal-captcha-container',
        modalWrapperQuerySelector: '#cl-modal-captcha-wrapper',
        openModal,
        closeModal,
      });

      expect(openModal).toHaveBeenCalledTimes(1);
      // Once from the callback, once from the finally-cleanup.
      expect(closeModal).toHaveBeenCalled();
      expect(result.captchaWidgetType).toBe('invisible');

      const [containerArg, optionsArg] = ((window as any).procaptcha.render as any).mock.calls[0];
      expect((containerArg as HTMLElement).id).toBe('cl-modal-captcha-container');
      // Modal flow uses the (visible) siteKey, not the invisible fallback.
      expect(optionsArg.siteKey).toBe('visible-key');
    });

    it('throws modal_component_not_ready when openModal rejects', async () => {
      installProcaptchaMock();

      const wrapper = document.createElement('div');
      wrapper.id = 'cl-modal-captcha-wrapper';
      const container = document.createElement('div');
      container.id = 'cl-modal-captcha-container';
      document.body.append(wrapper, container);

      const openModal = vi.fn(async () => {
        throw new Error('not ready');
      });

      await expect(
        getProcaptchaToken({
          captchaProvider: 'prosopo',
          siteKey: 'visible-key',
          invisibleSiteKey: 'invisible-key',
          widgetType: 'invisible',
          modalContainerQuerySelector: '#cl-modal-captcha-container',
          modalWrapperQuerySelector: '#cl-modal-captcha-wrapper',
          openModal,
        }),
      ).rejects.toMatchObject({ captchaError: 'modal_component_not_ready' });

      expect((window as any).procaptcha.render).not.toHaveBeenCalled();
    });
  });

  describe('rejection paths', () => {
    it('rejects with procaptcha_error when error-callback fires', async () => {
      installProcaptchaMock(call => {
        setTimeout(() => call.options['error-callback'](), 0);
      });

      await expect(
        getProcaptchaToken({
          captchaProvider: 'prosopo',
          siteKey: 'visible-key',
          invisibleSiteKey: 'invisible-key',
          widgetType: 'invisible',
        }),
      ).rejects.toMatchObject({ captchaError: 'procaptcha_error' });

      // Invisible container still cleaned up after error.
      expect(document.querySelector(`.${CAPTCHA_INVISIBLE_CLASSNAME}`)).toBeNull();
    });

    it('rejects with procaptcha_expired when expired-callback fires', async () => {
      installProcaptchaMock(call => {
        setTimeout(() => call.options['expired-callback'](), 0);
      });

      await expect(
        getProcaptchaToken({
          captchaProvider: 'prosopo',
          siteKey: 'visible-key',
          invisibleSiteKey: 'invisible-key',
          widgetType: 'invisible',
        }),
      ).rejects.toMatchObject({ captchaError: 'procaptcha_expired' });
    });

    it('rejects with captcha_script_failed_to_load when the bundle fails to load', async () => {
      // Ensure procaptcha is not on window so the load path is exercised.
      delete (window as any).procaptcha;
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      (loadScript as any).mockRejectedValueOnce(new Error('network'));

      await expect(
        getProcaptchaToken({
          captchaProvider: 'prosopo',
          siteKey: 'visible-key',
          invisibleSiteKey: 'invisible-key',
          widgetType: 'invisible',
        }),
      ).rejects.toMatchObject({ captchaError: 'captcha_script_failed_to_load' });

      // Surface the Prosopo CSP doc URL, not Cloudflare's.
      expect(warnSpy.mock.calls[0]?.[0]).toMatch(/js\.prosopo\.io/);

      warnSpy.mockRestore();
    });
  });
});
