import { createWorkerTimers } from '@clerk/shared/workerTimers';

import { CaptchaChallenge } from '../../utils/captcha/CaptchaChallenge';
import type { Clerk } from '../resources/internal';

export class CaptchaHeartbeat {
  constructor(
    private clerk: Clerk,
    private captchaChallenge = new CaptchaChallenge(clerk),
    private timers = createWorkerTimers(),
  ) {}

  public async start() {
    if (!this.isEnabled()) {
      return;
    }

    await this.sendCaptchaToken();
    this.timers.setInterval(() => {
      void this.sendCaptchaToken();
    }, this.intervalInMs());
  }

  private async sendCaptchaToken() {
    if (!this.clerk.client) {
      return;
    }

    try {
      const params = await this.captchaChallenge.invisible();
      await this.clerk.client.sendCaptchaToken(params);
    } catch (e) {
      // Ignore unhandled errors
    }
  }

  private isEnabled() {
    return !!this.clerk.__unstable__environment?.displayConfig.captchaHeartbeat;
  }

  private intervalInMs() {
    const envInterval = this.clerk.__unstable__environment?.displayConfig.captchaHeartbeatIntervalMs;
    return envInterval === undefined ? 10 * 60 * 1000 : envInterval;
  }
}
