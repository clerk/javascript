///<reference types="@hcaptcha/types"/>

import { loadScript } from '@clerk/shared/loadScript';

import { CAPTCHA_ELEMENT_ID, CAPTCHA_INVISIBLE_CLASSNAME } from './constants';
import type { CaptchaOptions } from './types';

async function loadCaptcha(url: string) {
  if (!window.hcaptcha) {
    try {
      await loadScript(url, { defer: true });
    } catch {
      // Rethrow with specific message
      console.error('Clerk: Failed to load the CAPTCHA script from the URL: ', url);
      throw {
        captchaError: 'captcha_script_failed_to_load',
      };
    }
  }
  return window.hcaptcha;
}

export const getHCaptchaToken = async (captchaOptions: CaptchaOptions) => {
  const { siteKey, scriptUrl, widgetType, invisibleSiteKey } = captchaOptions;
  let captchaToken = '',
    id = '';
  let isInvisibleWidget = !widgetType || widgetType === 'invisible';
  let hCaptchaSiteKey = siteKey;

  let widgetDiv: HTMLElement | null = null;

  const createInvisibleDOMElement = () => {
    const div = document.createElement('div');
    div.id = CAPTCHA_INVISIBLE_CLASSNAME;
    document.body.appendChild(div);
    return div;
  };

  const captcha: HCaptcha = await loadCaptcha(scriptUrl);
  let retries = 0;
  const errorCodes: (string | number)[] = [];

  const handleCaptchaTokenGeneration = (): Promise<[string, string]> => {
    return new Promise((resolve, reject) => {
      try {
        if (isInvisibleWidget) {
          widgetDiv = createInvisibleDOMElement();
        } else {
          const visibleDiv = document.getElementById(CAPTCHA_ELEMENT_ID);
          if (visibleDiv) {
            visibleDiv.style.display = 'block';
            widgetDiv = visibleDiv;
          } else {
            console.error(
              'Cannot initialize Smart CAPTCHA widget because the `clerk-captcha` DOM element was not found; falling back to Invisible CAPTCHA widget. If you are using a custom flow, visit https://clerk.com/docs/custom-flows/bot-sign-up-protection for instructions',
            );
            widgetDiv = createInvisibleDOMElement();
            isInvisibleWidget = true;
            hCaptchaSiteKey = invisibleSiteKey;
          }
        }

        const id = captcha.render(isInvisibleWidget ? CAPTCHA_INVISIBLE_CLASSNAME : CAPTCHA_ELEMENT_ID, {
          sitekey: hCaptchaSiteKey,
          size: isInvisibleWidget ? 'invisible' : 'normal',
          callback: function (token: string) {
            resolve([token, id]);
          },
          'error-callback': function (errorCode) {
            errorCodes.push(errorCode);
            if (retries < 2) {
              setTimeout(() => {
                captcha.reset(id);
                retries++;
              }, 250);
              return;
            }
            reject([errorCodes.join(','), id]);
          },
        });

        if (isInvisibleWidget) {
          captcha.execute(id);
        }
      } catch (e) {
        /**
         * There is a case the captcha may fail before the challenge has started.
         * In such case the 'error-callback' does not fire.
         * We should mark the promise as rejected.
         */
        reject([e, undefined]);
      }
    });
  };

  try {
    [captchaToken, id] = await handleCaptchaTokenGeneration();
    // After a successful challenge remove it
    captcha.remove(id);
  } catch ([e, id]) {
    if (id) {
      // After a failed challenge remove it
      captcha.remove(id);
    }
    throw {
      captchaError: e,
    };
  } finally {
    if (widgetDiv) {
      if (isInvisibleWidget) {
        document.body.removeChild(widgetDiv as HTMLElement);
      } else {
        (widgetDiv as HTMLElement).style.display = 'none';
      }
    }
  }

  return { captchaToken, captchaWidgetTypeUsed: isInvisibleWidget ? 'invisible' : 'smart' };
};
