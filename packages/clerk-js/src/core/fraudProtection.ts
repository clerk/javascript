import { getCaptchaToken, retrieveCaptchaInfo } from '../utils/captcha';
import type { Clerk } from './resources/internal';

/**
 * TODO: @nikos Move captcha and fraud detection logic to this class
 */
class FraudProtectionService {
  private inflightRequest: Promise<unknown> | null = null;
  private ticks = 0;
  private readonly interval = 5;

  public async execute<T extends () => Promise<any>>(cb: T): Promise<Awaited<ReturnType<T>>> {
    if (this.inflightRequest) {
      await this.inflightRequest;
    }

    const prom = cb();
    this.inflightRequest = prom;
    return prom.then(res => {
      this.inflightRequest = null;
      return res;
    });
  }

  public blockUntilReady() {
    return this.inflightRequest ? this.inflightRequest.then(() => null) : Promise.resolve();
  }

  public async challengeHeartbeat(clerk: Clerk) {
    this.ticks++;
    if (!clerk.__unstable__environment?.displayConfig.captchaHeartbeat || this.ticks % this.interval) {
      return undefined;
    }
    return this.invisibleChallenge(clerk);
  }

  /**
   * Triggers an invisible challenge.
   * This will always use the non-interactive variant of the CAPTCHA challenge and will
   * always use the fallback key.
   */
  public async invisibleChallenge(clerk: Clerk) {
    const { captchaSiteKey, canUseCaptcha, captchaURL, captchaPublicKeyInvisible } = retrieveCaptchaInfo(clerk);

    if (canUseCaptcha && captchaSiteKey && captchaURL && captchaPublicKeyInvisible) {
      return getCaptchaToken({
        siteKey: captchaPublicKeyInvisible,
        invisibleSiteKey: captchaPublicKeyInvisible,
        widgetType: 'invisible',
        scriptUrl: captchaURL,
        captchaProvider: 'turnstile',
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
  public async managedChallenge(clerk: Clerk) {
    const { captchaSiteKey, canUseCaptcha, captchaURL, captchaWidgetType, captchaProvider, captchaPublicKeyInvisible } =
      retrieveCaptchaInfo(clerk);

    if (canUseCaptcha && captchaSiteKey && captchaURL && captchaPublicKeyInvisible) {
      return getCaptchaToken({
        siteKey: captchaSiteKey,
        widgetType: captchaWidgetType,
        invisibleSiteKey: captchaPublicKeyInvisible,
        scriptUrl: captchaURL,
        captchaProvider,
        modalWrapperQuerySelector: '#cl-modal-captcha-wrapper',
        modalContainerQuerySelector: '#cl-modal-captcha-container',
        openModal: () => clerk.__internal_openBlankCaptchaModal(),
        closeModal: () => clerk.__internal_closeBlankCaptchaModal(),
      });
    }

    return {};
  }
}

export const fraudProtection = new FraudProtectionService();
