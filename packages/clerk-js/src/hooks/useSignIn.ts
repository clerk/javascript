import { useCallback, useEffect } from 'react';

import { useSignInStore } from '../store/signInStore';
import { useCoreSignIn } from '../ui/contexts/CoreClientContext';

export function useSignIn() {
  // Get the existing SignIn instance from client context
  const signInInstance = useCoreSignIn();

  // Get reactive state from store
  const status = useSignInStore(state => state.status);
  const error = useSignInStore(state => state.error);
  const setStore = useSignInStore(state => state.set);

  // Initialize store with SignIn instance state
  useEffect(() => {
    if (signInInstance) {
      setStore({
        status: signInInstance.status,
        identifier: signInInstance.identifier,
        createdSessionId: signInInstance.createdSessionId,
        supportedFirstFactors: signInInstance.supportedFirstFactors,
        supportedSecondFactors: signInInstance.supportedSecondFactors,
      });
    }
  }, [signInInstance, setStore]);

  // Create strategy-specific methods
  const emailCode = useCallback(
    async ({ email }: { email: string }) => {
      try {
        await signInInstance.create({ identifier: email });
        const emailFactor = signInInstance.supportedFirstFactors?.find(f => f.strategy === 'email_code');
        if (emailFactor) {
          await signInInstance.prepareFirstFactor(emailFactor);
        }
        return { error: undefined };
      } catch (err) {
        return { error: err };
      }
    },
    [signInInstance],
  );

  const verify = useCallback(
    async ({ code }: { code: string }) => {
      try {
        await signInInstance.attemptFirstFactor({
          strategy: 'email_code',
          code,
        });
        return { error: undefined };
      } catch (err) {
        return { error: err };
      }
    },
    [signInInstance],
  );

  const oauth = useCallback(
    async ({ provider }: { provider: string }) => {
      try {
        await signInInstance.authenticateWithRedirect({
          strategy: provider as any,
          redirectUrl: window.location.href,
          redirectUrlComplete: window.location.href,
        });
        return { error: undefined };
      } catch (err) {
        return { error: err };
      }
    },
    [signInInstance],
  );

  return {
    status,
    error,
    emailCode,
    verify,
    oauth,
  };
}
