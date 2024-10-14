import { loadScript } from '@clerk/shared/loadScript';
import type { CaptchaWidgetType } from '@clerk/types';

import { CAPTCHA_ELEMENT_ID, CAPTCHA_INVISIBLE_CLASSNAME } from './constants';

const CLOUDFLARE_TURNSTILE_ORIGINAL_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js';

interface RenderOptions {
  /**
   * Every widget has a sitekey. This sitekey is associated with the corresponding widget configuration and is created upon the widget creation.
   */
  sitekey: string;
  /**
   * Controls whether the widget should automatically retry to obtain a token if it did not succeed.
   * The default is auto, which will retry automatically. This can be set to never to disable retry upon failure.
   */
  retry?: 'auto' | 'never';
  /**
   * When retry is set to auto, retry-interval controls the time between retry attempts in milliseconds.
   * Value must be a positive integer less than 900000.
   * @default 8000
   */
  'retry-interval'?: number;
  /**
   * Automatically refreshes the token when it expires.
   * Can take auto, manual or never.
   * @default 'auto'
   */
  'refresh-expired'?: 'auto' | 'manual' | 'never';
  /**
   * A JavaScript callback invoked upon success of the challenge.
   * The callback is passed a token that can be validated.
   * @param token string
   */
  callback?: (token: string) => void;
  /**
   * A JavaScript callback invoked when there is an error (e.g. network error or the challenge failed)
   * @param errorCode string
   */
  'error-callback'?: (errorCode: string) => void;
  /**
   * A JavaScript callback invoked when a given client/browser is not supported by the widget.
   */
  'unsupported-callback'?: () => boolean;
  /**
   * Appearance controls when the widget is visible.
   * It can be always (default), execute, or interaction-only.
   * Refer to Appearance Modes for more information:
   * https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/#appearance-modes
   * @default 'always'
   */
  appearance?: 'always' | 'execute' | 'interaction-only';
}

interface Turnstile {
  execute: (container?: string | HTMLElement | null, params?: RenderOptions) => void;
  render: (container?: string | HTMLElement | null, params?: RenderOptions) => string;
  remove: (widgetId: string) => void;
  reset: (widgetId: string) => void;
}

declare global {
  export interface Window {
    turnstile: Turnstile;
  }
}

export const shouldRetryTurnstileErrorCode = (errorCode: string) => {
  const codesWithRetries = ['crashed', 'undefined_error', '102', '103', '104', '106', '110600', '300', '600'];

  return !!codesWithRetries.find(w => errorCode.startsWith(w));
};

async function loadCaptcha(fallbackUrl: string) {
  if (!window.turnstile) {
    await loadCaptchaFromCloudflareURL()
      .catch(() => loadCaptchaFromFAPIProxiedURL(fallbackUrl))
      .catch(() => {
        throw { captchaError: 'captcha_script_failed_to_load' };
      });
  }
  return window.turnstile;
}

async function loadCaptchaFromCloudflareURL() {
  return await loadScript(CLOUDFLARE_TURNSTILE_ORIGINAL_URL, { defer: true });
}

async function loadCaptchaFromFAPIProxiedURL(fallbackUrl: string) {
  try {
    return await loadScript(fallbackUrl, { defer: true });
  } catch (err) {
    // Rethrow with specific message
    console.error('Clerk: Failed to load the CAPTCHA script from the URL: ', fallbackUrl);
    throw err;
  }
}

/*
 * How this function works:
 * The widgetType is either 'invisible' or 'smart'.
 * - If the widgetType is 'invisible', the captcha widget is rendered in a hidden div at the bottom of the body.
 * - If the widgetType is 'smart', the captcha widget is rendered in a div with the id 'clerk-captcha'. If the div does
 *  not exist, the invisibleSiteKey is used as a fallback and the widget is rendered in a hidden div at the bottom of the body.
 */
export const getTunstileToken = async (captchaOptions: {
  siteKey: string;
  scriptUrl: string;
  widgetType: CaptchaWidgetType;
  invisibleSiteKey: string;
}) => {
  const { siteKey, scriptUrl, widgetType, invisibleSiteKey } = captchaOptions;
  let captchaToken = '',
    id = '';
  let isInvisibleWidget = !widgetType || widgetType === 'invisible';
  let turnstileSiteKey = siteKey;

  let widgetDiv: HTMLElement | null = null;

  const createInvisibleDOMElement = () => {
    const div = document.createElement('div');
    div.classList.add(CAPTCHA_INVISIBLE_CLASSNAME);
    document.body.appendChild(div);
    return div;
  };

  const captcha: Turnstile = await loadCaptcha(scriptUrl);
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
            turnstileSiteKey = invisibleSiteKey;
          }
        }

        const id = captcha.render(isInvisibleWidget ? `.${CAPTCHA_INVISIBLE_CLASSNAME}` : `#${CAPTCHA_ELEMENT_ID}`, {
          sitekey: turnstileSiteKey,
          appearance: 'interaction-only',
          retry: 'never',
          'refresh-expired': 'auto',
          callback: function (token: string) {
            resolve([token, id]);
          },
          'error-callback': function (errorCode) {
            errorCodes.push(errorCode);
            /**
             * By setting retry to 'never' the responsibility for implementing retrying is ours
             * https://developers.cloudflare.com/turnstile/reference/client-side-errors/#retrying
             */
            if (retries < 2 && shouldRetryTurnstileErrorCode(errorCode.toString())) {
              setTimeout(() => {
                captcha.reset(id);
                retries++;
              }, 250);
              return;
            }
            reject([errorCodes.join(','), id]);
          },
          'unsupported-callback': function () {
            reject(['This browser is not supported by the CAPTCHA.', id]);
            return true;
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
