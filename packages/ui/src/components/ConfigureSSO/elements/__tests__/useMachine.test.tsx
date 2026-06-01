import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { WizardFacts } from '../../data/deriveFacts';
import { useMachine } from '../useMachine';

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

describe('useMachine', () => {
  it('seeds the current step from initialState(facts)', () => {
    // Verified email fulfills verify-domain → mounts on select-provider.
    const { result } = renderHook(() => useMachine(facts({ isPrimaryEmailVerified: true })));
    expect(result.current.current).toBe('select-provider');
    expect(result.current.direction).toBe(0);
  });

  it('mounts on verify-domain when the email is unverified', () => {
    const { result } = renderHook(() => useMachine(facts()));
    expect(result.current.current).toBe('verify-domain');
  });

  it('advances on NEXT against the latest facts', () => {
    const { result } = renderHook(() => useMachine(facts({ isPrimaryEmailVerified: true })));
    expect(result.current.current).toBe('select-provider');

    act(() => {
      result.current.dispatch({ type: 'NEXT' });
    });

    expect(result.current.current).toBe('configure');
    expect(result.current.direction).toBe(1);
  });

  it('reduces against fresh facts after a rerender (no stale closure)', () => {
    // Start on verify-domain (always enabled), unverified email.
    const { result, rerender } = renderHook(({ f }: { f: WizardFacts }) => useMachine(f), {
      initialProps: { f: facts() },
    });
    expect(result.current.current).toBe('verify-domain');

    // Facts change underneath: email now verified (verify-domain fulfilled),
    // a connection exists (select-provider disabled), and it's configured
    // (configure fulfilled). NEXT from verify-domain must therefore skip ahead
    // to `test`. This only lands correctly if dispatch reads the NEW facts, not
    // the ones captured when dispatch was first created.
    rerender({ f: facts({ isPrimaryEmailVerified: true, hasConnection: true, hasMinimumIdPConfig: true }) });

    act(() => {
      result.current.dispatch({ type: 'NEXT' });
    });

    expect(result.current.current).toBe('test');
  });

  it('keeps dispatch identity stable across facts changes', () => {
    const { result, rerender } = renderHook(({ f }: { f: WizardFacts }) => useMachine(f), {
      initialProps: { f: facts({ isPrimaryEmailVerified: true }) },
    });
    const firstDispatch = result.current.dispatch;

    rerender({ f: facts({ isPrimaryEmailVerified: true, hasConnection: true }) });

    expect(result.current.dispatch).toBe(firstDispatch);
  });

  it('GOTO jumps and RESET returns to select-provider', () => {
    const { result } = renderHook(() => useMachine(facts({ isPrimaryEmailVerified: true })));

    act(() => {
      result.current.dispatch({ type: 'GOTO', step: 'configure' });
    });
    expect(result.current.current).toBe('configure');

    act(() => {
      // Stale-true hasConnection must not keep select-provider disabled on RESET.
      result.current.dispatch({ type: 'RESET' });
    });
    expect(result.current.current).toBe('select-provider');
  });
});
