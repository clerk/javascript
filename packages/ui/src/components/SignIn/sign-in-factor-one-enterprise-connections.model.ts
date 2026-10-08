import { useClerk } from '@clerk/shared/react/index';

import { useSignInContext } from '@/ui/contexts';

import { useRouter } from '../../router';
import { isProtectCheckRequiredError, navigateOnSignInProtectGate } from './handleProtectCheck';
import { hasMultipleEnterpriseConnections } from './shared';

export const useSignInFactorOneEnterpriseConnectionsModel = () => {
  const ctx = useSignInContext();
  const clerk = useClerk();
  const { navigate } = useRouter();
  const signIn = clerk.client.signIn;
  const factors = signIn.supportedFirstFactors;
  const hasEnterpriseConnections = hasMultipleEnterpriseConnections(factors);

  return {
    hasEnterpriseConnections,
    getSignInUrl: () => ctx.signInUrl || clerk.buildSignInUrl(),
    enterpriseConnections: hasEnterpriseConnections
      ? factors.map(ff => ({
          id: ff.enterpriseConnectionId,
          name: ff.enterpriseConnectionName,
          logoPublicUrl: ff.enterpriseConnectionLogoPublicUrl,
          provider: ff.enterpriseConnectionProvider,
        }))
      : [],
    authenticate: async (enterpriseConnectionId: string) => {
      try {
        await signIn.authenticateWithRedirect({
          strategy: 'enterprise_sso',
          redirectUrl: ctx.ssoCallbackUrl,
          redirectUrlComplete: ctx.afterSignInUrl || '/',
          oidcPrompt: ctx.oidcPrompt,
          continueSignIn: true,
          enterpriseConnectionId,
        });
      } catch (err) {
        // Preparing the hand-off can itself raise a challenge. No redirect was issued and the sign-in
        // is sitting on the gate instead. Handled here because the card's click handler drops errors,
        // so without this the user clicks their connection and nothing happens.
        if (isProtectCheckRequiredError(err) && navigateOnSignInProtectGate(signIn, navigate, '../protect-check')) {
          return;
        }
        throw err;
      }
    },
  };
};
