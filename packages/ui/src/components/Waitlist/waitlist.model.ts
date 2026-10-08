import { useClerk, useSafeLayoutEffect, useSession, useUser } from '@clerk/shared/react';
import { useRef } from 'react';

import { useWaitlistContext } from '../../contexts';
import { useRouter } from '../../router';

export type WaitlistModel = {
  requestKey: string;
  canRun: () => boolean;
  initialEmailAddress: string;
  signInHref: string;
  hasAfterJoinWaitlistUrl: boolean;
  join: (emailAddress: string, canContinue?: () => boolean) => Promise<boolean>;
  navigateAfterJoin: (canContinue?: () => boolean) => void;
};

export function useWaitlistModel(): WaitlistModel {
  const clerk = useClerk();
  const { user } = useUser();
  const { session } = useSession();
  const { navigate } = useRouter();
  const latestNavigate = useRef(navigate);
  latestNavigate.current = navigate;
  const { initialValues, signInUrl, afterJoinWaitlistUrl } = useWaitlistContext();
  const initialEmailAddress = initialValues?.emailAddress || '';
  const userId = user?.id;
  const sessionId = session?.id;
  const clientId = clerk.client?.id;
  const identity = JSON.stringify([userId, sessionId, clientId, initialEmailAddress, signInUrl, afterJoinWaitlistUrl]);
  const current = useRef({ identity, clerk, version: 0 });
  if (current.current.identity !== identity || current.current.clerk !== clerk) {
    current.current = { identity, clerk, version: current.current.version + 1 };
  }
  const owner = current.current;
  const mounted = useRef(true);
  useSafeLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const canRun = () =>
    mounted.current &&
    current.current === owner &&
    clerk.user?.id === userId &&
    clerk.session?.id === sessionId &&
    clerk.client?.id === clientId;

  return {
    requestKey: JSON.stringify([identity, owner.version]),
    canRun,
    initialEmailAddress,
    signInHref: clerk.buildUrlWithAuth(signInUrl),
    hasAfterJoinWaitlistUrl: Boolean(afterJoinWaitlistUrl),
    join: async (emailAddress, canContinue = () => true) => {
      if (!canRun() || !canContinue()) {
        return false;
      }
      await clerk.joinWaitlist({ emailAddress });
      return canRun() && canContinue();
    },
    navigateAfterJoin: (canContinue = () => true) => {
      if (afterJoinWaitlistUrl && canRun() && canContinue()) {
        void latestNavigate.current(afterJoinWaitlistUrl);
      }
    },
  };
}
