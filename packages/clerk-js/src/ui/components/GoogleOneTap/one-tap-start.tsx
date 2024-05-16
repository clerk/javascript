import { useUserContext } from '@clerk/shared/react';
import { useEffect, useRef } from 'react';

import type { GISCredentialResponse } from '../../../utils/one-tap';
import { loadGIS } from '../../../utils/one-tap';
import { useCoreClerk, useEnvironment, useGoogleOneTapContext } from '../../contexts';
import { withCardStateProvider } from '../../elements';
import { useFetch } from '../../hooks';
import { useRouter } from '../../router';

function _OneTapStart(): JSX.Element | null {
  const clerk = useCoreClerk();
  const user = useUserContext();
  const environment = useEnvironment();
  const isPromptedRef = useRef(false);
  const { navigate } = useRouter();

  const ctx = useGoogleOneTapContext();
  const {
    signInUrl,
    signUpUrl,
    continueSignUpUrl,
    secondFactorUrl,
    firstFactorUrl,
    signUpForceRedirectUrl,
    signInForceRedirectUrl,
  } = ctx;

  async function oneTapCallback(response: GISCredentialResponse) {
    isPromptedRef.current = false;
    try {
      const res = await clerk.__experimental_authenticateWithGoogleOneTap({
        token: response.credential,
      });
      await clerk.__experimental_handleGoogleOneTapCallback(
        res,
        {
          signInUrl,
          signUpUrl,
          continueSignUpUrl,
          secondFactorUrl,
          firstFactorUrl,
          signUpForceRedirectUrl,
          signInForceRedirectUrl,
        },
        navigate,
      );
    } catch (e) {
      console.error(e);
    }
  }

  const environmentClientID = environment.displayConfig.googleOneTapClientId;
  const shouldLoadGIS = !user?.id && !!environmentClientID;

  async function initializeGIS() {
    const google = await loadGIS();
    google.accounts.id.initialize({
      client_id: environmentClientID,
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      callback: oneTapCallback,
      itp_support: ctx.itpSupport,
      cancel_on_tap_outside: ctx.cancelOnTapOutside,
      auto_select: false,
      use_fedcm_for_prompt: ctx.fedCmSupport,
    });
    return google;
  }

  /**
   * Prevent GIS from initializing multiple times
   */
  const { data: initializedGoogle } = useFetch(
    shouldLoadGIS ? initializeGIS : undefined,
    'google-identity-services-script',
  );

  useEffect(() => {
    if (initializedGoogle && !user?.id && !isPromptedRef.current) {
      initializedGoogle.accounts.id.prompt(notification => {
        // Close the modal, when the user clicks outside the prompt or cancels
        if (notification.getMomentType() === 'skipped') {
          // Unmounts the component will cause the useEffect cleanup function from below to be called
          clerk.__experimental_closeGoogleOneTap();
        }
      });
      isPromptedRef.current = true;
    }
  }, [clerk, initializedGoogle, user?.id]);

  // Trigger only on mount/unmount. Above we handle the logic for the initial fetch + initialization
  useEffect(() => {
    return () => {
      if (initializedGoogle && isPromptedRef.current) {
        isPromptedRef.current = false;
        initializedGoogle.accounts.id.cancel();
      }
    };
  }, [initializedGoogle]);

  return null;
}

export const OneTapStart = withCardStateProvider(_OneTapStart);
