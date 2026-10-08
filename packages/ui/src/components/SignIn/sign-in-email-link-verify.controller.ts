import type { useSignInEmailLinkVerifyModel } from './sign-in-email-link-verify.model';

export const useSignInEmailLinkVerifyController = (model: ReturnType<typeof useSignInEmailLinkVerifyModel>) => ({
  redirectUrlComplete: model.afterSignInUrl,
  redirectUrl: '../factor-two',
});
