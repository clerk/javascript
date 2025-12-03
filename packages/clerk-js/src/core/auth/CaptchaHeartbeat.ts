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
    if (!this.clerk.client || this.clientBypass()) {
      return;
    }

    try {
      const params = await this.captchaChallenge.invisible({ action: 'heartbeat' });
      await this.clerk.client.__internal_sendCaptchaToken(params);
    } catch {
      // Ignore unhandled errors
    }
  }

  private isEnabled() {
    return !!this.clerk.__internal__environment?.displayConfig?.captchaHeartbeat;
  }

  private clientBypass() {
    return this.clerk.client?.captchaBypass;
  }

  private intervalInMs() {
    return this.clerk.__internal__environment?.displayConfig?.captchaHeartbeatIntervalMs ?? 10 * 60 * 1000;
  }
}
