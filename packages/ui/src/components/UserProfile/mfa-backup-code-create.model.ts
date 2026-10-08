import { isReverificationCancelledError } from '@clerk/shared/error';
import { useClerk, useReverification } from '@clerk/shared/react';
import { useReducer, useRef } from 'react';

import type { FormProps } from '@/ui/elements/FormContainer';

import { useProfileRequestScopeModel } from './profile-request-scope.model';

export type MfaBackupCodeCreateFormProps = FormProps;

export const useMfaBackupCodeCreateModel = () => {
  const clerk = useClerk();
  const scope = useProfileRequestScopeModel('profile-backup-code-create');
  const data = useRef<{ key: string; codes?: string[] }>({ key: scope.requestKey });
  const pending = useRef<Promise<{ codes: string[] } | undefined>>();
  const [, refresh] = useReducer((value: number) => value + 1, 0);
  if (data.current.key !== scope.requestKey) {
    data.current = { key: scope.requestKey };
    pending.current = undefined;
  }
  const owner = data.current;
  const canRun = () => scope.canRun() && data.current === owner;
  const createBackupCode = useReverification((isCurrent: () => boolean) =>
    isCurrent() ? clerk.user?.createBackupCode() : undefined,
  );

  return {
    requestKey: scope.requestKey,
    canRun,
    backupCode: canRun() && owner.codes ? { codes: owner.codes.slice() } : undefined,
    createBackupCodeData: () => {
      if (!canRun()) {
        return Promise.resolve(undefined);
      }
      if (owner.codes) {
        return Promise.resolve({ codes: owner.codes.slice() });
      }
      if (pending.current) {
        return pending.current;
      }
      const request = (async () => {
        try {
          const backupCode = await createBackupCode(canRun);
          if (!backupCode || !canRun()) {
            return undefined;
          }
          owner.codes = backupCode.codes.slice();
          refresh();
          return { codes: owner.codes.slice() };
        } catch (error) {
          if (canRun()) {
            throw error;
          }
          return undefined;
        } finally {
          if (data.current === owner) {
            pending.current = undefined;
          }
        }
      })();
      pending.current = request;
      return request;
    },
    isCancellation: isReverificationCancelledError,
  };
};
