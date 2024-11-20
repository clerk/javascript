import type { Clerk } from '../../core/clerk';
import { createFapiClient } from '../../core/fapiClient';

export const retrieveCaptchaInfo = (clerk: Clerk) => {
  const _environment = clerk.__unstable__environment;
  const fapiClient = createFapiClient(clerk);
  const captchaProvider = _environment ? _environment.displayConfig.captchaProvider : 'turnstile';

  return {
    captchaSiteKey: _environment ? _environment.displayConfig.captchaPublicKey : null,
    captchaWidgetType: _environment ? _environment.displayConfig.captchaWidgetType : null,
    captchaProvider,
    captchaPublicKeyInvisible: _environment ? _environment.displayConfig.captchaPublicKeyInvisible : null,
    canUseCaptcha: _environment
      ? _environment.userSettings.signUp.captcha_enabled &&
        clerk.isStandardBrowser &&
        clerk.instanceType === 'production'
      : null,
    captchaURL: fapiClient
      .buildUrl({
        path: 'cloudflare/turnstile/v0/api.js',
        pathPrefix: '',
        search: '?render=explicit',
      })
      .toString(),
  };
};
