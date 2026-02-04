import { waitForElement } from '@clerk/shared/dom';
import { loadScript } from '@clerk/shared/loadScript';
import type { CaptchaAppearanceOptions, CaptchaWidgetType } from '@clerk/shared/types';

import { debugLogger } from '@/utils/debug';

import { CAPTCHA_ELEMENT_ID, CAPTCHA_INVISIBLE_CLASSNAME } from './constants';
import type { CaptchaOptions } from './types';

// We use the explicit render mode to be able to control when the widget is rendered.
// CF docs: https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/#disable-implicit-rendering
const CLOUDFLARE_TURNSTILE_ORIGINAL_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

type CaptchaAttributes = {
  theme?: CaptchaAppearanceOptions['theme'];
  language?: CaptchaAppearanceOptions['language'];
  size: CaptchaAppearanceOptions['size'];
};

declare global {
  export interface Window {
    turnstile: Turnstile.Turnstile;
  }
}

export const shouldRetryTurnstileErrorCode = (errorCode: string) => {
  const codesWithRetries = ['crashed', 'undefined_error', '102', '103', '104', '106', '110600', '300', '600'];
  return !!codesWithRetries.find(w => errorCode.startsWith(w));
};

async function loadCaptcha(nonce?: string) {
  if (!window.turnstile) {
    await loadCaptchaFromCloudflareURL(nonce).catch(() => {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw { captchaError: 'captcha_script_failed_to_load' };
    });
  }
  return window.turnstile;
}

async function loadCaptchaFromCloudflareURL(nonce?: string) {
  try {
    if (__BUILD_DISABLE_RHC__) {
      return Promise.reject(new Error('Captcha not supported in this environment'));
    }

    return await loadScript(CLOUDFLARE_TURNSTILE_ORIGINAL_URL, { defer: true, nonce });
  } catch (err) {
    console.warn(
      'Clerk: Failed to load the CAPTCHA script from Cloudflare. If you see a CSP error in your browser, please add the necessary CSP rules to your app. Visit https://clerk.com/docs/security/clerk-csp for more information.',
    );
    throw err;
  }
}

function getCaptchaAttibutesFromElemenet(element: HTMLElement): CaptchaAttributes {
  try {
    const theme = (element.getAttribute('data-cl-theme') as CaptchaAppearanceOptions['theme']) || undefined;
    const language = (element.getAttribute('data-cl-language') as CaptchaAppearanceOptions['language']) || undefined;
    const size = (element.getAttribute('data-cl-size') as CaptchaAppearanceOptions['size']) || undefined;

    return { theme, language, size };
  } catch {
    return { theme: undefined, language: undefined, size: undefined };
  }
}

/*
 * How this function works:
 * The widgetType is either 'invisible' or 'smart'.
 * - If the widgetType is 'invisible', the captcha widget is rendered in a hidden div at the bottom of the body.
 * - If the widgetType is 'smart', the captcha widget is rendered in a div with the id 'clerk-captcha'. If the div does
 *  not exist, the invisibleSiteKey is used as a fallback and the widget is rendered in a hidden div at the bottom of the body.
 */
export const getTurnstileToken = async (opts: CaptchaOptions) => {
  const { siteKey, widgetType, invisibleSiteKey, nonce } = opts;
  const { modalContainerQuerySelector, modalWrapperQuerySelector, closeModal, openModal } = opts;
  const captcha: Turnstile.Turnstile = await loadCaptcha(nonce);

  // Error codes array - used for actual error handling (unchanged from original behavior)
  const errorCodes: (string | number)[] = [];

  // Diagnostic tracking - wrapped in try-catch to never affect production behavior
  let startTime = 0;
  let errorTimeline: Array<{ code: string | number; t: number }> = [];
  let captchaAttemptId = '';
  try {
    startTime = Date.now();
    captchaAttemptId =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2, 9);
  } catch {
    // Silently ignore - diagnostics should never break captcha flow
  }

  let captchaToken = '';
  let id = '';
  let turnstileSiteKey = siteKey;
  let captchaTheme: CaptchaAppearanceOptions['theme'];
  let captchaSize: CaptchaAppearanceOptions['size'];
  let captchaLanguage: CaptchaAppearanceOptions['language'];
  let retries = 0;
  let widgetContainerQuerySelector: string | undefined;
  // The backend uses this to determine which Turnstile site-key was used in order to verify the token
  let captchaWidgetType: CaptchaWidgetType = null;
  let captchaTypeUsed: 'invisible' | 'modal' | 'smart' = 'invisible';

  // modal
  if (modalContainerQuerySelector && modalWrapperQuerySelector) {
    // if invisible is selected but modal is provided,
    // we're going to render the invisible widget in the modal
    // but we won't show the modal as it will never escalate to interactive mode
    captchaWidgetType = widgetType;
    widgetContainerQuerySelector = modalContainerQuerySelector;
    captchaTypeUsed = 'modal';
    try {
      await openModal?.();
    } catch {
      // When a client is captcha_block the first attempt to open the modal will fail with 'ClerkJS components are not ready yet.'
      // This happens consistently in the first attempt, because in clerk.#loadInStandardBrowser we first await for the `/client` response
      // and then we run initComponents to initialize the components.
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw { captchaError: 'modal_component_not_ready' };
    }
    const modalContainderEl = await waitForElement(modalContainerQuerySelector);
    if (modalContainderEl) {
      const { theme, language, size } = getCaptchaAttibutesFromElemenet(modalContainderEl);
      captchaTheme = theme;
      captchaLanguage = language;
      captchaSize = size;
    }
  }

  // smart widget with container provided by user
  if (!widgetContainerQuerySelector && widgetType === 'smart') {
    const visibleDiv = document.getElementById(CAPTCHA_ELEMENT_ID);
    if (visibleDiv) {
      captchaTypeUsed = 'smart';
      captchaWidgetType = 'smart';
      widgetContainerQuerySelector = `#${CAPTCHA_ELEMENT_ID}`;
      visibleDiv.style.maxHeight = '0'; // This is to prevent the layout shift when the render method is called
      const { theme, language, size } = getCaptchaAttibutesFromElemenet(visibleDiv);
      captchaTheme = theme;
      captchaLanguage = language;
      captchaSize = size;
    } else {
      console.error(
        'Cannot initialize Smart CAPTCHA widget because the `clerk-captcha` DOM element was not found; falling back to Invisible CAPTCHA widget. If you are using a custom flow, visit https://clerk.com/docs/guides/development/custom-flows/bot-sign-up-protection for instructions',
      );
    }
  }

  // invisible widget for which we create the container automatically
  if (!widgetContainerQuerySelector) {
    captchaTypeUsed = 'invisible';
    turnstileSiteKey = invisibleSiteKey;
    captchaWidgetType = 'invisible';
    widgetContainerQuerySelector = `.${CAPTCHA_INVISIBLE_CLASSNAME}`;
    const div = document.createElement('div');
    div.classList.add(CAPTCHA_INVISIBLE_CLASSNAME);
    div.style.display = 'none'; // This is to prevent the layout shift when the render method is called
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
            resolve([token, id as string]);
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
            // Track error for actual error handling (original behavior)
            errorCodes.push(errorCode);
            // Track timing for diagnostics only
            try {
              errorTimeline.push({ code: errorCode, t: Date.now() - startTime });
            } catch {
              // Silently ignore - diagnostics should never break captcha flow
            }
            /**
             * By setting retry to 'never' the responsibility for implementing retrying is ours
             * https://developers.cloudflare.com/turnstile/reference/client-side-errors/#retrying
             */
            if (retries < 2 && shouldRetryTurnstileErrorCode(errorCode.toString())) {
              setTimeout(() => {
                captcha.reset(id as string);
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

    // Log failure with full error history for debugging - wrapped to never affect production
    try {
      const containerExistsAtFailure = widgetContainerQuerySelector
        ? !!document.querySelector(widgetContainerQuerySelector)
        : false;

      debugLogger.error('Turnstile captcha challenge failed', {
        captchaAttemptId,
        errorTimeline,
        lastErrorCode: errorTimeline.length > 0 ? errorTimeline[errorTimeline.length - 1].code : null,
        finalError: String(e),
        retriesAttempted: retries,
        widgetType: captchaTypeUsed,
        containerExistsAtFailure,
        totalDurationMs: Date.now() - startTime,
      }, 'captcha');
    } catch {
      // Silently ignore - diagnostics should never break captcha flow
    }

    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw {
      captchaError: e,
    };
  } finally {
    // cleanup
    if (captchaTypeUsed === 'modal') {
      closeModal?.();
    }
    if (captchaTypeUsed === 'invisible') {
      const invisibleWidget = document.querySelector(`.${CAPTCHA_INVISIBLE_CLASSNAME}`);
      if (invisibleWidget) {
        document.body.removeChild(invisibleWidget);
      }
    }
    if (captchaTypeUsed === 'smart') {
      const visibleWidget = document.getElementById(CAPTCHA_ELEMENT_ID);
      if (visibleWidget) {
        visibleWidget.style.maxHeight = '0';
        visibleWidget.style.minHeight = 'unset';
        visibleWidget.style.marginBottom = 'unset';
      }
    }
  }

  return { captchaToken, captchaWidgetType };
};
