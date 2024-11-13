import { getTurnstileToken } from './turnstile';
import type { CaptchaOptions } from './types';

export const getCaptchaToken = (opts: CaptchaOptions) => {
  if (__BUILD_ENABLE_RHC__) {
    return getTurnstileToken(opts);
  } else {
    throw new Error('Captcha is not supported in this environment');
  }
};
