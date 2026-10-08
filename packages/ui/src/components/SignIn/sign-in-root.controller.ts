import type { SignUpCtx } from '../../types';
import { normalizeRoutingOptions } from '../../utils/normalizeRoutingOptions';
import type { useSignInRootModel } from './sign-in-root.model';

export const useSignInRootController = (model: ReturnType<typeof useSignInRootModel>) => {
  const ctx = model.signInContext;
  const signUpContext = {
    componentName: 'SignUp',
    emailLinkRedirectUrl: ctx.emailLinkRedirectUrl,
    ssoCallbackUrl: ctx.ssoCallbackUrl,
    oidcPrompt: ctx.oidcPrompt,
    forceRedirectUrl: ctx.signUpForceRedirectUrl,
    fallbackRedirectUrl: ctx.signUpFallbackRedirectUrl,
    signInUrl: ctx.signInUrl,
    unsafeMetadata: ctx.unsafeMetadata,
    ...normalizeRoutingOptions({ routing: ctx?.routing, path: ctx?.path }),
  } as SignUpCtx;

  return { signUpContext };
};
