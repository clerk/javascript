import { useClerk, useUser } from '@clerk/shared/react';
import { useEffect, useRef } from 'react';

import type { GISCredentialResponse } from '../../../utils/one-tap';
import { loadGIS } from '../../../utils/one-tap';
import { useCoreSignIn, useEnvironment, useGoogleOneTapContext } from '../../contexts';
import { withCardStateProvider } from '../../elements';
import { useFetch } from '../../hooks';

function _OneTapStart(): JSX.Element | null {
  const clerk = useClerk();
  const signIn = useCoreSignIn();
  const { user } = useUser();
  const environment = useEnvironment();
  const isPromptedRef = useRef(false);

  const ctx = useGoogleOneTapContext();

  async function oneTapCallback(response: GISCredentialResponse) {
    await signIn.__experimental_authenticateWithGoogleOneTap({
      token: response.credential,
    });

    await clerk.handleRedirectCallback();
  }

  const environmentClientID = environment.displayConfig.googleOneTapClientId;
  const shouldLoadGIS = !user?.id && !!environmentClientID;

  /**
   * Prevent GIS from initializing multiple times
   */
  useFetch(shouldLoadGIS ? loadGIS : undefined, 'google-identity-services-script', {
    onSuccess(google) {
      google.accounts.id.initialize({
        client_id: environmentClientID!,
        callback: oneTapCallback,
        itp_support: true,
        cancel_on_tap_outside: ctx.cancelOnTapOutside,
        auto_select: false,
        use_fedcm_for_prompt: true,
      });

      google.accounts.id.prompt();
      isPromptedRef.current = true;
    },
  });

  // Trigger only on mount/unmount. Above we handle the logic for the initial fetch + initialization
  useEffect(() => {
    if (window.google && !user?.id && !isPromptedRef.current) {
      window.google.accounts.id.prompt();
      isPromptedRef.current = true;
    }
  }, [user?.id]);

  // Trigger only on mount/unmount. Above we handle the logic for the initial fetch + initialization
  useEffect(() => {
    return () => {
      if (window.google && isPromptedRef.current) {
        isPromptedRef.current = false;
        window.google.accounts.id.cancel();
      }
    };
  }, []);

  return null;
}

export const OneTapStart = withCardStateProvider(_OneTapStart);
