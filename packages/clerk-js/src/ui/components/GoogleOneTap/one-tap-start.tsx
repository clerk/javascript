import { useClerk, useUser } from '@clerk/shared/react';
import { useEffect, useRef } from 'react';

import type { GISCredentialResponse } from '../../../utils/one-tap';
import { loadGIS } from '../../../utils/one-tap';
import { useEnvironment, useGoogleOneTapContext } from '../../contexts';
import { withCardStateProvider } from '../../elements';
import { useFetch } from '../../hooks';
import { useRouter } from '../../router';

function _OneTapStart(): JSX.Element | null {
  const clerk = useClerk();
  const { user } = useUser();
  const environment = useEnvironment();
  const isPromptedRef = useRef(false);
  const { navigate } = useRouter();

  const ctx = useGoogleOneTapContext();
  const { signInUrl, signUpUrl, continueSignUpUrl, secondFactorUrl, firstFactorUrl } = ctx;

  async function oneTapCallback(response: GISCredentialResponse) {
    isPromptedRef.current = false;
    try {
      const res = await clerk.__experimental_authenticateWithGoogleOneTap({
        token: response.credential,
      });
      await clerk.__experimental__handleGoogleOneTapCallback(
        res,
        {
          signInUrl,
          signUpUrl,
          continueSignUpUrl,
          secondFactorUrl,
          firstFactorUrl,
        },
        navigate,
      );
    } catch (e) {
      console.error(e);
    }
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
