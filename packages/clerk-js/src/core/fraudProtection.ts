import { ClerkRuntimeError, isClerkAPIResponseError, isClerkRuntimeError } from '@clerk/shared/error';

import { CaptchaChallenge } from '../utils/captcha/CaptchaChallenge';
import type { Clerk } from './resources/internal';
import { Client } from './resources/internal';

export class FraudProtection {
  private static instance: FraudProtection;

  private inflightException: Promise<unknown> | null = null;

  private captchaRetryCount = 0;
  private readonly MAX_RETRY_ATTEMPTS = 3;

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

  // TODO @userland-errors:
  public async execute<R>(clerk: Clerk, cb: () => Promise<R>, assertCurrent?: () => void): Promise<R> {
    assertCurrent?.();
    // TODO @userland-errors:
    if (this.captchaAttemptsExceeded()) {
      throw new ClerkRuntimeError(
        'Security verification failed. Please try again by refreshing the page, clearing your browser cookies, or using a different web browser.',
        { code: 'captcha_client_attempts_exceeded' },
      );
    }

    try {
      if (this.inflightException) {
        await this.inflightException;
      }

      assertCurrent?.();
      return await cb();
    } catch (e) {
      assertCurrent?.();
      if (!isClerkAPIResponseError(e)) {
        throw e;
      }

      // Network errors should bypass captcha logic and be re-thrown immediately
      // so cache fallback can be triggered
      if (isClerkRuntimeError(e) && e.code === 'network_error') {
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
        assertCurrent?.();
        return await cb();
      }

      // Otherwise, create a new placeholder promise to prevent other exceptions from being handled
      let resolve: any;
      this.inflightException = new Promise<unknown>(r => (resolve = r));

      try {
        const captchaParams: any = await this.managedChallenge(clerk);
        assertCurrent?.();
        if (captchaParams?.captchaError !== 'modal_component_not_ready') {
          await this.client
            .getOrCreateInstance()
            .__internal_sendCaptchaToken(captchaParams, assertCurrent ? { clerk, assertCurrent } : undefined);
          assertCurrent?.();
          this.captchaRetryCount = 0; // Reset the retry count on success
        }
      } catch (err) {
        assertCurrent?.();
        this.captchaRetryCount++;
        throw err;
      } finally {
        // Resolve the exception placeholder promise so that other exceptions can be handled
        resolve();
        this.inflightException = null;
      }

      assertCurrent?.();
      return await cb();
    }
  }

  public managedChallenge(clerk: Clerk) {
    return new this.CaptchaChallengeImpl(clerk).managedInModal({ action: 'verify' });
  }

  private captchaAttemptsExceeded = () => {
    return this.captchaRetryCount >= this.MAX_RETRY_ATTEMPTS;
  };
}
