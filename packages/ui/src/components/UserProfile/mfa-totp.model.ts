import { isClerkRuntimeError } from '@clerk/shared/error';
import { useClerk, useReverification } from '@clerk/shared/react';
import type { TOTPResource } from '@clerk/shared/types';
import type { MutableRefObject } from 'react';
import { useReducer, useRef } from 'react';

import type { MfaTotpData, TotpSetupData } from './mfa-totp.types';
import { useProfileRequestScopeModel } from './profile-request-scope.model';

type LegacyRefs = {
  pendingTotpRef?: MutableRefObject<TOTPResource | undefined>;
  verifiedTotpRef?: MutableRefObject<TOTPResource | undefined>;
};

const setupData = (totp: Pick<TOTPResource, 'uri' | 'secret'> | undefined): TotpSetupData | undefined =>
  totp ? { uri: totp.uri, secret: totp.secret } : undefined;

export const useMfaTotpModel = ({ pendingTotpRef, verifiedTotpRef }: LegacyRefs = {}): MfaTotpData => {
  const clerk = useClerk();
  const scope = useProfileRequestScopeModel('profile-totp');
  const pendingTotp = useRef(setupData(pendingTotpRef?.current));
  const backupCodes = useRef(verifiedTotpRef?.current?.backupCodes?.slice());
  const pendingCreate = useRef<{ owner: object; promise: Promise<TotpSetupData | undefined> }>();
  const owner = useRef({ key: scope.requestKey, version: 0, pendingTotpRef, verifiedTotpRef });
  const [, refresh] = useReducer((value: number) => value + 1, 0);
  if (
    owner.current.key !== scope.requestKey ||
    owner.current.pendingTotpRef !== pendingTotpRef ||
    owner.current.verifiedTotpRef !== verifiedTotpRef
  ) {
    const sameAccount = owner.current.key === scope.requestKey;
    pendingTotp.current = sameAccount ? setupData(pendingTotpRef?.current) : undefined;
    backupCodes.current = sameAccount ? verifiedTotpRef?.current?.backupCodes?.slice() : undefined;
    if (!sameAccount) {
      if (pendingTotpRef) {
        pendingTotpRef.current = undefined;
      }
      if (verifiedTotpRef) {
        verifiedTotpRef.current = undefined;
      }
    }
    pendingCreate.current = undefined;
    owner.current = { key: scope.requestKey, version: owner.current.version + 1, pendingTotpRef, verifiedTotpRef };
  }
  const selectedOwner = owner.current;
  const canRun = () => scope.canRun() && owner.current === selectedOwner;
  const createTOTP = useReverification((isCurrent: () => boolean) =>
    isCurrent() ? clerk.user?.createTOTP() : undefined,
  );
  return {
    requestKey: JSON.stringify([scope.requestKey, selectedOwner.version]),
    canRun,
    setup: canRun() ? setupData(pendingTotp.current) : undefined,
    backupCodes: canRun() ? backupCodes.current?.slice() : undefined,
    createTOTP: () => {
      if (!canRun()) {
        return Promise.resolve(undefined);
      }
      if (pendingTotp.current) {
        return Promise.resolve(setupData(pendingTotp.current));
      }
      if (pendingCreate.current?.owner === selectedOwner) {
        return pendingCreate.current.promise;
      }
      const action = { owner: selectedOwner, promise: Promise.resolve<TotpSetupData | undefined>(undefined) };
      pendingCreate.current = action;
      action.promise = (async () => {
        try {
          const totp = await createTOTP(canRun);
          if (!totp || !canRun()) {
            return undefined;
          }
          pendingTotp.current = setupData(totp);
          if (pendingTotpRef) {
            pendingTotpRef.current = totp;
          }
          refresh();
          return setupData(totp);
        } catch (error) {
          if (canRun()) {
            throw error;
          }
          return undefined;
        } finally {
          if (pendingCreate.current === action) {
            pendingCreate.current = undefined;
          }
        }
      })();
      return action.promise;
    },
    verifyCode: async (code: string, canContinue?: () => boolean) => {
      const isCurrent = () => canRun() && (canContinue?.() ?? true);
      if (!isCurrent()) {
        return false;
      }
      try {
        const totp = await clerk.user?.verifyTOTP({ code });
        if (!totp || !isCurrent()) {
          return false;
        }
        backupCodes.current = totp.backupCodes?.slice();
        if (verifiedTotpRef) {
          verifiedTotpRef.current = totp;
        }
        refresh();
        return true;
      } catch (error) {
        if (isCurrent()) {
          throw error;
        }
        return false;
      }
    },
    isCancellation: error => isClerkRuntimeError(error) && error.code === 'reverification_cancelled',
  };
};
