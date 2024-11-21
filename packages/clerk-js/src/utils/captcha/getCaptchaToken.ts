import { getTurnstileToken } from './turnstile';
import type { CaptchaOptions } from './types';

export const getCaptchaToken = (opts: CaptchaOptions) => getTurnstileToken(opts);
