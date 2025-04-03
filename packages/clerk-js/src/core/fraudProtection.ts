import { CaptchaChallenge } from '../utils/captcha/CaptchaChallenge';
import { Clerk, ClerkRuntimeError } from './resources/internal';
import { Client, isClerkAPIResponseError } from './resources/internal';

export class FraudProtection {
  private static instance: FraudProtection;

  private inflightException: Promise<unknown> | null = null;

  private captchaRetryCount = 0;
  private readonly MAX_RETRY_ATTEMPTS = 5;
  private hasReachedDeadend = false;

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
    if (this.hasReachedDeadend) {
      throw new ClerkRuntimeError(
        'Failed security challenge. Please try again with a different browser or refresh the page.',
        { code: 'requires_captcha_failed' },
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
        const captchaParams = await this.managedChallenge(clerk);
        await this.client.getOrCreateInstance().sendCaptchaToken(captchaParams);
        this.captchaRetryCount = 0; // Reset the retry count on success
      } catch (err) {
        this.captchaRetryCount++;
        if (this.captchaRetryCount > this.MAX_RETRY_ATTEMPTS) {
          this.hasReachedDeadend = true;
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
}
