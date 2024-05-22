import type { CaptchaProvider, CaptchaWidgetType } from '@clerk/types';

import { getHCaptchaToken } from './hcaptcha';
import { getTunstileToken } from './turnstile';

type CaptchaOptions = {
  siteKey: string;
  scriptUrl: string;
  widgetType: CaptchaWidgetType;
  invisibleSiteKey: string;
  captchaProvider: CaptchaProvider;
};

export const getCaptchaToken = async (captchaOptions: CaptchaOptions) => {
  const { captchaProvider, widgetType, invisibleSiteKey, siteKey, scriptUrl } = captchaOptions;
  if (captchaProvider === 'hcaptcha') {
    return await getHCaptchaToken({ siteKey, scriptUrl });
  } else {
    return await getTunstileToken({
      siteKey,
      scriptUrl,
      widgetType,
      invisibleSiteKey,
    });
  }
};
