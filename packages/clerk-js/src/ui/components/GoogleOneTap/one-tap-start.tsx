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
  console.log('[Clerk Debug] isPromptSkipped called with notification:', {
    hasIsSkippedMoment: 'isSkippedMoment' in notification,
    hasGetMomentType: 'getMomentType' in notification,
  });

  // Prioritize FedCM-compatible method
  if ('isSkippedMoment' in notification) {
    const result = notification.isSkippedMoment?.() ?? false;
    console.log('[Clerk Debug] Using isSkippedMoment(), result:', result);
    return result;
  }

  // Fallback to legacy method only if FedCM method doesn't exist
  if ('getMomentType' in notification) {
    const result = notification.getMomentType?.() === 'skipped';
    console.log('[Clerk Debug] Using getMomentType() fallback, result:', result);
    return result;
  }

  console.log('[Clerk Debug] No skip detection method available, returning false');
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
    console.log('[Clerk Debug] oneTapCallback called');
    isPromptedRef.current = false;
    try {
      const res = await clerk.authenticateWithGoogleOneTap({
        token: response.credential,
      });
      console.log('[Clerk Debug] Authentication successful');
      await clerk.handleGoogleOneTapCallback(res, ctx.generateCallbackUrls(window.location.href), navigate);
    } catch (e) {
      console.error('[Clerk Debug] Authentication error:', e);
    }
  }

  const environmentClientID = environment.displayConfig.googleOneTapClientId;
  const shouldLoadGIS = !user?.id && !!environmentClientID;

  async function initializeGIS() {
    if (__BUILD_DISABLE_RHC__) {
      clerkUnsupportedEnvironmentWarning('Google Identity Services');
      return undefined;
    }

    console.log('[Clerk Debug] Loading Google Identity Services...');
    const google = await loadGIS();
    console.log('[Clerk Debug] Google Identity Services loaded');

    const useFedCm = ctx.fedCmSupport ?? true;
    console.log('[Clerk Debug] Initializing Google One Tap with:', {
      fedCmSupport: ctx.fedCmSupport,
      use_fedcm_for_prompt: useFedCm,
      itp_support: ctx.itpSupport,
      cancel_on_tap_outside: ctx.cancelOnTapOutside,
    });

    google.accounts.id.initialize({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      client_id: environmentClientID!,
      callback: oneTapCallback,
      itp_support: ctx.itpSupport,
      cancel_on_tap_outside: ctx.cancelOnTapOutside,
      auto_select: false,
      // Default to true if not explicitly set (per the type definition)
      use_fedcm_for_prompt: useFedCm,
    });

    console.log('[Clerk Debug] Google One Tap initialized successfully');
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
      console.log('[Clerk Debug] Showing Google One Tap prompt...');
      initializedGoogle.accounts.id.prompt(notification => {
        console.log('[Clerk Debug] Prompt notification received');
        if (isPromptSkipped(notification)) {
          console.log('[Clerk Debug] Prompt was skipped, closing Google One Tap');
          // Close the modal when the user clicks outside the prompt or cancels
          // Unmounts the component will cause the useEffect cleanup function from below to be called
          clerk.closeGoogleOneTap();
        } else {
          console.log('[Clerk Debug] Prompt was not skipped');
        }
      });
      isPromptedRef.current = true;
    }
  }, [clerk, initializedGoogle, user?.id]);

  // Trigger only on mount/unmount. Above we handle the logic for the initial fetch + initialization
  useEffect(() => {
    return () => {
      if (initializedGoogle && isPromptedRef.current) {
        console.log('[Clerk Debug] Cleanup: Cancelling Google One Tap prompt');
        isPromptedRef.current = false;
        initializedGoogle.accounts.id.cancel();
      }
    };
  }, [initializedGoogle]);

  return null;
}

export const OneTapStart = withCardStateProvider(OneTapStartInternal);
