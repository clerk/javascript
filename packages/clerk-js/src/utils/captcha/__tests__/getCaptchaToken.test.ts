import { afterEach, describe, expect, it, vi } from 'vitest';

import { getCaptchaToken } from '../getCaptchaToken';

vi.mock('../turnstile', () => ({
  getTurnstileToken: vi.fn(async () => ({ captchaToken: 'turnstile_token', captchaWidgetType: 'invisible' })),
}));
vi.mock('../prosopo', () => ({
  getProcaptchaToken: vi.fn(async () => ({ captchaToken: 'procaptcha_token', captchaWidgetType: 'invisible' })),
}));

import { getProcaptchaToken } from '../prosopo';
import { getTurnstileToken } from '../turnstile';

describe('getCaptchaToken provider routing', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('routes to Procaptcha when captchaProvider is "prosopo"', async () => {
    const result = await getCaptchaToken({
      captchaProvider: 'prosopo',
      siteKey: 'visible',
      invisibleSiteKey: 'invisible',
      widgetType: 'invisible',
    });

    expect(getProcaptchaToken).toHaveBeenCalledTimes(1);
    expect(getTurnstileToken).not.toHaveBeenCalled();
    expect(result).toEqual({ captchaToken: 'procaptcha_token', captchaWidgetType: 'invisible' });
  });

  it('routes to Turnstile when captchaProvider is "turnstile"', async () => {
    const result = await getCaptchaToken({
      captchaProvider: 'turnstile',
      siteKey: 'visible',
      invisibleSiteKey: 'invisible',
      widgetType: 'invisible',
    });

    expect(getTurnstileToken).toHaveBeenCalledTimes(1);
    expect(getProcaptchaToken).not.toHaveBeenCalled();
    expect(result).toEqual({ captchaToken: 'turnstile_token', captchaWidgetType: 'invisible' });
  });
});
