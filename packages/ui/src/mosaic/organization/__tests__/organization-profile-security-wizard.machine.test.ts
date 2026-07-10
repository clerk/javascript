import { describe, expect, it } from 'vitest';

import { createActor } from '../../machine/createActor';
import type { OrganizationProfileSecurityWizardContext } from '../organization-profile-security-wizard.machine';
import {
  isSecurityWizardStepComplete,
  organizationProfileSecurityWizardMachine,
} from '../organization-profile-security-wizard.machine';

type Reach = Partial<
  Pick<
    OrganizationProfileSecurityWizardContext,
    'allDomainsVerified' | 'hasConnection' | 'hasMinimumConfiguration' | 'isActive' | 'hasSuccessfulTestRun'
  >
>;

const ALL_REACHABLE: Reach = {
  allDomainsVerified: true,
  hasConnection: true,
  hasMinimumConfiguration: true,
  isActive: true,
  hasSuccessfulTestRun: true,
};

/** Start an actor from its derived initial step, with the given reachability context. */
const startFrom = (reach: Reach) => {
  const actor = createActor(organizationProfileSecurityWizardMachine, { context: reach });
  actor.start();
  return actor;
};

/** Teleport an actor to a specific step (inert), with the given reachability context. */
const actorAt = (value: string, reach: Reach) =>
  createActor(organizationProfileSecurityWizardMachine, { context: reach, snapshot: { value } });

describe('organizationProfileSecurityWizardMachine — derived initial (furthest reachable)', () => {
  it('nothing reachable → verify-domain', () => {
    expect(startFrom({}).getSnapshot().value).toBe('verify-domain');
  });

  it('domains verified → configure', () => {
    expect(startFrom({ allDomainsVerified: true }).getSnapshot().value).toBe('configure');
  });

  it('configured → test', () => {
    expect(
      startFrom({ allDomainsVerified: true, hasConnection: true, hasMinimumConfiguration: true }).getSnapshot().value,
    ).toBe('test');
  });

  it('active connection → activate (last step)', () => {
    expect(startFrom(ALL_REACHABLE).getSnapshot().value).toBe('activate');
  });

  it('stops at the first closed gate (configured but no successful test run → test)', () => {
    expect(
      startFrom({
        allDomainsVerified: true,
        hasConnection: true,
        hasMinimumConfiguration: true,
        hasSuccessfulTestRun: false,
      }).getSnapshot().value,
    ).toBe('test');
  });

  it('seeds direction 0 and hasNavigated false', () => {
    const snap = startFrom({ allDomainsVerified: true }).getSnapshot();
    expect(snap.context.direction).toBe(0);
    expect(snap.context.hasNavigated).toBe(false);
  });
});

describe('organizationProfileSecurityWizardMachine — sequential NEXT/PREV/GOTO', () => {
  it('advances one slot when the next guard holds', () => {
    const actor = actorAt('verify-domain', ALL_REACHABLE);
    actor.send({ type: 'NEXT' });
    const snap = actor.getSnapshot();
    expect(snap.value).toBe('configure');
    expect(snap.context.direction).toBe(1);
    expect(snap.context.hasNavigated).toBe(true);
  });

  it('does not skip a satisfied step (verify-domain → configure, not test)', () => {
    const actor = actorAt('verify-domain', ALL_REACHABLE);
    actor.send({ type: 'NEXT' });
    expect(actor.getSnapshot().value).toBe('configure');
  });

  it('walks one slot back on PREV', () => {
    const actor = actorAt('test', ALL_REACHABLE);
    actor.send({ type: 'PREV' });
    const snap = actor.getSnapshot();
    expect(snap.value).toBe('configure');
    expect(snap.context.direction).toBe(-1);
  });

  it('GOTO jumps to a reachable target', () => {
    const actor = actorAt('verify-domain', ALL_REACHABLE);
    actor.send({ type: 'GOTO', step: 'test' });
    expect(actor.getSnapshot().value).toBe('test');
    expect(actor.getSnapshot().context.direction).toBe(0);
  });
});

describe('organizationProfileSecurityWizardMachine — no-op identity (same ref, no notify)', () => {
  const expectNoOp = (value: string, reach: Reach, event: { type: 'NEXT' | 'PREV' | 'GOTO'; step?: string }) => {
    const actor = actorAt(value, reach);
    const before = actor.getSnapshot();
    const seen: string[] = [];
    actor.subscribe(s => seen.push(s.value));
    // @ts-expect-error GOTO needs step; the others don't — fine for the test call
    actor.send(event);
    expect(actor.getSnapshot()).toBe(before);
    expect(seen).toEqual([]);
  };

  it('NEXT at the terminal step is a no-op', () => {
    expectNoOp('activate', ALL_REACHABLE, { type: 'NEXT' });
  });

  it('PREV at the first step is a no-op', () => {
    expectNoOp('verify-domain', ALL_REACHABLE, { type: 'PREV' });
  });

  it('GOTO to an unreachable target is a no-op', () => {
    // No connection/domains → configure/test/activate all closed.
    expectNoOp('verify-domain', {}, { type: 'GOTO', step: 'activate' });
  });

  it('GOTO to the current step is a no-op', () => {
    expectNoOp('verify-domain', ALL_REACHABLE, { type: 'GOTO', step: 'verify-domain' });
  });
});

describe('organizationProfileSecurityWizardMachine — recheck re-seats when a guard breaks', () => {
  it('re-seats to the furthest still-reachable step when the current step becomes unreachable', () => {
    const actor = actorAt('test', { allDomainsVerified: true, hasConnection: true, hasMinimumConfiguration: true });
    expect(actor.getSnapshot().value).toBe('test');

    // The connection backing `test` is removed elsewhere, but the domains stay verified,
    // so `configure` is still reachable — re-seat there, not all the way back.
    actor.setContext({ hasConnection: false, hasMinimumConfiguration: false });
    actor.recheck();
    expect(actor.getSnapshot().value).toBe('configure');
  });

  it('re-seats all the way to verify-domain when every later guard breaks', () => {
    const actor = actorAt('configure', { allDomainsVerified: true, hasConnection: true });
    expect(actor.getSnapshot().value).toBe('configure');

    actor.setContext({ allDomainsVerified: false, hasConnection: false });
    actor.recheck();
    expect(actor.getSnapshot().value).toBe('verify-domain');
  });
});

describe('organizationProfileSecurityWizardMachine — deferred advance (parked NEXT resolved by recheck)', () => {
  it('parks a NEXT blocked by a not-yet-open guard, then advances when data lands', () => {
    // On verify-domain with nothing reachable: NEXT to configure is blocked.
    const actor = actorAt('verify-domain', {});
    actor.send({ type: 'NEXT' });
    expect(actor.getSnapshot().value).toBe('verify-domain');
    expect(actor.getSnapshot().context.pendingNext).toBe(true);

    // The awaited create/verify revalidate lands; the controller reseats context + rechecks.
    actor.setContext({ allDomainsVerified: true });
    actor.recheck();
    expect(actor.getSnapshot().value).toBe('configure');
    expect(actor.getSnapshot().context.pendingNext).toBe(false);
    expect(actor.getSnapshot().context.direction).toBe(1);
  });

  it('an explicit GOTO abandons a parked advance', () => {
    const actor = actorAt('verify-domain', {
      allDomainsVerified: true,
      hasConnection: true,
      hasMinimumConfiguration: true,
    });
    // configure is reachable, so NEXT advances immediately — park a blocked one instead:
    const blocked = actorAt('verify-domain', {});
    blocked.send({ type: 'NEXT' });
    expect(blocked.getSnapshot().context.pendingNext).toBe(true);
    blocked.setContext({ allDomainsVerified: true });
    // A GOTO clears the parked advance (navigated(0) resets pendingNext) before recheck.
    blocked.send({ type: 'GOTO', step: 'configure' });
    expect(blocked.getSnapshot().value).toBe('configure');
    expect(blocked.getSnapshot().context.pendingNext).toBe(false);
    // sanity: `actor` above just confirms a direct reachable NEXT path exists
    actor.send({ type: 'NEXT' });
    expect(actor.getSnapshot().value).toBe('configure');
  });

  it('an explicit PREV abandons a parked advance (legacy goPrev clears pendingNextFrom)', () => {
    // On configure (reachable) with `test` still closed: NEXT parks.
    const actor = actorAt('configure', { allDomainsVerified: true, hasConnection: true });
    actor.send({ type: 'NEXT' });
    expect(actor.getSnapshot().value).toBe('configure');
    expect(actor.getSnapshot().context.pendingNext).toBe(true);

    // Back out. The parked advance must be abandoned (navigated(-1) clears pendingNext).
    actor.send({ type: 'PREV' });
    expect(actor.getSnapshot().value).toBe('verify-domain');
    expect(actor.getSnapshot().context.pendingNext).toBe(false);

    // And it must NOT resurrect once `test` later opens — the user chose to step back.
    actor.setContext({ hasMinimumConfiguration: true });
    actor.recheck();
    expect(actor.getSnapshot().value).toBe('verify-domain');
  });

  it('keeps a parked advance across a recheck where the guard is still closed, then resolves on a later one', () => {
    const actor = actorAt('verify-domain', {});
    actor.send({ type: 'NEXT' });
    expect(actor.getSnapshot().context.pendingNext).toBe(true);

    // Data has not landed yet: an intermediate recheck must NOT drop the park
    // (legacy: "keeps a pending advance across an intermediate render where isReachable is still unmet").
    actor.recheck();
    expect(actor.getSnapshot().value).toBe('verify-domain');
    expect(actor.getSnapshot().context.pendingNext).toBe(true);

    // The awaited revalidate finally lands.
    actor.setContext({ allDomainsVerified: true });
    actor.recheck();
    expect(actor.getSnapshot().value).toBe('configure');
    expect(actor.getSnapshot().context.pendingNext).toBe(false);
  });
});

describe('organizationProfileSecurityWizardMachine — recheck clamp edge behaviors (1:1 with the legacy render-phase clamp)', () => {
  it('does not yank the user forward when the current step still holds (a later guard opening is not an auto-advance)', () => {
    // On configure with domains verified + a connection; the user has NOT pressed Next.
    const actor = actorAt('configure', { allDomainsVerified: true, hasConnection: true });
    expect(actor.getSnapshot().value).toBe('configure');

    // `test` becomes reachable (minimum config saved) — but recheck only clamps a
    // broken step, it never advances a still-valid one (legacy: "does NOT move when an
    // isReachable goes TRUE while the active step still holds").
    actor.setContext({ hasMinimumConfiguration: true });
    actor.recheck();
    expect(actor.getSnapshot().value).toBe('configure');
  });

  it('is a provable one-shot: a second recheck with the same context does not re-seat or re-notify', () => {
    const actor = actorAt('test', { allDomainsVerified: true, hasConnection: true, hasMinimumConfiguration: true });
    // The connection backing `test`/`configure` is deleted; `configure` survives on verified domains.
    actor.setContext({ hasConnection: false, hasMinimumConfiguration: false });
    actor.recheck();
    expect(actor.getSnapshot().value).toBe('configure');

    const settled = actor.getSnapshot();
    const seen: string[] = [];
    actor.subscribe(s => seen.push(s.value));
    actor.recheck();
    expect(actor.getSnapshot()).toBe(settled); // same ref — no second re-seat
    expect(seen).toEqual([]); // and no notify
  });
});

describe('isSecurityWizardStepComplete — position-independent completion (legacy isComplete predicates)', () => {
  const ctx = (over: Partial<OrganizationProfileSecurityWizardContext>): OrganizationProfileSecurityWizardContext => ({
    direction: 0,
    hasNavigated: false,
    pendingNext: false,
    allDomainsVerified: false,
    hasConnection: false,
    hasMinimumConfiguration: false,
    isActive: false,
    hasSuccessfulTestRun: false,
    ...over,
  });

  it('marks each step complete from its own predicate, regardless of the current step', () => {
    const c = ctx({ allDomainsVerified: true, hasMinimumConfiguration: true });
    expect(isSecurityWizardStepComplete('verify-domain', c)).toBe(true);
    expect(isSecurityWizardStepComplete('configure', c)).toBe(true);
    expect(isSecurityWizardStepComplete('test', c)).toBe(false);
    expect(isSecurityWizardStepComplete('activate', c)).toBe(false);
  });

  it('an active connection keeps configure/test/activate ticked (stays complete after a back-nav)', () => {
    const c = ctx({ allDomainsVerified: true, isActive: true });
    expect(isSecurityWizardStepComplete('configure', c)).toBe(true);
    expect(isSecurityWizardStepComplete('test', c)).toBe(true);
    expect(isSecurityWizardStepComplete('activate', c)).toBe(true);
  });

  it('a successful test run completes test without an active connection', () => {
    const c = ctx({ hasSuccessfulTestRun: true });
    expect(isSecurityWizardStepComplete('test', c)).toBe(true);
    expect(isSecurityWizardStepComplete('activate', c)).toBe(false);
  });
});
