import type { Clerk } from '../../core/resources/internal';
import { getCaptchaToken } from './getCaptchaToken';
import { retrieveCaptchaInfo } from './retrieveCaptchaInfo';
import type { CaptchaOptions } from './types';

export class CaptchaChallenge {
  public constructor(private clerk: Clerk) {}

  /**
   * Triggers an invisible challenge.
   * This will always use the non-interactive variant of the CAPTCHA challenge and will
   * always use the fallback key.
   */
  public async invisible(opts?: Partial<CaptchaOptions>) {
    const { captchaSiteKey, canUseCaptcha, captchaPublicKeyInvisible } = retrieveCaptchaInfo(this.clerk);

    if (canUseCaptcha && captchaSiteKey && captchaPublicKeyInvisible) {
      return getCaptchaToken({
        siteKey: captchaPublicKeyInvisible,
        invisibleSiteKey: captchaPublicKeyInvisible,
        widgetType: 'invisible',
        captchaProvider: 'turnstile',
        action: opts?.action,
      }).catch(e => {
        if (e.captchaError) {
          return { captchaError: e.captchaError };
        }
        return undefined;
      });
    }

    return undefined;
  }

  /**
   * Triggers a smart challenge if the user is required to solve a CAPTCHA.
   * The type of the challenge depends on the dashboard configuration.
   * By default, smart (managed) captcha is preferred. If the customer has selected invisible, this method
   * will fall back to using the invisible captcha instead.
   *
   * Managed challenged start as non-interactive and escalate to interactive if necessary.
   */
  public async managedOrInvisible(opts?: Partial<CaptchaOptions>) {
    const { captchaSiteKey, canUseCaptcha, captchaWidgetType, captchaProvider, captchaPublicKeyInvisible } =
      retrieveCaptchaInfo(this.clerk);

    if (canUseCaptcha && captchaSiteKey && captchaPublicKeyInvisible) {
      return getCaptchaToken({
        siteKey: captchaSiteKey,
        widgetType: captchaWidgetType,
        invisibleSiteKey: captchaPublicKeyInvisible,
        captchaProvider,
        ...opts,
      }).catch(e => {
        if (e.captchaError) {
          return { captchaError: e.captchaError };
        }
        return undefined;
      });
    }

    return {};
  }

  /**
   * Similar to managed() but will render the CAPTCHA challenge in a modal
   * managed by clerk-js itself.
   */
  public async managedInModal(opts?: Partial<CaptchaOptions>) {
    return this.managedOrInvisible({
      modalWrapperQuerySelector: '#cl-modal-captcha-wrapper',
      modalContainerQuerySelector: '#cl-modal-captcha-container',
      openModal: () => this.clerk.__internal_openBlankCaptchaModal(),
      closeModal: () => this.clerk.__internal_closeBlankCaptchaModal(),
      action: opts?.action,
    });
  }
}
