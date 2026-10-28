import type { ProtectLoader } from '@clerk/shared/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Protect } from '../protect';
import { __internal_resetProtectStorage } from '../protectSession';
import type { Environment } from '../resources';

const environment = (loaders: unknown[]): Environment => ({ protectConfig: { loaders } }) as unknown as Environment;

/** No `src`, so jsdom does not fetch a real URL and race the assertions here. */
const loader = (overrides: Partial<ProtectLoader> = {}): ProtectLoader => ({
  target: 'head',
  type: 'script',
  ...overrides,
});

describe('Protect.challengeLoadTimeoutMs', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    __internal_resetProtectStorage();
    vi.restoreAllMocks();
  });

  it('is undefined when no loader asks for one, so the caller falls back', () => {
    const protect = new Protect();
    protect.load(environment([loader()]));

    expect(protect.challengeLoadTimeoutMs).toBeUndefined();
  });

  it('reports the value from the loader this browser was assigned', () => {
    const protect = new Protect();
    protect.load(environment([loader({ challenge_load_timeout_ms: 25_000 })]));

    expect(protect.challengeLoadTimeoutMs).toBe(25_000);
  });

  // The whole point of putting it on the loader: while a new loader ramps, two are live for the
  // same instance, and only the one this browser actually got may speak for it.
  it('ignores a loader the rollout dice excluded', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9);

    const protect = new Protect();
    protect.load(
      environment([
        // A 10% ramp, excluded at random() 0.9.
        loader({ rollout: 0.1, challenge_load_timeout_ms: 25_000 }),
        // The incumbent, which this browser does get.
        loader({ challenge_load_timeout_ms: 45_000 }),
      ]),
    );

    expect(protect.challengeLoadTimeoutMs).toBe(45_000);
  });

  it('reports the ramping loader once the dice include it', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.01);

    const protect = new Protect();
    protect.load(environment([loader({ rollout: 0.1, challenge_load_timeout_ms: 25_000 }), loader()]));

    expect(protect.challengeLoadTimeoutMs).toBe(25_000);
  });

  it('ignores a non-positive, non-finite, or non-numeric value rather than passing it on', () => {
    const protect = new Protect();
    protect.load(
      environment([
        loader({ challenge_load_timeout_ms: 0 }),
        loader({ challenge_load_timeout_ms: Number.POSITIVE_INFINITY }),
        loader({ challenge_load_timeout_ms: 'soon' as unknown as number }),
      ]),
    );

    expect(protect.challengeLoadTimeoutMs).toBeUndefined();
  });

  it('reports the first finite, positive value from the applied loaders', () => {
    const protect = new Protect();
    protect.load(
      environment([
        loader({ challenge_load_timeout_ms: 0 }),
        loader({ challenge_load_timeout_ms: 25_000 }),
        loader({ challenge_load_timeout_ms: 45_000 }),
      ]),
    );

    expect(protect.challengeLoadTimeoutMs).toBe(25_000);
  });
});
