import { CAPTCHA_ELEMENT_ID } from '@clerk/shared/internal/clerk-js/constants';
import { loadScript } from '@clerk/shared/loadScript';

import { cleanupCaptchaContainer, resolveCaptchaContainer } from './containerResolver';
import type { CaptchaOptions } from './types';

// We use the explicit render mode so we control when the widget mounts.
// Prosopo docs: https://docs.prosopo.io/en/js/api-reference/javascript-api-reference.html
const PROSOPO_BUNDLE_URL = 'https://js.prosopo.io/js/procaptcha.bundle.js?render=explicit';

// Reserve space for the rendered smart widget to avoid layout shift; matches Procaptcha's frictionless widget height.
const PROSOPO_SMART_MIN_HEIGHT = '78px';

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
      'Clerk: Failed to load the CAPTCHA script from Prosopo (js.prosopo.io). If you see a CSP error in your browser, ensure your `script-src`, `connect-src`, and `frame-src` directives include `https://*.prosopo.io`. See https://docs.prosopo.io/en/integrations/csp.html for the full list of Prosopo CSP directives, and https://clerk.com/docs/security/clerk-csp for Clerk-side guidance.',
    );
    throw err;
  }
}

function narrowTheme(theme: string | undefined): ProcaptchaTheme | undefined {
  return theme === 'dark' || theme === 'light' ? theme : undefined;
}

/*
 * Mirrors getTurnstileToken via the shared container resolver: renders an invisible Procaptcha
 * widget by default, or a smart widget inside the consumer-provided #clerk-captcha element when
 * present. Note that Procaptcha's render() takes an Element rather than a selector — we resolve
 * the Element here.
 */
export const getProcaptchaToken = async (opts: CaptchaOptions) => {
  const { closeModal } = opts;
  const captcha = await loadProcaptcha(opts.nonce);

  const resolved = await resolveCaptchaContainer(opts);
  const { containerSelector, containerType, effectiveSiteKey, captchaWidgetType, attributes } = resolved;
  const captchaTheme = narrowTheme(attributes.theme);
  const captchaLanguage = attributes.language;

  // Reserve space for the smart widget; Procaptcha shows its widget from the start so we cannot
  // hide it the way Turnstile does with maxHeight=0.
  if (containerType === 'smart') {
    const visibleDiv = document.getElementById(CAPTCHA_ELEMENT_ID);
    if (visibleDiv) {
      visibleDiv.style.minHeight = PROSOPO_SMART_MIN_HEIGHT;
      visibleDiv.style.marginBottom = '1.5rem';
    }
  }

  let captchaToken = '';

  const handleCaptchaTokenGeneration = async (): Promise<string> => {
    const containerEl = document.querySelector(containerSelector);
    if (!containerEl) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw 'captcha_container_missing';
    }

    return new Promise<string>((resolve, reject) => {
      const renderOptions: ProcaptchaRenderOptions = {
        siteKey: effectiveSiteKey,
        theme: captchaTheme,
        language: captchaLanguage,
        callback: (token: string) => {
          closeModal?.();
          resolve(token);
        },
        'error-callback': () => {
          // Procaptcha's error-callback signature does not include an error code; emit a stable
          // identifier so callers can branch on it.
          reject('procaptcha_error');
        },
        'expired-callback': () => {
          reject('procaptcha_expired');
        },
      };

      if (containerType === 'invisible') {
        renderOptions.size = 'invisible';
      }

      Promise.resolve(captcha.render(containerEl, renderOptions))
        .then(() => {
          // Invisible widgets do not auto-challenge — execute() dispatches the event the bundle's
          // invisible component is listening for once it has mounted.
          if (containerType === 'invisible') {
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
    // The bundle's reset() unmounts every Procaptcha root it has registered, including ours.
    try {
      captcha.reset();
    } catch {
      // best-effort cleanup
    }
    // Revert smart-flow style mutations before delegating to the shared cleanup.
    if (containerType === 'smart') {
      const visibleWidget = document.getElementById(CAPTCHA_ELEMENT_ID);
      if (visibleWidget) {
        visibleWidget.style.minHeight = 'unset';
        visibleWidget.style.marginBottom = 'unset';
      }
    }
    cleanupCaptchaContainer(containerType, opts);
  }

  return { captchaToken, captchaWidgetType };
};
