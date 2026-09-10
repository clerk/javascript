import { CAPTCHA_ELEMENT_ID } from '@clerk/shared/internal/clerk-js/constants';
import { loadScript } from '@clerk/shared/loadScript';

import { cleanupCaptchaContainer, resolveCaptchaContainer } from './containerResolver';
import type { CaptchaOptions } from './types';

// We use the explicit render mode to be able to control when the widget is rendered.
// CF docs: https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/#disable-implicit-rendering
const CLOUDFLARE_TURNSTILE_ORIGINAL_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

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

/*
 * How this function works:
 * The widgetType is either 'invisible' or 'smart'.
 * - If the widgetType is 'invisible', the captcha widget is rendered in a hidden div at the bottom of the body.
 * - If the widgetType is 'smart', the captcha widget is rendered in a div with the id 'clerk-captcha'. If the div does
 *  not exist, the invisibleSiteKey is used as a fallback and the widget is rendered in a hidden div at the bottom of the body.
 */
export const getTurnstileToken = async (opts: CaptchaOptions) => {
  const { modalWrapperQuerySelector, closeModal } = opts;
  const captcha: Turnstile.Turnstile = await loadCaptcha(opts.nonce);
  const errorCodes: (string | number)[] = [];

  let captchaToken = '';
  let id = '';
  let retries = 0;

  const resolved = await resolveCaptchaContainer(opts);
  const { containerSelector, containerType, effectiveSiteKey, captchaWidgetType, attributes } = resolved;
  const { theme: captchaTheme, language: captchaLanguage, size: captchaSize } = attributes;

  // Smart-flow pre-render: hide the consumer's #clerk-captcha until the widget asks to escalate.
  if (containerType === 'smart') {
    const visibleDiv = document.getElementById(CAPTCHA_ELEMENT_ID);
    if (visibleDiv) {
      visibleDiv.style.maxHeight = '0';
    }
  }

  const handleCaptchaTokenGeneration = async (): Promise<[string, string]> => {
    return new Promise((resolve, reject) => {
      try {
        const id = captcha.render(containerSelector, {
          sitekey: effectiveSiteKey,
          appearance: 'interaction-only',
          theme: (captchaTheme as Turnstile.RenderParameters['theme']) || 'auto',
          size: (captchaSize as Turnstile.RenderParameters['size']) || 'normal',
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
                visibleWidget.dataset.clInteractive = 'true';
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
                if (containerSelector && !document.querySelector(containerSelector)) {
                  reject([errorCodes.join(','), id]);
                  return;
                }
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
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw {
      captchaError: e,
    };
  } finally {
    // Revert smart-flow style mutations before delegating to the shared cleanup.
    if (containerType === 'smart') {
      const visibleWidget = document.getElementById(CAPTCHA_ELEMENT_ID);
      if (visibleWidget) {
        delete visibleWidget.dataset.clInteractive;
        visibleWidget.style.maxHeight = '0';
        visibleWidget.style.minHeight = 'unset';
        visibleWidget.style.marginBottom = 'unset';
      }
    }
    cleanupCaptchaContainer(containerType, opts, containerSelector);
  }

  return { captchaToken, captchaWidgetType };
};
