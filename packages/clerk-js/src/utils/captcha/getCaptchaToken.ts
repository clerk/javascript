import { getHCaptchaToken } from './hcaptcha';
import { getTurnstileToken } from './turnstile';
import type { CaptchaOptions } from './types';

/*
 * This is a temporary solution to test different captcha providers, until we decide on a single one.
 */
export const getCaptchaToken = (opts: CaptchaOptions) => {
  if (opts.captchaProvider === 'hcaptcha') {
    return getHCaptchaToken(opts);
  } else {
    return getTurnstileToken(opts);
  }
};
