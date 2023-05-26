import { loadScript } from './script';

interface RenderOptions {
  sitekey: string;
  callback?: (token: string) => void;
  'error-callback'?: (err: any) => void;
}

declare global {
  export interface Window {
    turnstile: { execute: (container?: string | HTMLElement | null, params?: RenderOptions) => void };
  }
}

const SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

export async function loadCaptcha() {
  return new Promise(resolve => {
    resolve(
      loadScript(SCRIPT_URL, {
        defer: true,
        globalObject: window.turnstile,
      }),
    );
  }).then(() => {
    const turnstile = window.turnstile;

    console.log('captcha loaded');
    return turnstile;
  });
}

export const getCaptchaToken = async () => {
  let captchaToken = '' as string | unknown;
  const SITE_KEY = '0x4AAAAAAAFHxLeVBtmN8VhF'; // staging sitekey
  // const SITE_KEY = '1x00000000000000000000AA'; // test sitekey
  const div = document.createElement('div');
  div.classList.add('clerk-captcha');
  document.body.appendChild(div);
  const captcha = await loadCaptcha();

  const handleCaptchaTokenGeneration = () => {
    return new Promise((resolve, reject) => {
      return captcha.execute('.clerk-captcha', {
        sitekey: SITE_KEY,
        callback: function (token: string) {
          resolve(token);
        },
        'error-callback': function (err) {
          reject(err);
          console.log(err);
        },
      });
    });
  };

  captchaToken = await handleCaptchaTokenGeneration();

  if (captchaToken) {
    document.body.removeChild(div);
  }

  return captchaToken;
};
