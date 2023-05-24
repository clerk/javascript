import { useRef, useState } from 'react';

import { useCoreClerk, useEnvironment } from '../../ui/contexts';
import { loadCaptcha } from '../../ui/utils';

const SITE_KEY = '0x4AAAAAAAFHxLeVBtmN8VhF'; // staging sitekey

export const useCaptchaToken = () => {
  const captchaRef = useRef(null);
  // @ts-ignore
  const { isStandardBrowser } = useCoreClerk();
  const { userSettings, isProduction } = useEnvironment();
  const [captchaToken, setCaptchaToken] = useState('');

  const isCaptchaEnabled = userSettings.signUp.captcha_enabled && isStandardBrowser() && isProduction();

  const handleCaptchaWithCallback = (onCallbackComplete?: any, params?: any) => {
    void loadCaptcha().then(t => {
      t.execute(captchaRef.current, {
        sitekey: SITE_KEY,
        callback: function (token: string) {
          setCaptchaToken(token);
          console.log(`Challenge Success in hook ${token}`);

          if (onCallbackComplete) {
            onCallbackComplete?.(params, token);
          }
        },
      });
    });
  };

  const widgetProps = {
    ref: captchaRef,
    style: { display: 'none' },
  };

  return { isCaptchaEnabled, widgetProps: { ...widgetProps }, handleCaptchaWithCallback, captchaToken };
};
