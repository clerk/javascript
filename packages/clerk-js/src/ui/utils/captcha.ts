import { loadScript } from '../../utils';

interface RenderOptions {
  sitekey: string;
  callback?: (token: string) => void;
}

declare global {
  export interface Window {
    turnstile: { execute: (container?: string | HTMLElement | null, params?: RenderOptions) => void };
  }
}

export const SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

export const loadCaptcha = async () => {
  return new Promise(resolve => {
    resolve(
      loadScript(SCRIPT_URL, {
        defer: true,
        globalObject: window.turnstile,
      }),
    );
  }).then(() => {
    const turnstile = window.turnstile;
    console.log(turnstile, 'turnstile loaded');
    return turnstile;
  });
};
