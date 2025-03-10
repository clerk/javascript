import type { CaptchaProvider, CaptchaWidgetType } from '@clerk/types';

import { getTunstileToken } from './turnstile';

type CaptchaOptions = {
  siteKey: string;
  scriptUrl: string;
  widgetType: CaptchaWidgetType;
  invisibleSiteKey: string;
  captchaProvider: CaptchaProvider;
};

/*
 * This is a temporary solution to test different captcha providers, until we decide on a single one.
 */
export const getCaptchaToken = (captchaOptions: CaptchaOptions) => {
  const { captchaProvider, ...captchaProviderOptions } = captchaOptions;
  return getTunstileToken(captchaProviderOptions);
};
