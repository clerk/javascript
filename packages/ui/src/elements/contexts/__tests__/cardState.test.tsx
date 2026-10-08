import type { ClerkAPIError } from '@clerk/shared/types';
import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { useCardState, withCardStateProvider } from '../index';

vi.mock('../../../customizables', () => ({
  useLocalizations: () => ({
    translateError: (e: ClerkAPIError | string | undefined) => (typeof e === 'string' ? e : (e?.code ?? '')),
  }),
}));

vi.mock('@/ui/router', () => ({
  useRouter: () => ({ currentPath: '/' }),
}));

const blocked: ClerkAPIError = {
  code: 'action_blocked',
  message: 'Action blocked',
  meta: { traceId: '7Q8ikxgt' },
};

const Provider = withCardStateProvider(({ children }: { children?: React.ReactNode }) => <>{children}</>);

const renderCard = () =>
  renderHook(() => useCardState(), {
    wrapper: ({ children }) => <Provider>{children}</Provider>,
  });

describe('card state keeps the raw error beside the translated one', () => {
  it('sets both', () => {
    const { result } = renderCard();
    act(() => result.current.setError(blocked));
    expect(result.current.rawError).toBe(blocked);
    expect(result.current.error).toBe('action_blocked');
  });

  it('clears both', () => {
    const { result } = renderCard();
    act(() => result.current.setError(blocked));
    act(() => result.current.setError(undefined));
    expect(result.current.rawError).toBeUndefined();
    expect(result.current.error).toBeUndefined();

    act(() => result.current.setError(blocked));
    act(() => result.current.setError(''));
    expect(result.current.rawError).toBeUndefined();
  });

  it('replaces both', () => {
    const { result } = renderCard();
    const incorrect: ClerkAPIError = { code: 'form_password_incorrect', message: 'nope' };
    act(() => result.current.setError(blocked));
    act(() => result.current.setError(incorrect));
    expect(result.current.rawError).toBe(incorrect);
    expect(result.current.error).toBe('form_password_incorrect');
  });
  it('does not let an old release clear a replacement request', () => {
    const { result } = renderCard();
    let releaseFirst: (() => void) | undefined;
    let releaseSecond: (() => void) | undefined;
    act(() => {
      releaseFirst = result.current.beginRequest();
    });
    act(() => releaseFirst?.());
    act(() => {
      releaseSecond = result.current.beginRequest();
    });
    act(() => releaseFirst?.());
    expect(result.current.isLoading).toBe(true);
    act(() => releaseSecond?.());
    expect(result.current.isLoading).toBe(false);
  });

  it('blocks an owned request after a legacy loading update before rendering', () => {
    const { result } = renderCard();
    let release: (() => void) | undefined;
    act(() => {
      result.current.setLoading();
      release = result.current.beginRequest();
    });
    expect(release).toBeUndefined();
    expect(result.current.isLoading).toBe(true);
    act(() => result.current.setIdle());
    expect(result.current.isLoading).toBe(false);
  });
});
