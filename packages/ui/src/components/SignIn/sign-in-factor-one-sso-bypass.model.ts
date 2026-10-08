import { useCoreSignIn, useSignInContext } from '../../contexts';
import { useRouter } from '../../router';
import { isProtectCheckRequiredError, navigateOnSignInProtectGate } from './handleProtectCheck';
import { hasMultipleEnterpriseConnections } from './shared';

export function useSignInFactorOneSSOBypassModel() {
  const ctx = useSignInContext();
  const signIn = useCoreSignIn();
  const { navigate } = useRouter();
  const factors = signIn.supportedFirstFactors;
  const hasMultipleConnections = hasMultipleEnterpriseConnections(factors);

  const authenticate = async (enterpriseConnectionId?: string) => {
    try {
      await signIn.authenticateWithRedirect({
        strategy: 'enterprise_sso',
        redirectUrl: ctx.ssoCallbackUrl,
        redirectUrlComplete: ctx.afterSignInUrl || '/',
        oidcPrompt: ctx.oidcPrompt,
        continueSignIn: true,
        ...(enterpriseConnectionId && { enterpriseConnectionId }),
      });
    } catch (error) {
      // Preparing the hand-off can itself raise a challenge. No redirect was issued and the sign-in
      // is sitting on the gate instead: run the challenge rather than showing it as an error.
      if (isProtectCheckRequiredError(error) && navigateOnSignInProtectGate(signIn, navigate, '../protect-check')) {
        return;
      }
      throw error;
    }
  };

  return {
    authenticate,
    hasMultipleConnections,
    enterpriseConnections: hasMultipleConnections
      ? factors.map(factor => ({
          id: factor.enterpriseConnectionId,
          name: factor.enterpriseConnectionName,
          logoPublicUrl: factor.enterpriseConnectionLogoPublicUrl,
          provider: factor.enterpriseConnectionProvider,
        }))
      : [],
  };
}
