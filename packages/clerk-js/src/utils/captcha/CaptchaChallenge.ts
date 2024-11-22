import type { Clerk } from '../../core/resources/internal';
import { getCaptchaToken } from './getCaptchaToken';
import { retrieveCaptchaInfo } from './retrieveCaptchaInfo';

export class CaptchaChallenge {
  public constructor(private clerk: Clerk) {}

  /**
   * Triggers an invisible challenge.
   * This will always use the non-interactive variant of the CAPTCHA challenge and will
   * always use the fallback key.
   */
  public async invisible() {
    const { captchaSiteKey, canUseCaptcha, captchaURL, captchaPublicKeyInvisible } = retrieveCaptchaInfo(this.clerk);

    if (canUseCaptcha && captchaSiteKey && captchaURL && captchaPublicKeyInvisible) {
      return getCaptchaToken({
        siteKey: captchaPublicKeyInvisible,
        invisibleSiteKey: captchaPublicKeyInvisible,
        widgetType: 'invisible',
        scriptUrl: captchaURL,
        captchaProvider: 'turnstile',
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
   * Depending on the environment settings, this will either trigger an
   * invisible or smart (managed) CAPTCHA challenge.
   * Managed challenged start as non-interactive and escalate to interactive if necessary.
   * Important: For this to work at the moment, the instance needs to be using SMART protection
   * as we need both keys (visible and invisible) to be present.
   */
  public async managed() {
    const { captchaSiteKey, canUseCaptcha, captchaURL, captchaWidgetType, captchaProvider, captchaPublicKeyInvisible } =
      retrieveCaptchaInfo(this.clerk);

    if (canUseCaptcha && captchaSiteKey && captchaURL && captchaPublicKeyInvisible) {
      return getCaptchaToken({
        siteKey: captchaSiteKey,
        widgetType: captchaWidgetType,
        invisibleSiteKey: captchaPublicKeyInvisible,
        scriptUrl: captchaURL,
        captchaProvider,
        modalWrapperQuerySelector: '#cl-modal-captcha-wrapper',
        modalContainerQuerySelector: '#cl-modal-captcha-container',
        openModal: () => this.clerk.__internal_openBlankCaptchaModal(),
        closeModal: () => this.clerk.__internal_closeBlankCaptchaModal(),
      }).catch(e => {
        if (e.captchaError) {
          return { captchaError: e.captchaError };
        }
        return undefined;
      });
    }

    return {};
  }
}
