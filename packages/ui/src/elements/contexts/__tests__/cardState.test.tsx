import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { useCardState, withCardStateProvider } from '../index';

// The localization layer is not what these assertions are about; translateError
// just needs to hand back something.
vi.mock('../../../customizables', () => ({
  useLocalizations: () => ({ translateError: (e: any) => (typeof e === 'string' ? e : (e?.code ?? '')) }),
}));

// The provider reads the router only to re-surface Clerk's last error on
// navigation, which is not what these assertions are about.
vi.mock('@/ui/router', () => ({
  useRouter: () => ({ currentPath: '/' }),
}));

const blocked = {
  code: 'action_blocked',
  message: 'Action blocked',
  meta: { traceId: '7Q8ikxgt' },
};

const wrapper = withCardStateProvider(({ children }: { children?: React.ReactNode }) => <>{children}</>);

const renderCard = () =>
  renderHook(() => useCardState(), {
    wrapper: ({ children }) => React.createElement(wrapper as any, null, children),
  });

describe('card state, blocked requests', () => {
  it('sets blockedDetails and clears the inline error', () => {
    const { result } = renderCard();
    act(() => result.current.setError(blocked as any));
    expect(result.current.blockedDetails).toEqual({ traceId: '7Q8ikxgt' });
    expect(result.current.error).toBeUndefined();
  });

  // The blocked screen must not LATCH. Every caller that clears an error passes
  // undefined or '' first — handleClerkApiError does, and so does the
  // protect-check runner — so a card that had once been blocked would otherwise
  // never show anything again, including the next real error.
  it('clears blockedDetails when the error is cleared', () => {
    const { result } = renderCard();
    act(() => result.current.setError(blocked as any));
    expect(result.current.blockedDetails).toBeTruthy();

    act(() => result.current.setError(undefined as any));
    expect(result.current.blockedDetails).toBeUndefined();
  });

  it('clears blockedDetails when a different error replaces it', () => {
    const { result } = renderCard();
    act(() => result.current.setError(blocked as any));
    expect(result.current.blockedDetails).toBeTruthy();

    act(() => result.current.setError({ code: 'form_password_incorrect', message: 'nope' } as any));
    expect(result.current.blockedDetails).toBeUndefined();
    expect(result.current.error).toBe('form_password_incorrect');
  });

  it('leaves a normal error alone', () => {
    const { result } = renderCard();
    act(() => result.current.setError('something went wrong'));
    expect(result.current.blockedDetails).toBeUndefined();
    expect(result.current.error).toBe('something went wrong');
  });

  // A blocked request from an older backend carries no meta, so it must fall
  // through to the inline error rather than taking over the screen with nothing
  // on it.
  it('ignores a blocked error with no details', () => {
    const { result } = renderCard();
    act(() => result.current.setError({ code: 'action_blocked', message: 'Action blocked' } as any));
    expect(result.current.blockedDetails).toBeUndefined();
    expect(result.current.error).toBe('action_blocked');
  });
});
