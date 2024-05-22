///<reference types="@hcaptcha/types"/>

import { loadScript } from '@clerk/shared/loadScript';

import { CAPTCHA_ELEMENT_ID } from './constants';

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

export const getHCaptchaToken = async (captchaOptions: { siteKey: string; scriptUrl: string }) => {
  const { siteKey, scriptUrl } = captchaOptions;
  let captchaToken = '',
    id = '';

  let widgetDiv: HTMLElement | null = null;

  const captcha = await loadCaptcha(scriptUrl);
  let retries = 0;
  const errorCodes: (string | number)[] = [];

  const handleCaptchaTokenGeneration = (): Promise<[string, string]> => {
    return new Promise((resolve, reject) => {
      try {
        const visibleDiv = document.getElementById(CAPTCHA_ELEMENT_ID);
        if (visibleDiv) {
          visibleDiv.style.display = 'block';
          widgetDiv = visibleDiv;
        } else {
          reject(['clerk_captcha_element_not_found', undefined]);
        }

        const id = captcha.render(CAPTCHA_ELEMENT_ID, {
          sitekey: siteKey,
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
      (widgetDiv as HTMLElement).style.display = 'none';
    }
  }

  return { captchaToken, captchaWidgetTypeUsed: 'smart' };
};
