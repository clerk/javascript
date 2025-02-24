import { waitForElement } from '@clerk/shared/dom';
import { loadScript } from '@clerk/shared/loadScript';
import type { CaptchaWidgetType, Layout } from '@clerk/types';

import { CAPTCHA_ELEMENT_ID, CAPTCHA_INVISIBLE_CLASSNAME } from './constants';
import type { CaptchaOptions } from './types';

// We use the explicit render mode to be able to control when the widget is rendered.
// CF docs: https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/#disable-implicit-rendering
const CLOUDFLARE_TURNSTILE_ORIGINAL_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

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
   * A JavaScript callback invoked before the challenge enters interactive mode.
   */
  'before-interactive-callback'?: () => void;
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
  /**
   * The widget theme. Can take the following values: light, dark, auto.
   * The default is auto, which respects the user preference. This can be forced to light or dark by setting the theme accordingly.
   * @default 'auto'
   */
  theme?: Layout['captchaTheme'];
  /**
   * The widget size. Can take the following values: normal, flexible, compact.
   * @default 'normal'
   */
  size?: Layout['captchaSize'];
  /**
   * Language to display, must be either: auto (default) to use the language that the visitor has chosen,
   * or an ISO 639-1 two-letter language code (e.g. en) or language and country code (e.g. en-US).
   * Refer to the list of supported languages for more information.
   * https://developers.cloudflare.com/turnstile/reference/supported-languages
   */
  language?: string;
  /**
   * A custom value that can be used to differentiate widgets under the same sitekey
   * in analytics and which is returned upon validation. This can only contain up to
   * 32 alphanumeric characters including _ and -.
   */
  action?: string;
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

async function loadCaptcha() {
  if (!window.turnstile) {
    await loadCaptchaFromCloudflareURL().catch(() => {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw { captchaError: 'captcha_script_failed_to_load' };
    });
  }
  return window.turnstile;
}

async function loadCaptchaFromCloudflareURL() {
  try {
    if (__BUILD_DISABLE_RHC__) {
      return Promise.reject(new Error('Captcha not supported in this environment'));
    }

    return await loadScript(CLOUDFLARE_TURNSTILE_ORIGINAL_URL, { defer: true });
  } catch (err) {
    console.warn(
      'Clerk: Failed to load the CAPTCHA script from Cloudflare. If you see a CSP error in your browser, please add the necessary CSP rules to your app. Visit https://clerk.com/docs/security/clerk-csp for more information.',
    );
    throw err;
  }
}

function getCaptchaAttibutesFromElemenet(element: HTMLElement) {
  const theme = element.getAttribute('data-cl-theme');
  const language = element.getAttribute('data-cl-language');
  const size = element.getAttribute('data-cl-size');

  return { theme, language, size };
}

/*
 * How this function works:
 * The widgetType is either 'invisible' or 'smart'.
 * - If the widgetType is 'invisible', the captcha widget is rendered in a hidden div at the bottom of the body.
 * - If the widgetType is 'smart', the captcha widget is rendered in a div with the id 'clerk-captcha'. If the div does
 *  not exist, the invisibleSiteKey is used as a fallback and the widget is rendered in a hidden div at the bottom of the body.
 */
export const getTurnstileToken = async (opts: CaptchaOptions) => {
  const { siteKey, widgetType, invisibleSiteKey } = opts;
  const { modalContainerQuerySelector, modalWrapperQuerySelector, closeModal, openModal } = opts;
  const captcha: Turnstile = await loadCaptcha();
  const errorCodes: (string | number)[] = [];

  let captchaToken = '';
  let id = '';
  let turnstileSiteKey = siteKey;
  let captchaTheme: RenderOptions['theme'];
  let captchaSize: RenderOptions['size'];
  let captchaLanguage: RenderOptions['language'];
  let retries = 0;
  let widgetContainerQuerySelector: string | undefined;
  // The backend uses this to determine which Turnstile site-key was used in order to verify the token
  let captchaWidgetType: CaptchaWidgetType = null;

  // modal
  if (modalContainerQuerySelector && modalWrapperQuerySelector) {
    // if invisible is selected but modal is provided,
    // we're going to render the invisible widget in the modal
    // but we won't show the modal as it will never escalate to interactive mode
    captchaWidgetType = widgetType;
    widgetContainerQuerySelector = modalContainerQuerySelector;
    await openModal?.();
    const modalContainderEl = await waitForElement(modalContainerQuerySelector);
    if (modalContainderEl) {
      const { theme, language, size } = getCaptchaAttibutesFromElemenet(modalContainderEl);
      captchaTheme = theme as RenderOptions['theme'];
      captchaLanguage = language as RenderOptions['language'];
      captchaSize = size as RenderOptions['size'];
    }
  }

  // smart widget with container provided by user
  if (!widgetContainerQuerySelector && widgetType === 'smart') {
    const visibleDiv = document.getElementById(CAPTCHA_ELEMENT_ID);
    if (visibleDiv) {
      captchaWidgetType = 'smart';
      widgetContainerQuerySelector = `#${CAPTCHA_ELEMENT_ID}`;
      visibleDiv.style.maxHeight = '0'; // This is to prevent the layout shift when the render method is called
      const { theme, language, size } = getCaptchaAttibutesFromElemenet(visibleDiv);
      captchaTheme = theme as RenderOptions['theme'];
      captchaLanguage = language as RenderOptions['language'];
      captchaSize = size as RenderOptions['size'];
    } else {
      console.error(
        'Cannot initialize Smart CAPTCHA widget because the `clerk-captcha` DOM element was not found; falling back to Invisible CAPTCHA widget. If you are using a custom flow, visit https://clerk.com/docs/custom-flows/bot-sign-up-protection for instructions',
      );
    }
  }

  // invisible widget for which we create the container automatically
  if (!widgetContainerQuerySelector) {
    turnstileSiteKey = invisibleSiteKey;
    captchaWidgetType = 'invisible';
    widgetContainerQuerySelector = `.${CAPTCHA_INVISIBLE_CLASSNAME}`;
    const div = document.createElement('div');
    div.classList.add(CAPTCHA_INVISIBLE_CLASSNAME);
    div.style.maxHeight = '0'; // This is to prevent the layout shift when the render method is called
    document.body.appendChild(div);
  }

  const handleCaptchaTokenGeneration = async (): Promise<[string, string]> => {
    return new Promise((resolve, reject) => {
      try {
        const id = captcha.render(widgetContainerQuerySelector, {
          sitekey: turnstileSiteKey,
          appearance: 'interaction-only',
          theme: captchaTheme || 'auto',
          size: captchaSize || 'normal',
          language: captchaLanguage || 'auto',
          action: opts.action,
          retry: 'never',
          'refresh-expired': 'auto',
          callback: function (token: string) {
            closeModal?.();
            resolve([token, id]);
          },
          'before-interactive-callback': () => {
            if (modalWrapperQuerySelector) {
              const el = document.querySelector(modalWrapperQuerySelector) as HTMLElement;
              el?.style.setProperty('visibility', 'visible');
              el?.style.setProperty('pointer-events', 'all');
            } else {
              const visibleWidget = document.getElementById(CAPTCHA_ELEMENT_ID);
              if (visibleWidget) {
                // We unset the max-height to allow the widget to expand
                visibleWidget.style.maxHeight = 'unset';
                // We set the min-height to the height of the Turnstile widget
                // because the widget initially does a small layout shift
                // and then expands to the correct height
                visibleWidget.style.minHeight = captchaSize === 'compact' ? '140px' : '68px';
                visibleWidget.style.marginBottom = '1.5rem';
              }
            }
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
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw {
      captchaError: e,
    };
  } finally {
    // cleanup
    closeModal?.();
    const invisibleWidget = document.querySelector(`.${CAPTCHA_INVISIBLE_CLASSNAME}`);
    if (invisibleWidget) {
      document.body.removeChild(invisibleWidget);
    }
    const visibleWidget = document.getElementById(CAPTCHA_ELEMENT_ID);
    if (visibleWidget) {
      visibleWidget.style.maxHeight = '0';
      visibleWidget.style.minHeight = 'unset';
      visibleWidget.style.marginBottom = 'unset';
    }
  }

  return { captchaToken, captchaWidgetType };
};
