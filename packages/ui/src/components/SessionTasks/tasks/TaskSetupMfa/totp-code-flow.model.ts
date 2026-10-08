import { isClerkRuntimeError } from '@clerk/shared/error';
import { useClerk, useReverification, useSafeLayoutEffect, useSession, useUser } from '@clerk/shared/react';
import { useReducer, useRef } from 'react';

import type { TotpCodeFlowModel } from './totp-code-flow.types';

export const useTotpCodeFlowModel = (): TotpCodeFlowModel => {
  const clerk = useClerk();
  const { user } = useUser();
  const { session } = useSession();
  const userId = user?.id;
  const sessionId = session?.id;
  const clientId = clerk.client?.id;
  const identity = JSON.stringify([userId, sessionId, clientId]);
  const current = useRef({ identity, version: 0, clerk });
  const seed = useRef({ version: 0 });
  const backups = useRef<string[]>();
  const [, refresh] = useReducer((value: number) => value + 1, 0);
  if (current.current.identity !== identity || current.current.clerk !== clerk) {
    current.current = { identity, version: current.current.version + 1, clerk };
    seed.current = { version: seed.current.version + 1 };
    backups.current = undefined;
  }
  const owner = current.current;
  const mounted = useRef(true);
  useSafeLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      backups.current = undefined;
    };
  }, []);
  const canRun = () =>
    mounted.current &&
    current.current === owner &&
    !!userId &&
    clerk.user?.id === userId &&
    clerk.session?.id === sessionId &&
    clerk.client?.id === clientId;
  const createTOTP = useReverification((isCurrent: () => boolean) =>
    isCurrent() ? clerk.user?.createTOTP() : undefined,
  );
  const scopeKey = JSON.stringify([identity, owner.version]);
  const selectedSeed = seed.current;
  const canVerify = () => canRun() && seed.current === selectedSeed;
  return {
    scopeKey,
    canRun,
    backupCodes: backups.current?.slice(),
    creation: {
      scopeKey,
      canRun,
      canCreate: !!user,
      create: async (canContinue = () => true) => {
        const isCurrent = () => canRun() && canContinue();
        if (!isCurrent()) {
          return { status: 'stale' };
        }
        const requestSeed = { version: seed.current.version + 1 };
        seed.current = requestSeed;
        backups.current = undefined;
        const ownsSeed = () => isCurrent() && seed.current === requestSeed;
        try {
          const totp = await createTOTP(ownsSeed);
          if (!totp || !ownsSeed()) {
            return { status: 'stale' };
          }
          refresh();
          return { status: 'created', totp: { uri: totp.uri, secret: totp.secret } };
        } catch (error) {
          if (!ownsSeed()) {
            return { status: 'stale' };
          }
          if (isClerkRuntimeError(error) && error.code === 'reverification_cancelled') {
            return { status: 'cancelled' };
          }
          throw error;
        }
      },
    },
    verification: {
      scopeKey: JSON.stringify([scopeKey, selectedSeed.version]),
      canRun: canVerify,
      verifyCode: async (code, canContinue = () => true) => {
        const isCurrent = () => canVerify() && canContinue();
        if (!isCurrent()) {
          return false;
        }
        try {
          const totp = await clerk.user?.verifyTOTP({ code });
          if (!totp || !isCurrent()) {
            return false;
          }
          backups.current = totp.backupCodes?.slice();
          refresh();
          return true;
        } catch (error) {
          if (isCurrent()) {
            throw error;
          }
          return false;
        }
      },
    },
  };
};
