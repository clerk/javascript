import { loadScript } from './script';

interface RenderOptions {
  sitekey: string;
  retry: string;
  callback: (token: string) => void;
  'error-callback': (err: any) => void;
}

declare global {
  export interface Window {
    turnstile: { execute: (container?: string | HTMLElement | null, params?: RenderOptions) => void };
  }
}

const SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const WIDGET_CLASSNAME = 'clerk-captcha';

export async function loadCaptcha() {
  return new Promise(resolve => {
    resolve(
      loadScript(SCRIPT_URL, {
        defer: true,
        globalObject: window.turnstile,
      }),
    );
  }).then(() => window.turnstile);
}

export const getCaptchaToken = async (captchaSiteKey: string) => {
  let captchaToken = '';

  const div = document.createElement('div');
  div.classList.add(WIDGET_CLASSNAME);
  document.body.appendChild(div);
  const captcha = await loadCaptcha();

  const handleCaptchaTokenGeneration = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      return captcha.execute(`.${WIDGET_CLASSNAME}`, {
        sitekey: captchaSiteKey,
        retry: 'never',
        callback: function (token: string) {
          resolve(token);
        },
        'error-callback': function (err) {
          reject(err);
        },
      });
    });
  };

  try {
    captchaToken = await handleCaptchaTokenGeneration();
  } catch (e) {
    console.warn(e);
  } finally {
    document.body.removeChild(div);
  }

  return captchaToken;
};
