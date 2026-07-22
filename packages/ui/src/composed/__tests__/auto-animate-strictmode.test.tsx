import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// The global vitest setup mocks @formkit/auto-animate to a no-op stub. Restore
// the real module for this file (and for Animated.tsx's transitive import) so
// the production useSafeAutoAnimate wiring actually runs.
vi.mock('@formkit/auto-animate', async importOriginal => await importOriginal());
vi.mock('@formkit/auto-animate/react', async importOriginal => await importOriginal());

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen } from '@/test/utils';

import { Animated } from '../../elements/Animated';

const { createFixtures } = bindCreateFixtures('UserProfile');

/**
 * Exercises the production <Animated> wrapper (which uses useSafeAutoAnimate)
 * under React StrictMode's mount → cleanup → remount cycle. StrictMode
 * double-invokes effects and re-runs ref callbacks; without the
 * destroy-previous-controller guard in useSafeAutoAnimate, a second
 * MutationObserver would linger on the same node and its remain() animation
 * would cancel the entrance (add) animation. We assert the user-facing outcome
 * (add fires, no remain) and that exactly one MutationObserver stays active on
 * the animated element after the cycle.
 */

type AnimateCall = Parameters<Element['animate']>;

function classifyAnimateCalls(calls: AnimateCall[]) {
  const adds: AnimateCall[] = [];
  const remains: AnimateCall[] = [];
  for (const call of calls) {
    const keyframes = call[0];
    if (!Array.isArray(keyframes)) {
      continue;
    }
    if (keyframes.some(kf => kf.opacity === 0 && typeof kf.transform === 'string' && kf.transform.includes('scale'))) {
      adds.push(call);
    }
    if (keyframes.some(kf => typeof kf.transform === 'string' && kf.transform.includes('translate'))) {
      remains.push(call);
    }
  }
  return { adds, remains };
}

function AnimatedList({ showChild }: { showChild: boolean }) {
  return (
    <Animated>
      <div>always here</div>
      {showChild ? <div data-testid='new-child'>new child</div> : null}
    </Animated>
  );
}

const flush = () => new Promise(resolve => setTimeout(resolve, 50));

describe('Animated under React StrictMode', () => {
  let animateSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    animateSpy = vi.spyOn(Element.prototype, 'animate').mockImplementation(
      () =>
        // SAFETY: The test only reads addEventListener/cancel/finished off the returned Animation; the rest of the interface is never touched, so a partial stub is sufficient.
        ({ addEventListener: vi.fn(), cancel: vi.fn(), finished: Promise.resolve() }) as unknown as Animation,
    );
  });

  afterEach(() => {
    animateSpy.mockRestore();
  });

  it('fires the add animation (and no remain) when a child is added', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });

    const { rerender } = render(
      <StrictMode>
        <AnimatedList showChild={false} />
      </StrictMode>,
      { wrapper },
    );

    await flush();
    animateSpy.mockClear();

    rerender(
      <StrictMode>
        <AnimatedList showChild />
      </StrictMode>,
    );

    await flush();

    const { adds, remains } = classifyAnimateCalls(animateSpy.mock.calls);
    expect(adds.length).toBeGreaterThanOrEqual(1);
    // remain() would only fire if a lingering second observer from the
    // StrictMode remount re-processed the mutation — the guard prevents it.
    expect(remains.length).toBe(0);
  });

  it('keeps exactly one active MutationObserver on the element after the StrictMode cycle', async () => {
    const activeChildListObservers = new Set<MutationObserver>();
    const targets = new WeakMap<MutationObserver, Node>();
    const origObserve = MutationObserver.prototype.observe;
    const origDisconnect = MutationObserver.prototype.disconnect;

    MutationObserver.prototype.observe = function (target: Node, options?: MutationObserverInit) {
      if (options?.childList) {
        activeChildListObservers.add(this);
        targets.set(this, target);
      }
      return origObserve.call(this, target, options);
    };
    MutationObserver.prototype.disconnect = function () {
      activeChildListObservers.delete(this);
      return origDisconnect.call(this);
    };

    try {
      const { wrapper } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });

      render(
        <StrictMode>
          <AnimatedList showChild={false} />
        </StrictMode>,
        { wrapper },
      );

      await flush();

      const el = screen.getByText('always here').parentElement;
      const activeOnEl = [...activeChildListObservers].filter(mo => targets.get(mo) === el).length;
      expect(activeOnEl).toBe(1);
    } finally {
      MutationObserver.prototype.observe = origObserve;
      MutationObserver.prototype.disconnect = origDisconnect;
    }
  });
});
