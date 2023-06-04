import { loadScript } from '@clerk/shared';

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

const WIDGET_CLASSNAME = 'clerk-captcha';

export async function loadCaptcha(url: string) {
  if (!window.turnstile) {
    await loadScript(url, { defer: true });
  }
  return window.turnstile;
}
export const getCaptchaToken = async (captchaOptions: { siteKey: string; scriptUrl: string }) => {
  const { siteKey: sitekey, scriptUrl } = captchaOptions;
  let captchaToken = '';

  const div = document.createElement('div');
  div.classList.add(WIDGET_CLASSNAME);
  document.body.appendChild(div);
  const captcha = await loadCaptcha(scriptUrl);

  const handleCaptchaTokenGeneration = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      return captcha.execute(`.${WIDGET_CLASSNAME}`, {
        sitekey,
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
