import { useCallback, useEffect, useMemo, useRef } from 'react';

import type { VerificationCodeCardProps } from '@/ui/elements/VerificationCodeCard';

import type {
  CodeSubmissionCommands,
  CodeVerificationCompletion,
  CodeVerificationRecovery,
} from './code-verification.types';

export const createCodeSubmissionAction = (
  attempt: (code: string) => Promise<CodeVerificationCompletion>,
  canRun: () => boolean = () => true,
  getErrorRecovery?: (error: unknown) => CodeVerificationRecovery | undefined,
): VerificationCodeCardProps['onCodeEntryFinishedAction'] => {
  let pending = false;
  return (code, resolve, reject) => {
    if (pending || !canRun()) {
      return;
    }
    pending = true;
    const run = async () => {
      try {
        const complete = await attempt(code);
        if (!canRun()) {
          return;
        }
        await resolve();
        if (canRun()) {
          await complete();
        }
      } catch (error) {
        if (!canRun()) {
          return;
        }
        const recovery = getErrorRecovery?.(error);
        if (recovery) {
          try {
            if (recovery.resolveCode) {
              await resolve();
            }
            if (canRun()) {
              await recovery.complete();
            }
          } catch (recoveryError) {
            if (canRun()) {
              await reject(recoveryError);
            }
          }
        } else {
          await reject(error);
        }
      } finally {
        pending = false;
      }
    };
    void run();
  };
};

export const useCodeSubmissionController = (model: CodeSubmissionCommands) => {
  const latest = useRef(model);
  latest.current = model;
  const scope = useRef({ key: model.requestKey, version: 0 });
  if (scope.current.key !== model.requestKey) {
    scope.current = { key: model.requestKey, version: scope.current.version + 1 };
  }
  const version = scope.current.version;
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const isCurrent = useCallback(
    () => mounted.current && scope.current.version === version && latest.current.canRun(),
    [version],
  );
  return useMemo(
    () =>
      createCodeSubmissionAction(
        code => latest.current.attempt(code),
        isCurrent,
        error => latest.current.getErrorRecovery?.(error),
      ),
    [isCurrent],
  );
};
