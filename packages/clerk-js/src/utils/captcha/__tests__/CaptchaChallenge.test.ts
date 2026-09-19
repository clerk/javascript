import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../getCaptchaToken', () => ({
  getCaptchaToken: vi.fn(async () => ({ captchaToken: 'mock_token', captchaWidgetType: 'invisible' })),
}));

import { CaptchaChallenge } from '../CaptchaChallenge';
import { getCaptchaToken } from '../getCaptchaToken';

const makeClerk = (provider: 'turnstile' | 'prosopo') =>
  ({
    isStandardBrowser: true,
    __internal_environment: {
      displayConfig: {
        captchaProvider: provider,
        captchaPublicKey: 'visible-key',
        captchaPublicKeyInvisible: 'invisible-key',
        captchaWidgetType: 'smart' as const,
      },
      userSettings: { signUp: { captcha_enabled: true } },
    },
    __internal_getOption: () => undefined,
  }) as any;

describe('CaptchaChallenge propagates displayConfig.captchaProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('invisible() forwards "prosopo" when configured', async () => {
    const challenge = new CaptchaChallenge(makeClerk('prosopo'));

    await challenge.invisible();

    expect(getCaptchaToken).toHaveBeenCalledTimes(1);
    expect((getCaptchaToken as any).mock.calls[0][0]).toMatchObject({ captchaProvider: 'prosopo' });
  });

  it('invisible() forwards "turnstile" when configured (default)', async () => {
    const challenge = new CaptchaChallenge(makeClerk('turnstile'));

    await challenge.invisible();

    expect(getCaptchaToken).toHaveBeenCalledTimes(1);
    expect((getCaptchaToken as any).mock.calls[0][0]).toMatchObject({ captchaProvider: 'turnstile' });
  });

  it('managedOrInvisible() forwards the configured provider', async () => {
    const challenge = new CaptchaChallenge(makeClerk('prosopo'));

    await challenge.managedOrInvisible({ action: 'verify' });

    expect(getCaptchaToken).toHaveBeenCalledTimes(1);
    expect((getCaptchaToken as any).mock.calls[0][0]).toMatchObject({ captchaProvider: 'prosopo' });
  });
});
