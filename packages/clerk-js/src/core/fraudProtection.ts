import { CaptchaChallenge } from '../utils/captcha/CaptchaChallenge';
import { Clerk, ClerkRuntimeError } from './resources/internal';
import { Client, isClerkAPIResponseError } from './resources/internal';
import { waitForElement } from '@clerk/shared/dom';

export class FraudProtection {
  private static instance: FraudProtection;

  private inflightException: Promise<unknown> | null = null;

  private captchaRetryCount = 0;
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private hasReachedDeadEnd = false;

  public static getInstance(): FraudProtection {
    if (!FraudProtection.instance) {
      FraudProtection.instance = new FraudProtection(Client, CaptchaChallenge);
    }
    return FraudProtection.instance;
  }

  private constructor(
    private client: typeof Client,
    private CaptchaChallengeImpl: typeof CaptchaChallenge,
  ) {}

  public async execute<T extends () => Promise<any>, R = Awaited<ReturnType<T>>>(clerk: Clerk, cb: T): Promise<R> {
    if (this.hasReachedDeadEnd) {
      throw new ClerkRuntimeError(
        'Failed security challenge. Please try again with a different browser or refresh the page.',
        { code: 'captcha_client_dead_end' },
      );
    }

    try {
      if (this.inflightException) {
        await this.inflightException;
      }

      return await cb();
    } catch (e) {
      if (!isClerkAPIResponseError(e)) {
        throw e;
      }

      if (e.errors[0]?.code !== 'requires_captcha') {
        throw e;
      }

      // If we're already handling a previous exception, wait for it to finish
      if (this.inflightException) {
        await this.inflightException;
        // If this is resolved, it means the request finally resolved with 200
        // so we can replay the original request
        return await cb();
      }

      // Otherwise, create a new placeholder promise to prevent other exceptions from being handled
      let resolve: any;
      this.inflightException = new Promise<unknown>(r => (resolve = r));

      try {
        const captchaParams: any = await this.managedChallenge(clerk);
        if (captchaParams?.captchaError !== 'modal_component_not_ready') {
          await this.client.getOrCreateInstance().sendCaptchaToken(captchaParams);
          this.captchaRetryCount = 0; // Reset the retry count on success
        }
      } catch (err) {
        this.captchaRetryCount++;
        if (this.captchaRetryCount >= this.MAX_RETRY_ATTEMPTS && !this.hasReachedDeadEnd) {
          this.hasReachedDeadEnd = true;
          await this.openDeadEndModal(clerk);
        }
        throw err;
      } finally {
        // Resolve the exception placeholder promise so that other exceptions can be handled
        resolve();
        this.inflightException = null;
      }

      return await cb();
    }
  }

  public managedChallenge(clerk: Clerk) {
    return new this.CaptchaChallengeImpl(clerk).managedInModal({ action: 'verify' });
  }

  private async openDeadEndModal(clerk: Clerk) {
    const container = '#cl-modal-captcha-container';
    const wrapper = '#cl-modal-captcha-wrapper';
    await clerk.__internal_openBlankCaptchaModal?.();
    const el = await waitForElement(container);
    if (el) {
      el.innerHTML = `
      <div style="text-align: start">
        <p>Our system has flagged your connection as potentially automated. Try these solutions:</p>
        <ul>
          <li><strong>Refresh the page</strong> - Try refreshing the page to try again</li>
          <li><strong>Disable browser extensions</strong> - Ad blockers may interfere with our validations</li>
          <li><strong>Disable VPNs or proxies</strong> - These may trigger security filters</li>
          <li><strong>Change browser</strong> - Make sure you are using the latest Chrome, Firefox, Safari, or Edge</li>
          <li><strong>Try different network</strong> - Network restrictions can cause validation failures</li>
        </ul>
      </div>
      `;
    }
    const wrapperEl = document.querySelector(wrapper) as HTMLElement;
    if (wrapperEl) {
      wrapperEl.style.setProperty('visibility', 'visible');
      wrapperEl.style.setProperty('pointer-events', 'all');
    }
  }
}
