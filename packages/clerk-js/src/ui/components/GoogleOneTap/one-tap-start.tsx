import { isClerkAPIResponseError } from '@clerk/shared/error';
import { useClerk, useUser } from '@clerk/shared/react';
import { useEffect } from 'react';

import { clerkInvalidFAPIResponse } from '../../../core/errors';
import type { GISCredentialResponse } from '../../../utils/one-tap';
import { loadGIS } from '../../../utils/one-tap';
import { useCoreSignIn, useCoreSignUp, useEnvironment, useGoogleOneTapContext } from '../../contexts';
import { withCardStateProvider } from '../../elements';
import { useFetch } from '../../hooks';
import { useSupportEmail } from '../../hooks/useSupportEmail';

function _OneTapStart(): JSX.Element | null {
  const clerk = useClerk();
  const signIn = useCoreSignIn();
  const signUp = useCoreSignUp();
  const { user } = useUser();
  const environment = useEnvironment();

  const supportEmail = useSupportEmail();
  const ctx = useGoogleOneTapContext();

  async function oneTapCallback(response: GISCredentialResponse) {
    try {
      const res = await signIn
        .create({
          // TODO-ONETAP: Add new types when feature is ready for public beta
          // @ts-expect-error
          strategy: 'google_one_tap',
          googleOneTapToken: response.credential,
        })
        .catch(err => {
          if (isClerkAPIResponseError(err) && err.errors[0].code === 'external_account_not_found') {
            return signUp.create({
              // TODO-ONETAP: Add new types when feature is ready for public beta
              // @ts-expect-error
              strategy: 'google_one_tap',
              googleOneTapToken: response.credential,
            });
          }
          throw err;
        });

      switch (res.status) {
        case 'complete':
          await clerk.setActive({
            session: res.createdSessionId,
          });
          break;
        // TODO-ONETAP: Add a new case in order to handle the `missing_requirements` status and the PSU flow
        default:
          clerkInvalidFAPIResponse(res.status, supportEmail);
          break;
      }
    } catch (err) {
      /**
       * Currently it is not possible to display an error in the UI.
       * As a fallback we simply open the SignIn modal for the user to sign in.
       */
      clerk.openSignIn();
    }
  }

  const environmentClientID = environment.displayConfig.googleOneTapClientId;
  const shouldLoadGIS = user?.id && environmentClientID;

  /**
   * Prevent GIS from initializing multiple times
   */
  const { data: google } = useFetch(shouldLoadGIS ? undefined : loadGIS, 'google-identity-services-script', {
    onSuccess(google) {
      google.accounts.id.initialize({
        client_id: environmentClientID,
        callback: oneTapCallback,
        itp_support: true,
        cancel_on_tap_outside: ctx.cancelOnTapOutside,
        auto_select: false,
        use_fedcm_for_prompt: true,
      });

      google.accounts.id.prompt();
    },
  });

  useEffect(() => {
    if (google && !user?.id) {
      google.accounts.id.prompt();
    }
    return () => {
      if (google) {
        google.accounts.id.cancel();
      }
    };
  }, [google, user?.id]);

  return null;
}

export const OneTapStart = withCardStateProvider(_OneTapStart);
