import { loadScript } from '@clerk/shared';

import { clerkFailedToLoadThirdPartyScript } from '../core/errors';

interface RenderOptions {
  /**
   * Every widget has a sitekey. This sitekey is associated with the corresponding widget configuration and is created upon the widget creation.
   */
  sitekey: string;
  /**
   * Controls whether the widget should automatically retry to obtain a token if it did not succeed.
   * The default is auto, which will retry automatically. This can be set to never to disable retry upon failure.
   */
  retry: 'auto' | 'never';
  /**
   * When retry is set to auto, retry-interval controls the time between retry attempts in milliseconds.
   * Value must be a positive integer less than 900000.
   * @default 8000
   */
  'retry-interval': number;
  /**
   * Automatically refreshes the token when it expires.
   * Can take auto, manual or never.
   * @default 'auto'
   */
  'refresh-expired': 'auto' | 'manual' | 'never';
  /**
   * A JavaScript callback invoked upon success of the challenge.
   * The callback is passed a token that can be validated.
   * @param token string
   */
  callback: (token: string) => void;
  /**
   * A JavaScript callback invoked when there is an error (e.g. network error or the challenge failed)
   * @param errorCode string
   */
  'error-callback': (errorCode: string) => void;
}

interface Turnstile {
  execute: (container?: string | HTMLElement | null, params?: RenderOptions) => void;
  render: (container?: string | HTMLElement | null, params?: RenderOptions) => string;
  remove: (widgetId: string) => void;
}

declare global {
  export interface Window {
    turnstile: Turnstile;
  }
}

const WIDGET_CLASSNAME = 'clerk-captcha';

export async function loadCaptcha(url: string) {
  if (!window.turnstile) {
    try {
      await loadScript(url, { defer: true });
    } catch (_) {
      // Rethrow with specific message
      clerkFailedToLoadThirdPartyScript();
    }
  }
  return window.turnstile;
}

export const getCaptchaToken = async (captchaOptions: { siteKey: string; scriptUrl: string }) => {
  const { siteKey: sitekey, scriptUrl } = captchaOptions;
  let captchaToken = '',
    id = '';

  const div = document.createElement('div');
  div.classList.add(WIDGET_CLASSNAME);
  document.body.appendChild(div);

  const captcha = await loadCaptcha(scriptUrl);

  const handleCaptchaTokenGeneration = (): Promise<[string, string]> => {
    return new Promise((resolve, reject) => {
      try {
        const id = captcha.render(`.${WIDGET_CLASSNAME}`, {
          sitekey,
          retry: 'auto',
          'retry-interval': 500,
          'refresh-expired': 'auto',
          callback: function (token: string) {
            resolve([token, id]);
          },
          'error-callback': function (errorCode) {
            reject([errorCode, id]);
          },
        });
      } catch (e) {
        /**
         * There is a case the turnstile may fail before the challenge has started.
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
  } finally {
    // After challenge has run remove node element attached
    document.body.removeChild(div);
  }

  return captchaToken;
};
