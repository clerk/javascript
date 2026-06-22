import { waitForElement } from '@clerk/shared/dom';
import { CAPTCHA_ELEMENT_ID, CAPTCHA_INVISIBLE_CLASSNAME } from '@clerk/shared/internal/clerk-js/constants';
import { loadScript } from '@clerk/shared/loadScript';
import type { CaptchaWidgetType } from '@clerk/shared/types';

import type { CaptchaOptions } from './types';

// We use the explicit render mode so we control when the widget mounts.
// Prosopo docs: https://docs.prosopo.io/en/js/api-reference/javascript-api-reference.html
const PROSOPO_BUNDLE_URL = 'https://js.prosopo.io/js/procaptcha.bundle.js?render=explicit';

type ProcaptchaTheme = 'light' | 'dark';

type ProcaptchaRenderOptions = {
  siteKey: string;
  theme?: ProcaptchaTheme;
  callback?: (token: string) => void;
  'error-callback'?: () => void;
  'expired-callback'?: () => void;
  'close-callback'?: () => void;
  size?: 'invisible';
  language?: string;
};

type ProcaptchaApi = {
  render: (element: Element, options: ProcaptchaRenderOptions) => Promise<void> | void;
  reset: () => void;
  execute: () => void;
  ready: (fn: () => void) => void;
};

declare global {
  export interface Window {
    procaptcha: ProcaptchaApi;
  }
}

async function loadProcaptcha(nonce?: string) {
  if (!window.procaptcha) {
    await loadProcaptchaFromUrl(nonce).catch(() => {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw { captchaError: 'captcha_script_failed_to_load' };
    });
  }
  return window.procaptcha;
}

async function loadProcaptchaFromUrl(nonce?: string) {
  try {
    if (__BUILD_DISABLE_RHC__) {
      return Promise.reject(new Error('Captcha not supported in this environment'));
    }

    return await loadScript(PROSOPO_BUNDLE_URL, { defer: true, nonce });
  } catch (err) {
    console.warn(
      'Clerk: Failed to load the CAPTCHA script from Prosopo. If you see a CSP error in your browser, please add the necessary CSP rules to your app. Visit https://clerk.com/docs/security/clerk-csp for more information.',
    );
    throw err;
  }
}

function getCaptchaAttibutesFromElemenet(element: HTMLElement) {
  try {
    const rawTheme = element.getAttribute('data-cl-theme') || undefined;
    const theme: ProcaptchaTheme | undefined = rawTheme === 'dark' || rawTheme === 'light' ? rawTheme : undefined;
    const language = element.getAttribute('data-cl-language') || undefined;
    return { theme, language };
  } catch {
    return { theme: undefined, language: undefined };
  }
}

/*
 * Mirrors getTurnstileToken: renders an invisible Procaptcha widget by default,
 * or a smart widget inside the user-provided #clerk-captcha container when present.
 */
export const getProcaptchaToken = async (opts: CaptchaOptions) => {
  const { siteKey, widgetType, invisibleSiteKey, nonce } = opts;
  const { modalContainerQuerySelector, modalWrapperQuerySelector, closeModal, openModal } = opts;
  const captcha = await loadProcaptcha(nonce);

  let captchaToken = '';
  let prosopoSiteKey = siteKey;
  let captchaTheme: ProcaptchaTheme | undefined;
  let captchaLanguage: string | undefined;
  let widgetContainerQuerySelector: string | undefined;
  // The backend uses this to determine which site-key was used in order to verify the token
  let captchaWidgetType: CaptchaWidgetType = null;
  let captchaTypeUsed: 'invisible' | 'modal' | 'smart' = 'invisible';

  // modal
  if (modalContainerQuerySelector && modalWrapperQuerySelector) {
    captchaWidgetType = widgetType;
    widgetContainerQuerySelector = modalContainerQuerySelector;
    captchaTypeUsed = 'modal';
    try {
      await openModal?.();
    } catch {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw { captchaError: 'modal_component_not_ready' };
    }
    const modalContainderEl = await waitForElement(modalContainerQuerySelector);
    if (modalContainderEl) {
      const { theme, language } = getCaptchaAttibutesFromElemenet(modalContainderEl);
      captchaTheme = theme;
      captchaLanguage = language;
    }
  }

  // smart widget with container provided by user
  if (!widgetContainerQuerySelector && widgetType === 'smart') {
    const visibleDiv = document.getElementById(CAPTCHA_ELEMENT_ID);
    if (visibleDiv) {
      captchaTypeUsed = 'smart';
      captchaWidgetType = 'smart';
      widgetContainerQuerySelector = `#${CAPTCHA_ELEMENT_ID}`;
      // Procaptcha's smart widget is visible from the start, unlike Turnstile's interaction-only mode.
      // Reserve a reasonable min-height to reduce layout shift while the widget renders.
      visibleDiv.style.minHeight = '78px';
      visibleDiv.style.marginBottom = '1.5rem';
      const { theme, language } = getCaptchaAttibutesFromElemenet(visibleDiv);
      captchaTheme = theme;
      captchaLanguage = language;
    } else {
      console.error(
        'Cannot initialize Smart CAPTCHA widget because the `clerk-captcha` DOM element was not found; falling back to Invisible CAPTCHA widget. If you are using a custom flow, visit https://clerk.com/docs/guides/development/custom-flows/authentication/bot-sign-up-protection for instructions',
      );
    }
  }

  // invisible widget for which we create the container automatically
  if (!widgetContainerQuerySelector) {
    captchaTypeUsed = 'invisible';
    prosopoSiteKey = invisibleSiteKey;
    captchaWidgetType = 'invisible';
    widgetContainerQuerySelector = `.${CAPTCHA_INVISIBLE_CLASSNAME}`;
    const div = document.createElement('div');
    div.classList.add(CAPTCHA_INVISIBLE_CLASSNAME);
    div.style.display = 'none';
    document.body.appendChild(div);
  }

  const handleCaptchaTokenGeneration = async (): Promise<string> => {
    const containerEl = widgetContainerQuerySelector ? document.querySelector(widgetContainerQuerySelector) : null;
    if (!containerEl) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw 'captcha_container_missing';
    }

    return new Promise<string>((resolve, reject) => {
      const renderOptions: ProcaptchaRenderOptions = {
        siteKey: prosopoSiteKey,
        theme: captchaTheme,
        language: captchaLanguage,
        callback: (token: string) => {
          closeModal?.();
          resolve(token);
        },
        'error-callback': () => {
          reject('procaptcha_error');
        },
        'expired-callback': () => {
          reject('procaptcha_expired');
        },
      };

      if (captchaTypeUsed === 'invisible') {
        renderOptions.size = 'invisible';
      }

      Promise.resolve(captcha.render(containerEl, renderOptions))
        .then(() => {
          // Invisible widgets do not auto-challenge — execute() dispatches the event
          // the bundle's invisible component is listening for once it has mounted.
          if (captchaTypeUsed === 'invisible') {
            captcha.execute();
          }
        })
        .catch(e => reject(e));
    });
  };

  try {
    captchaToken = await handleCaptchaTokenGeneration();
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw {
      captchaError: typeof e === 'string' ? e : (e as Error)?.message || 'unexpected_captcha_error',
    };
  } finally {
    // cleanup
    try {
      captcha.reset();
    } catch {
      // best-effort cleanup
    }
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
        visibleWidget.style.minHeight = 'unset';
        visibleWidget.style.marginBottom = 'unset';
      }
    }
  }

  return { captchaToken, captchaWidgetType };
};
