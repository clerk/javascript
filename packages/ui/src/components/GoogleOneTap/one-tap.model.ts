import { clerkUnsupportedEnvironmentWarning } from '@clerk/shared/internal/clerk-js/errors';
import { useClerk, useUser } from '@clerk/shared/react';
import { useRef } from 'react';

import { useEnvironment, useGoogleOneTapContext } from '../../contexts';
import { useFetch } from '../../hooks';
import { useRouter } from '../../router';
import { loadGIS } from '../../utils/one-tap';

export type OneTapModel = {
  userId: string | undefined;
  isReady: boolean;
  setCredentialHandler: (handler: (credential: string) => void) => void;
  prompt: (onSkipped: () => void) => void;
  cancel: () => void;
  authenticateCredential: (credential: string) => Promise<void>;
  close: () => void;
};

export function useOneTapModel(): OneTapModel {
  const clerk = useClerk();
  const { user } = useUser();
  const environment = useEnvironment();
  const context = useGoogleOneTapContext();
  const { navigate } = useRouter();
  const credentialHandler = useRef<(credential: string) => void>();
  const clientId = environment.displayConfig.googleOneTapClientId;

  const initializeGIS = async () => {
    if (!clientId) {
      return undefined;
    }
    if (__BUILD_DISABLE_RHC__) {
      clerkUnsupportedEnvironmentWarning('Google Identity Services');
      return undefined;
    }

    const google = await loadGIS();
    google.accounts.id.initialize({
      client_id: clientId,
      callback: response => credentialHandler.current?.(response.credential),
      itp_support: context.itpSupport,
      cancel_on_tap_outside: context.cancelOnTapOutside,
      auto_select: false,
      use_fedcm_for_prompt: context.fedCmSupport,
    });
    return google;
  };

  const { data: initializedGoogle } = useFetch(
    !user?.id && clientId ? initializeGIS : undefined,
    'google-identity-services-script',
  );

  return {
    userId: user?.id,
    isReady: Boolean(initializedGoogle),
    setCredentialHandler: handler => {
      credentialHandler.current = handler;
    },
    prompt: onSkipped =>
      initializedGoogle?.accounts.id.prompt(notification => {
        if (notification.getMomentType() === 'skipped') {
          onSkipped();
        }
      }),
    cancel: () => initializedGoogle?.accounts.id.cancel(),
    authenticateCredential: async credential => {
      const response = await clerk.authenticateWithGoogleOneTap({ token: credential });
      await clerk.handleGoogleOneTapCallback(response, context.generateCallbackUrls(window.location.href), navigate);
    },
    close: () => clerk.closeGoogleOneTap(),
  };
}
