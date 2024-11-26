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

    await this.challengeAndSend();
    this.timers.setInterval(() => {
      void this.challengeAndSend();
    }, this.intervalInMs());
  }

  private async challengeAndSend() {
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
    return this.clerk.__unstable__environment?.displayConfig.captchaHeartbeatIntervalMs ?? 10 * 60 * 1000;
  }
}
