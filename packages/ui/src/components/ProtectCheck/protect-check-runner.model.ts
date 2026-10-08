import type { ProtectCheckResource } from '@clerk/shared/types';

import type { ProtectCheckRunnerParams } from './protect-check-runner.types';

type ProtectCheckSource<T> = {
  protectCheck: ProtectCheckResource | null | undefined;
  reload: () => Promise<unknown>;
  submitProtectCheck: (params: { proofToken: string }) => Promise<T>;
};

export const createProtectCheckRunnerModel = <T extends ProtectCheckSource<T>>(
  resource: T,
  complete: (resolved: T, isCancelled: () => boolean) => Promise<unknown>,
): ProtectCheckRunnerParams => ({
  getProtectCheck: () => {
    const check = resource.protectCheck;
    return check
      ? {
          status: check.status,
          token: check.token,
          sdkUrl: check.sdkUrl,
          expiresAt: check.expiresAt,
          uiHints: check.uiHints ? { ...check.uiHints } : undefined,
        }
      : check;
  },
  getCompletion: () => isCancelled => complete(resource, isCancelled),
  reload: async () => {
    await resource.reload();
  },
  submitProof: async proofToken => {
    const resolved = await resource.submitProtectCheck({ proofToken });
    return isCancelled => complete(resolved, isCancelled);
  },
});
