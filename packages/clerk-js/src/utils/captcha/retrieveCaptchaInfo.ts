import type { Clerk } from '../../core/clerk';

export const retrieveCaptchaInfo = (clerk: Clerk) => {
  const _environment = clerk.__unstable__environment;
  const captchaProvider = _environment ? _environment.displayConfig.captchaProvider : 'turnstile';

  return {
    captchaSiteKey: _environment ? _environment.displayConfig.captchaPublicKey : null,
    captchaWidgetType: _environment ? _environment.displayConfig.captchaWidgetType : null,
    captchaProvider,
    captchaPublicKeyInvisible: _environment ? _environment.displayConfig.captchaPublicKeyInvisible : null,
    canUseCaptcha: _environment ? _environment.userSettings.signUp.captcha_enabled && clerk.isStandardBrowser : null,
  };
};
