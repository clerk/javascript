import { CaptchaChallenge } from '../utils/captcha/CaptchaChallenge';
import type { Clerk } from './resources/internal';

class FraudProtectionService {
  private inflightRequest: Promise<unknown> | null = null;

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

  public managedChallenge(clerk: Clerk) {
    return new CaptchaChallenge(clerk).managed();
  }
}

export const fraudProtection = new FraudProtectionService();
