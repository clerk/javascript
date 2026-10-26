import { describe, expect, it, vi } from 'vitest';

import { CaptchaChallenge } from '../../../utils/captcha/CaptchaChallenge';
import { __internal_cleanupForTest, Clerk } from '../../clerk';
import { Environment } from '../../resources/Environment';
import { CaptchaHeartbeat } from '../CaptchaHeartbeat';

describe('CaptchaHeartbeat cleanup', () => {
  it('does not schedule an interval after disposal during start', async () => {
    const clerk = new Clerk('pk_live_Y2xlcmsuYWJjZWYuMTIzNDUucHJvZC5sY2xjbGVyay5jb20k');
    const environment = Environment.getInstance();
    const previous = environment.displayConfig.captchaHeartbeat;
    environment.displayConfig.captchaHeartbeat = true;
    const timers = {
      setTimeout: vi.fn(() => 0),
      setInterval: vi.fn(() => 0),
      clearTimeout: vi.fn(),
      clearInterval: vi.fn(),
      cleanup: vi.fn(),
    };
    const heartbeat = new CaptchaHeartbeat(clerk, new CaptchaChallenge(clerk), timers);
    const started = heartbeat.start();
    heartbeat.dispose();
    await started;
    await heartbeat.start();

    expect(timers.setInterval).not.toHaveBeenCalled();
    expect(timers.cleanup).toHaveBeenCalledOnce();
    environment.displayConfig.captchaHeartbeat = previous;
    __internal_cleanupForTest(clerk);
  });

  it('clears an active heartbeat interval when disposed', async () => {
    vi.useFakeTimers();
    const clerk = new Clerk('pk_live_Y2xlcmsuYWJjZWYuMTIzNDUucHJvZC5sY2xjbGVyay5jb20k');
    const environment = Environment.getInstance();
    const previous = environment.displayConfig.captchaHeartbeat;
    environment.displayConfig.captchaHeartbeat = true;
    const heartbeat = new CaptchaHeartbeat(clerk);
    try {
      await heartbeat.start();
      expect(vi.getTimerCount()).toBe(1);

      heartbeat.dispose();

      expect(vi.getTimerCount()).toBe(0);
    } finally {
      heartbeat.dispose();
      environment.displayConfig.captchaHeartbeat = previous;
      __internal_cleanupForTest(clerk);
      vi.useRealTimers();
    }
  });
});
