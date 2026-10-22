import type { Instances } from '../src/core/instances/instances.ts';
import type { ApplicationView, InstanceView } from '../src/core/types.ts';
import type { Workspace } from '../src/core/workspace.ts';

export const HELD: InstanceView = { id: 'app_held', name: 'verify-throwaway-held', created: false, settings: 'standard' };

export interface FakeHeld {
  readonly finish?: (ledger: Workspace, options: { readonly keepApplications: boolean }) => Promise<readonly ApplicationView[]>;
}

export function heldInstances(fake: FakeHeld = {}): Instances {
  const notDriving = (): never => {
    throw new Error('this test drives no run, and something asked for the applied instance');
  };
  return {
    access: async () => 'a test',
    recordedKey: () => null,
    ensure: async () => [HELD],
    apply: async () => notDriving(),
    keys: notDriving,
    clerk: notDriving,
    stopDriving: async () => undefined,
    finish: async (ledger, options) => (await fake.finish?.(ledger, options)) ?? [],
    doctorChecks: async () => [],
  };
}
