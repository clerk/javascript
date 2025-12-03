import type { Clerk } from '../../core/clerk';

export const retrieveCaptchaInfo = (clerk: Clerk) => {
  const _environment = clerk.__internal_environment;
  const captchaProvider = _environment ? _environment.displayConfig.captchaProvider : 'turnstile';

  // Access nonce via internal options - casting to any since nonce is in IsomorphicClerkOptions but not ClerkOptions
  const nonce = (clerk as any).__internal_getOption?.('nonce') as string | undefined;

  return {
    captchaSiteKey: _environment ? _environment.displayConfig.captchaPublicKey : null,
    captchaWidgetType: _environment ? _environment.displayConfig.captchaWidgetType : null,
    captchaProvider,
    captchaPublicKeyInvisible: _environment ? _environment.displayConfig.captchaPublicKeyInvisible : null,
    canUseCaptcha: _environment ? _environment.userSettings.signUp.captcha_enabled && clerk.isStandardBrowser : null,
    nonce: nonce || undefined,
  };
};
