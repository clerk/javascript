import { describe, expect, it } from 'vitest';

import type { WizardFacts } from '../../data/deriveFacts';
import type { WizardStepId } from '../../types';
import { initialState, type MachineState, reduce } from '../reducer';

const baseFacts: WizardFacts = {
  hasConnection: false,
  isPrimaryEmailVerified: false,
  isDomainTakenByOtherOrg: false,
  hasMinimumIdPConfig: false,
  hasSuccessfulTestRun: false,
  isConnectionActive: false,
  provider: undefined,
};

const facts = (overrides: Partial<WizardFacts> = {}): WizardFacts => ({ ...baseFacts, ...overrides });

const stateAt = (current: WizardStepId, history: WizardStepId[] = [current]): MachineState => ({
  current,
  direction: 0,
  history,
});

describe('reduce', () => {
  describe('NEXT', () => {
    it('advances to the next non-fulfilled enabled step', () => {
      // No connection, nothing fulfilled: select-provider → verify-domain.
      const next = reduce(stateAt('select-provider'), { type: 'NEXT' }, facts());
      expect(next.current).toBe('verify-domain');
      expect(next.direction).toBe(1);
      expect(next.history).toEqual(['select-provider', 'verify-domain']);
    });

    it('skips a fulfilled step when walking forward (verified email skips verify-domain)', () => {
      // Verified email fulfills verify-domain → NEXT from select-provider lands
      // on configure, skipping verify-domain entirely.
      const next = reduce(stateAt('select-provider'), { type: 'NEXT' }, facts({ isPrimaryEmailVerified: true }));
      expect(next.current).toBe('configure');
      expect(next.history).toEqual(['select-provider', 'configure']);
    });

    it('skips multiple fulfilled steps in a row', () => {
      // verify-domain + configure fulfilled → NEXT from select-provider → test.
      const next = reduce(
        stateAt('select-provider'),
        { type: 'NEXT' },
        facts({ isPrimaryEmailVerified: true, hasMinimumIdPConfig: true }),
      );
      expect(next.current).toBe('test');
    });

    it('stays put when nothing non-fulfilled is ahead', () => {
      const start = stateAt('test');
      const next = reduce(start, { type: 'NEXT' }, facts({ isPrimaryEmailVerified: true }));
      // confirmation is the only step after test and it is never fulfilled, so
      // NEXT advances to it.
      expect(next.current).toBe('confirmation');
      // From confirmation (last step) NEXT is a no-op.
      expect(reduce(next, { type: 'NEXT' }, facts({ isPrimaryEmailVerified: true }))).toBe(next);
    });
  });

  describe('BACK', () => {
    it('pops history to the second-to-last entry', () => {
      const start = stateAt('configure', ['select-provider', 'verify-domain', 'configure']);
      const back = reduce(start, { type: 'BACK' }, facts());
      expect(back.current).toBe('verify-domain');
      expect(back.direction).toBe(-1);
      expect(back.history).toEqual(['select-provider', 'verify-domain']);
    });

    it('is a no-op when there is no history to pop', () => {
      const start = stateAt('select-provider');
      expect(reduce(start, { type: 'BACK' }, facts())).toBe(start);
    });

    it('round-trips NEXT then BACK', () => {
      const start = stateAt('select-provider');
      const forward = reduce(start, { type: 'NEXT' }, facts());
      const back = reduce(forward, { type: 'BACK' }, facts());
      expect(back.current).toBe('select-provider');
      expect(back.history).toEqual(['select-provider']);
    });
  });

  describe('GOTO', () => {
    it('jumps to an enabled step even when it is fulfilled (ignores fulfilled)', () => {
      // verify-domain is fulfilled by a verified email, but GOTO still lands on it.
      const start = stateAt('configure', ['select-provider', 'configure']);
      const goto = reduce(start, { type: 'GOTO', step: 'verify-domain' }, facts({ isPrimaryEmailVerified: true }));
      expect(goto.current).toBe('verify-domain');
      expect(goto.direction).toBe(0);
      expect(goto.history).toEqual(['select-provider', 'configure', 'verify-domain']);
    });

    it('is a no-op when the target step is not enabled', () => {
      // select-provider is disabled once a connection exists.
      const start = stateAt('configure', ['configure']);
      expect(reduce(start, { type: 'GOTO', step: 'select-provider' }, facts({ hasConnection: true }))).toBe(start);
    });

    it('is a no-op when the target is already current', () => {
      const start = stateAt('configure', ['configure']);
      expect(reduce(start, { type: 'GOTO', step: 'configure' }, facts())).toBe(start);
    });
  });

  describe('RESET', () => {
    it('returns to select-provider and force-enables it even when hasConnection is still true', () => {
      // After a delete the facts have not refetched yet, so hasConnection is
      // stale-true; RESET must still land on select-provider.
      const start = stateAt('confirmation', ['verify-domain', 'configure', 'test', 'confirmation']);
      const reset = reduce(start, { type: 'RESET' }, facts({ hasConnection: true, isConnectionActive: true }));
      expect(reset.current).toBe('select-provider');
      expect(reset.direction).toBe(0);
      expect(reset.history).toEqual(['select-provider']);
    });
  });
});

describe('initialState', () => {
  const cases: Array<{ name: string; input: Partial<WizardFacts>; expected: WizardStepId }> = [
    {
      name: 'no connection → select-provider',
      input: {},
      expected: 'select-provider',
    },
    {
      name: 'domain taken by other org → verify-domain',
      input: { hasConnection: true, isPrimaryEmailVerified: true, isDomainTakenByOtherOrg: true },
      expected: 'verify-domain',
    },
    {
      name: 'connection, verified, not configured → configure',
      input: { hasConnection: true, isPrimaryEmailVerified: true },
      expected: 'configure',
    },
    {
      name: 'connection, verified, configured, not tested → test',
      input: { hasConnection: true, isPrimaryEmailVerified: true, hasMinimumIdPConfig: true },
      expected: 'test',
    },
    {
      name: 'connection, verified, configured, tested (active) → confirmation',
      input: {
        hasConnection: true,
        isPrimaryEmailVerified: true,
        hasMinimumIdPConfig: true,
        hasSuccessfulTestRun: true,
        isConnectionActive: true,
      },
      expected: 'confirmation',
    },
  ];

  it.each(cases)('$name', ({ input, expected }) => {
    const s = initialState(facts(input));
    expect(s.current).toBe(expected);
    expect(s.history).toEqual([expected]);
    expect(s.direction).toBe(0);
  });
});
