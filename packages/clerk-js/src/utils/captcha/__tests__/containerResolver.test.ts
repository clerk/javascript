import { CAPTCHA_INVISIBLE_CLASSNAME } from '@clerk/shared/internal/clerk-js/constants';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@clerk/shared/dom', () => ({
  waitForElement: vi.fn(),
}));

import { waitForElement } from '@clerk/shared/dom';

import { cleanupCaptchaContainer, resolveCaptchaContainer } from '../containerResolver';

const baseOpts = {
  captchaProvider: 'turnstile' as const,
  siteKey: 'visible-key',
  invisibleSiteKey: 'invisible-key',
  widgetType: 'invisible' as const,
};

describe('resolveCaptchaContainer', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  describe('invisible flow — per-instance containers', () => {
    it('hands out a unique selector per call so concurrent challenges do not collide', async () => {
      const a = await resolveCaptchaContainer(baseOpts);
      const b = await resolveCaptchaContainer(baseOpts);

      expect(a.containerSelector).not.toBe(b.containerSelector);
      expect(document.querySelectorAll(`.${CAPTCHA_INVISIBLE_CLASSNAME}`)).toHaveLength(2);
      expect(document.querySelector(a.containerSelector)).not.toBeNull();
      expect(document.querySelector(b.containerSelector)).not.toBeNull();
    });

    it('cleanup only removes the resolved instance, leaving concurrent containers intact', async () => {
      const a = await resolveCaptchaContainer(baseOpts);
      const b = await resolveCaptchaContainer(baseOpts);

      cleanupCaptchaContainer('invisible', {}, a.containerSelector);

      expect(document.querySelector(a.containerSelector)).toBeNull();
      expect(document.querySelector(b.containerSelector)).not.toBeNull();
    });
  });

  describe('modal flow — timeout', () => {
    it('throws modal_container_not_found when waitForElement does not resolve in time', async () => {
      vi.useFakeTimers();
      // waitForElement returns a promise that never resolves.
      (waitForElement as any).mockReturnValue(new Promise<Element | null>(() => {}));

      const openModal = vi.fn(async () => undefined);
      const promise = resolveCaptchaContainer({
        ...baseOpts,
        modalContainerQuerySelector: '#cl-modal-captcha-container',
        modalWrapperQuerySelector: '#cl-modal-captcha-wrapper',
        openModal,
      });

      const expectation = expect(promise).rejects.toMatchObject({ captchaError: 'modal_container_not_found' });

      // Advance past the timeout so the Promise.race resolves the null branch.
      await vi.advanceTimersByTimeAsync(5001);
      await expectation;

      vi.useRealTimers();
    });
  });
});
