import { useClerk, useUser } from '@clerk/shared/react';
import { useEffect, useRef } from 'react';

import { withCardStateProvider } from '@/ui/elements/contexts';

import { clerkUnsupportedEnvironmentWarning } from '../../../core/errors';
import type { GISCredentialResponse } from '../../../utils/one-tap';
import { loadGIS } from '../../../utils/one-tap';
import { useEnvironment, useGoogleOneTapContext } from '../../contexts';
import { useFetch } from '../../hooks';
import { useRouter } from '../../router';

function OneTapStartInternal(): JSX.Element | null {
  const clerk = useClerk();
  const { user } = useUser();
  const environment = useEnvironment();
  const isPromptedRef = useRef(false);
  const { navigate } = useRouter();

  const ctx = useGoogleOneTapContext();

  async function oneTapCallback(response: GISCredentialResponse) {
    isPromptedRef.current = false;
    try {
      const res = await clerk.authenticateWithGoogleOneTap({
        token: response.credential,
      });
      await clerk.handleGoogleOneTapCallback(res, ctx.generateCallbackUrls(window.location.href), navigate);
    } catch (e) {
      console.error(e);
    }
  }

  const environmentClientID = environment.displayConfig.googleOneTapClientId;
  const shouldLoadGIS = !user?.id && !!environmentClientID;

  async function initializeGIS() {
    if (__BUILD_DISABLE_RHC__) {
      clerkUnsupportedEnvironmentWarning('Google Identity Services');
      return undefined;
    }

    const google = await loadGIS();

    google.accounts.id.initialize({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      client_id: environmentClientID!,
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
        // Use isDismissedMoment() which works in both FedCM and legacy modes
        // This avoids deprecation warnings about getMomentType() and isSkippedMoment()
        if ('isDismissedMoment' in notification && typeof notification.isDismissedMoment === 'function') {
          if (notification.isDismissedMoment()) {
            // User dismissed or cancelled the prompt
            clerk.closeGoogleOneTap();
          }
        }
        // Fallback for legacy mode (browsers that don't support FedCM yet)
        else if ('getMomentType' in notification && typeof notification.getMomentType === 'function') {
          const momentType = notification.getMomentType();
          if (momentType === 'skipped' || momentType === 'dismissed') {
            clerk.closeGoogleOneTap();
          }
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

export const OneTapStart = withCardStateProvider(OneTapStartInternal);
