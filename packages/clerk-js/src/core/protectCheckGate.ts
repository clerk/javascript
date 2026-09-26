import type { ProtectCheckFlow, SignInResource, SignUpResource } from '@clerk/shared/types';

import type { Clerk } from './resources/internal';

/**
 * Resolves a pending `protect_check` on a sign-in or sign-up resource by opening Clerk's Protect
 * modal and waiting for the challenge to clear. One resolution runs at a time. A call on the same
 * resource shares it, and a call on another resource waits for it before resolving its own gate.
 * Skips the proof submission, which belongs to whatever runs the challenge, flows a prebuilt
 * component has registered for, and no-RHC builds where the challenge script must not be loaded.
 */
export class ProtectCheckGate {
  private static instance: ProtectCheckGate;

  private inflight: { resourceId: string | undefined; promise: Promise<void> } | null = null;

  public static getInstance(): ProtectCheckGate {
    if (!ProtectCheckGate.instance) {
      ProtectCheckGate.instance = new ProtectCheckGate();
    }
    return ProtectCheckGate.instance;
  }

  public async resolve(
    clerk: Clerk,
    flow: ProtectCheckFlow,
    resource: SignInResource | SignUpResource,
    action?: string,
  ): Promise<void> {
    if (__BUILD_DISABLE_RHC__ || action === 'protect_check') {
      return;
    }
    while (this.inflight) {
      if (this.inflight.resourceId === resource.id) {
        return this.inflight.promise;
      }
      await this.inflight.promise.catch(() => {});
    }
    if (!resource.protectCheck || clerk.__internal_hasProtectCheckHandler(flow)) {
      return;
    }
    const promise = clerk.__internal_openProtectCheckModal({ resource }).finally(() => {
      this.inflight = null;
    });
    this.inflight = { resourceId: resource.id, promise };
    await promise;
  }
}
