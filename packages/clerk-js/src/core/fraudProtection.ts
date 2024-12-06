import type { CaptchaChallenge } from '../utils/captcha/CaptchaChallenge';
import type { Clerk, Client } from './resources/internal';
import { isClerkAPIResponseError } from './resources/internal';

export class FraudProtection {
  private static instance: FraudProtection;

  private inflightException: Promise<unknown> | null = null;

  public static getInstance(client: typeof Client, CaptchaChallengeImpl: typeof CaptchaChallenge): FraudProtection {
    if (!FraudProtection.instance) {
      FraudProtection.instance = new FraudProtection(client, CaptchaChallengeImpl);
    }
    return FraudProtection.instance;
  }

  constructor(
    private client: typeof Client,
    private CaptchaChallengeImpl: typeof CaptchaChallenge,
  ) {}

  public async execute<T extends () => Promise<any>, R = Awaited<ReturnType<T>>>(clerk: Clerk, cb: T): Promise<R> {
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

      const captchaParams = await this.managedChallenge(clerk);

      try {
        await this.client.getInstance().sendCaptchaToken(captchaParams);
      } finally {
        // Resolve the exception placeholder promise so that other exceptions can be handled
        resolve();
        this.inflightException = null;
      }

      return await cb();
    }
  }

  public managedChallenge(clerk: Clerk) {
    return new this.CaptchaChallengeImpl(clerk).managed();
  }
}
