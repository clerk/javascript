import { useClerk, useSafeLayoutEffect } from '@clerk/shared/react';
import type { SignInResource } from '@clerk/shared/types';
import React from 'react';

import { useCoreSignIn } from '../../contexts';

const SET_ACTIVE_POLL_INTERVAL_MS = 50;

type UseSignInStepGuardParams = {
  redirectStatuses: SignInResource['status'][];
  onLeave: () => void;
};

/**
 * This hook calls onLeave when signIn.status is either:
 *   - null on mount
 *   - One of redirectStatuses
 *
 * Additionally, if the status is null on mount, but __internal_setActiveInProgress
 * is true, indicating a setActive is running, it does not call onLeave immediately,
 * instead it starts a timer to poll the status of setActive (since it's not reactive).
 *
 * If setActive was called from this signIn process, it's going to result in a navigate
 * which unmounts this component and cancels the timer. If it was an unrelated setActive,
 * or the setActive fails, which does not lead to this component unmounting, and the
 * status is still null after the setActive finishes, this hook calls onLeave.
 *
 * We need this complexity only because the logic is brittle to begin with, a better fix
 * probably lies in rethinking setActive, but that's for another day.
 */
export function useSignInStepGuard({ redirectStatuses, onLeave }: UseSignInStepGuardParams): void {
  const clerk = useClerk();
  const signIn = useCoreSignIn();
  const status = signIn.status;
  const onLeaveRef = React.useRef(onLeave);
  const redirectStatusesRef = React.useRef(redirectStatuses);

  // We don't want the effects to be reactive to these values, think of this as
  // a hacky useEffectEvent. The reason we use a layout effect over mutating in
  // render is for better concurrency support
  useSafeLayoutEffect(() => {
    onLeaveRef.current = onLeave;
    redirectStatusesRef.current = redirectStatuses;
  });

  React.useEffect(function leaveOnNoSignInStatus() {
    if (status !== null) {
      return;
    }

    // If the component remounts when setActive is in progress, we don't want
    // to leave since that might bounce to the first page briefly before setActive
    // navigates us correctly to post-signin, causing a quick flash of content.
    if (!clerk.__internal_setActiveInProgress) {
      onLeaveRef.current();
      return;
    }

    // If the setActive that was running on mount never finishes in a way that
    // closes the signIn, for example when it's unrelated to the signIn process,
    // or fails, the component could get stuck in a loading state forever.
    // This timer is there to prevent that.
    const intervalId = setInterval(() => {
      if (clerk.__internal_setActiveInProgress) {
        return;
      }

      clearInterval(intervalId);
      // Read directly from clerk to avoid reading stale state
      if (clerk.client.signIn.status === null) {
        onLeaveRef.current();
      }
    }, SET_ACTIVE_POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
    // `null` is also the post-setActive consumed state, so only handle it on mount.
    // This is the reason we have two separate hooks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(
    function leaveOnRedirectStatus() {
      if (redirectStatusesRef.current.includes(status)) {
        onLeaveRef.current();
      }
    },
    [status],
  );
}
