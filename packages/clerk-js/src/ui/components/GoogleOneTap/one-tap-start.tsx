import { useClerk, useUser } from '@clerk/shared/react';
import { useEffect, useRef } from 'react';

import { withCardStateProvider } from '@/ui/elements/contexts';

import { clerkUnsupportedEnvironmentWarning } from '../../../core/errors';
import type { GISCredentialResponse, PromptMomentNotification } from '../../../utils/one-tap';
import { loadGIS } from '../../../utils/one-tap';
import { useEnvironment, useGoogleOneTapContext } from '../../contexts';
import { useFetch } from '../../hooks';
import { useRouter } from '../../router';

/**
 * Checks if the Google One Tap prompt was skipped by the user.
 * Uses FedCM-compatible methods with fallback to legacy methods for backward compatibility.
 *
 * Per FedCM migration guide, isSkippedMoment() continues to work with FedCM,
 * while getMomentType() may be removed in future Chrome versions.
 *
 * @see https://developers.google.com/identity/gsi/web/guides/fedcm-migration
 */
export function isPromptSkipped(notification: PromptMomentNotification): boolean {
  // Prioritize FedCM-compatible method
  if ('isSkippedMoment' in notification) {
    return notification.isSkippedMoment?.() ?? false;
  }

  // Fallback to legacy method only if FedCM method doesn't exist
  // TODO: Temporarily commented out to test if this triggers the GSI_LOGGER warning
  // if ('getMomentType' in notification) {
  //   return notification.getMomentType?.() === 'skipped';
  // }

  return false;
}

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

    console.log('[Clerk Debug] Initializing Google One Tap with fedCmSupport:', ctx.fedCmSupport);

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
        if (isPromptSkipped(notification)) {
          // Close the modal when the user clicks outside the prompt or cancels
          // Unmounts the component will cause the useEffect cleanup function from below to be called
          clerk.closeGoogleOneTap();
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
