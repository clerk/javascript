import type { SignInResource, SignUpResource } from '@clerk/shared/types';

import type { Clerk } from './resources/internal';

/**
 * Resolves a pending `protect_check` on a sign-in or sign-up resource by opening Clerk's Protect
 * modal and waiting for the challenge to clear. Skips when a prebuilt component has registered as
 * the handler, when a resolution is already in flight, or in no-RHC builds where the challenge
 * script must not be loaded.
 */
export class ProtectCheckGate {
  private static instance: ProtectCheckGate;

  private inflight: Promise<void> | null = null;

  public static getInstance(): ProtectCheckGate {
    if (!ProtectCheckGate.instance) {
      ProtectCheckGate.instance = new ProtectCheckGate();
    }
    return ProtectCheckGate.instance;
  }

  public async resolve(clerk: Clerk, resource: SignInResource | SignUpResource): Promise<void> {
    if (__BUILD_DISABLE_RHC__ || !resource.protectCheck || this.inflight || clerk.__internal_hasProtectCheckHandler) {
      return;
    }
    this.inflight = clerk.__internal_openProtectCheckModal({ resource }).finally(() => {
      this.inflight = null;
    });
    await this.inflight;
  }
}
