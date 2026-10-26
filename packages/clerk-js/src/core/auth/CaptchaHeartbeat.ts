import { createWorkerTimers } from '@clerk/shared/workerTimers';

import { CaptchaChallenge } from '../../utils/captcha/CaptchaChallenge';
import type { Clerk } from '../resources/internal';

export class CaptchaHeartbeat {
  private disposed = false;
  private intervalId: ReturnType<typeof this.timers.setInterval> | null = null;

  constructor(
    private clerk: Clerk,
    private captchaChallenge = new CaptchaChallenge(clerk),
    private timers = createWorkerTimers(),
  ) {}

  public async start() {
    if (this.disposed || !this.isEnabled()) {
      return;
    }

    await this.challengeAndSend();
    if (this.disposed) {
      return;
    }
    this.intervalId = this.timers.setInterval(() => {
      void this.challengeAndSend();
    }, this.intervalInMs());
  }

  public dispose() {
    if (this.disposed) {
      return;
    }
    this.disposed = true;
    if (this.intervalId !== null) {
      this.timers.clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.timers.cleanup();
  }

  private async challengeAndSend() {
    if (this.disposed || !this.clerk.client || this.clientBypass()) {
      return;
    }

    try {
      const params = await this.captchaChallenge.invisible({ action: 'heartbeat' });
      if (!this.disposed) {
        await this.clerk.client.__internal_sendCaptchaToken(params);
      }
    } catch {
      // Ignore unhandled errors
    }
  }

  private isEnabled() {
    return !!this.clerk.__internal_environment?.displayConfig?.captchaHeartbeat;
  }

  private clientBypass() {
    return this.clerk.client?.captchaBypass;
  }

  private intervalInMs() {
    return this.clerk.__internal_environment?.displayConfig?.captchaHeartbeatIntervalMs ?? 10 * 60 * 1000;
  }
}
